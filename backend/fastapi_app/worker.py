"""
Celery worker and task definitions.
Handles async job matching pipeline execution.
"""
import os
import sys
from pathlib import Path
from typing import Dict, Any, List
import traceback

# Add backend and AI roots to path
BACKEND_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_DIR.parent if BACKEND_DIR.name == "backend" else BACKEND_DIR
AI_DIR = PROJECT_ROOT / "ai"
for path in (BACKEND_DIR, PROJECT_ROOT, AI_DIR):
    path_str = str(path)
    if path.exists() and path_str not in sys.path:
        sys.path.insert(0, path_str)

try:
    from celery import Celery, Task
    from celery.utils.log import get_task_logger
    from fastapi_app.config import get_config
    from src.logger.logging import get_logger
except Exception as e:
    print(f"CRITICAL: Failed to import Celery modules: {e}")
    print(traceback.format_exc())
    raise

logger = get_logger(__name__)
task_logger = get_task_logger(__name__)

# Initialize Celery app
try:
    config = get_config()
except Exception as e:
    task_logger.error(f"Failed to load config: {e}")
    raise

app = Celery('skillgap_ai')
app.conf.update(
    broker_url=config.CELERY_BROKER_URL,
    result_backend=config.CELERY_RESULT_BACKEND,
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=5 * 60,  # 5 minutes hard limit
    task_soft_time_limit=4 * 60,  # 4 minutes soft limit
    worker_pool='solo',  # Use solo pool for Windows compatibility (avoids prefork issues)
    broker_connection_retry_on_startup=True,  # Suppress deprecation warning
)


class CallbackTask(Task):
    """Task with callbacks."""
    autoretry_for = (Exception,)
    retry_kwargs = {'max_retries': 3}
    retry_backoff = True


@app.task(bind=True, base=CallbackTask, name='skillgap_ai.match_pipeline')
def match_pipeline(
    self,
    resume_text: str,
    jd_text: str,
    task_id: str,
    user_id: str = None,
    resume_id: str = None
) -> Dict[str, Any]:
    """
    Main matching pipeline task.
    Orchestrates entire skill gap analysis workflow.
    
    Args:
        resume_text: extracted resume text
        jd_text: job description text
        task_id: task tracking ID
        user_id: user identifier
        resume_id: resume identifier
        
    Returns:
        dict with complete analysis results
    """
    task_logger.info(f"Starting match pipeline for task {task_id}")
    
    # Wrapper to handle all errors gracefully
    try:
        return _execute_match_pipeline(
            resume_text, jd_text, task_id, user_id, resume_id
        )
    except Exception as e:
        task_logger.error(f"Match pipeline failed with exception: {e}", exc_info=True)
        error_msg = str(e)
        
        # Check if it's an LLM API issue
        if "GITHUB_PAT" in error_msg or "GitHub Models" in error_msg or "401" in error_msg or "403" in error_msg:
            error_msg = "LLM API is not configured or GitHub PAT token is invalid. Please check your environment variables."
        elif "API call failed" in error_msg or "429" in error_msg:
            error_msg = "LLM API is rate limited or unreachable. Please try again later."
        elif "sentence_transformers" in error_msg or "embedding" in error_msg.lower():
            error_msg = "Embedding model failed to load. The embedding service may be unavailable."
        
        return {
            'task_id': task_id,
            'user_id': user_id,
            'resume_id': resume_id,
            'status': 'error',
            'error': error_msg,
            'match_score': 0.0,
            'hiring_probability': 0,
            'cosine_similarity': 0.0,
            'matched_skills': [],
            'missing_skills': [],
            'skill_gap_report': {},
            'message': f"Pipeline failed: {error_msg}"
        }


def _execute_match_pipeline(
    resume_text: str,
    jd_text: str,
    task_id: str,
    user_id: str = None,
    resume_id: str = None
) -> Dict[str, Any]:
    """Execute the actual pipeline with all imports and logic."""
    
    # Import here to avoid circular dependencies and to catch import errors
    try:
        from src.data.data_preprocessing import (
            clean_text,
            process_resume_skills,
            process_jd_skills,
            load_skill_expansion_map
        )
        from src.features.feature_engineering import (
            build_resume_overall_text,
            build_resume_skills_text,
            build_resume_projects_text,
            build_resume_experience_text,
            build_jd_overall_text,
            build_jd_skills_text,
            build_jd_role_text
        )
        from src.model.model_Evaluation import (
            cosine_distance,
            compute_granular_scores,
            compute_final_weighted_score,
            rank_job_titles
        )
        from fastapi_app.services.resume_parser import extract_resume_text
        from fastapi_app.services.jd_parser import extract_jd_data
        from fastapi_app.ml.embedder import get_embedder
        from fastapi_app.ml.matcher import get_skill_matcher
        from fastapi_app.ml.scorer import get_scorer
        from fastapi_app.chains.llm_chains import (
            analyze_resume_comprehensive
        )
    except ImportError as e:
        task_logger.error(f"Import error: {e}", exc_info=True)
        raise RuntimeError(f"Failed to import required modules: {e}")
    
    # ===== STEP 1: Clean texts =====
    task_logger.info("Step 1: Cleaning texts")
    resume_clean = clean_text(resume_text)
    jd_clean = clean_text(jd_text)
    
    # ===== STEP 2: Extract structured data =====
    task_logger.info("Step 2: Extracting structured data")
    
    # Parse resume (simple extraction, full LLM parsing handled elsewhere)
    resume_data = {
        'skills': [],
        'experience': [],
        'projects': [],
        'education': [],
        'years_experience': 0
    }
    
    # Parse JD
    try:
        jd_data = extract_jd_data(jd_text)
        if not jd_data:
            task_logger.warning("extract_jd_data returned None, using empty dict")
            jd_data = {}
        task_logger.info(f"Extracted JD: {jd_data.get('role', 'Unknown')}")
    except Exception as e:
        task_logger.error(f"Error extracting JD data: {e}", exc_info=True)
        jd_data = {
            'required_skills': [],
            'preferred_skills': [],
            'role': 'Unknown',
            'seniority_level': 'mid',
            'years_required': 0,
            'description': jd_text[:500]
        }
    
    # ===== STEP 3: Load skill expansion =====
    task_logger.info("Step 3: Loading skill expansion map")
    skill_expansion_path = AI_DIR / "skill_expansion_cleaned.json"
    skill_expansion_map = load_skill_expansion_map(str(skill_expansion_path))
    use_expansion = config.USE_SKILL_EXPANSION and skill_expansion_map is not None
    
    # ===== API STATUS CHECK =====
    task_logger.info("=" * 60)
    task_logger.info("[API STATUS] Checking LLM API configuration...")
    if config.GITHUB_PAT:
        task_logger.info("[API STATUS] ✅ GitHub Models API configured")
    else:
        task_logger.warning("[API STATUS] ⚠️ GitHub Models API NOT configured (GITHUB_PAT missing)")
    
    if config.OPENAI_API_KEY:
        task_logger.info("[API STATUS] ✅ OpenAI API configured")
    else:
        task_logger.warning("[API STATUS] ⚠️ OpenAI API NOT configured")
    
    if config.GEMINI_API_KEY:
        task_logger.info("[API STATUS] ✅ Gemini API configured")
    else:
        task_logger.warning("[API STATUS] ⚠️ Gemini API NOT configured")
    task_logger.info("=" * 60)
    
    # ===== STEP 4: Process skills =====
    task_logger.info("Step 4: Processing skills")
    
    # Extract resume skills from raw text using keyword matching against JD skills
    # This is a lightweight approach since full LLM parsing is handled in the comprehensive call
    resume_text_lower = resume_text.lower()
    jd_skills_raw = jd_data.get('required_skills', []) + jd_data.get('preferred_skills', [])
    
    # Also extract common tech keywords from the resume text directly
    import re as _re
    common_tech_keywords = [
        'python', 'java', 'javascript', 'typescript', 'react', 'node', 'nodejs',
        'django', 'fastapi', 'flask', 'spring', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
        'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
        'git', 'linux', 'machine learning', 'deep learning', 'tensorflow', 'pytorch',
        'scikit-learn', 'pandas', 'numpy', 'spark', 'kafka', 'rabbitmq',
        'ci/cd', 'devops', 'terraform', 'ansible', 'jenkins', 'github actions',
        'rest', 'graphql', 'microservices', 'api', 'html', 'css', 'vue', 'angular',
        'golang', 'go', 'rust', 'c++', 'c#', 'dotnet', '.net', 'ruby', 'scala',
        'data science', 'nlp', 'computer vision', 'llm', 'openai', 'langchain',
    ]
    
    # Extract skills found in resume text
    resume_skills_from_text = []
    for skill in common_tech_keywords:
        if skill in resume_text_lower:
            resume_skills_from_text.append(skill)
    
    # Also check JD skills directly in resume text
    for skill in jd_skills_raw:
        if skill.lower() in resume_text_lower and skill not in resume_skills_from_text:
            resume_skills_from_text.append(skill)
    
    resume_skills = resume_skills_from_text  # Use extracted skills
    task_logger.info(f"Extracted {len(resume_skills)} skills from resume text")
    
    jd_skills = jd_data.get('required_skills', [])
    
    resume_skills_processed = process_resume_skills(
        resume_skills,
        skill_expansion_map,
        use_expansion=use_expansion
    )
    
    jd_skills_processed = process_jd_skills(
        jd_skills,
        skill_expansion_map,
        use_expansion=use_expansion
    )
    
    task_logger.info(f"Processed skills - Resume: {len(resume_skills_processed)}, JD: {len(jd_skills_processed)}")
    
    # ===== STEP 5: Generate embeddings =====
    task_logger.info("Step 5: Generating embeddings")
    embedder = get_embedder()
    
    # Build text representations
    # Use full raw text for the overall semantic context
    resume_overall_text = resume_text
    jd_overall_text = build_jd_overall_text(jd_data)
    
    # Generate embeddings
    resume_emb = embedder.embed(resume_overall_text)
    jd_emb = embedder.embed(jd_overall_text)
    
    # Component embeddings
    resume_skills_emb = embedder.embed(", ".join(resume_skills_processed))
    jd_skills_emb = embedder.embed(build_jd_skills_text(jd_data))
    
    # Dummy component embeddings for projects/experience
    resume_projects_emb = resume_emb
    resume_experience_emb = resume_emb
    jd_role_emb = embedder.embed(jd_data.get('role', ''))
    
    # ===== STEP 6: Compute scores =====
    task_logger.info("Step 6: Computing scores")
    
    overall_cosine = cosine_distance(resume_emb, jd_emb)
    
    granular_scores = compute_granular_scores(
        resume_skills_emb,
        resume_projects_emb,
        resume_experience_emb,
        jd_skills_emb,
        jd_role_emb
    )
    
    final_weighted_score = compute_final_weighted_score(
        overall_cosine,
        granular_scores['skill_match'],
        granular_scores['project_relevance'],
        granular_scores['experience_relevance']
    )
    
    task_logger.info(f"Scores - Overall: {overall_cosine:.2f}, Final: {final_weighted_score:.2f}")
    
    # ===== STEP 7: Skill matching =====
    task_logger.info("Step 7: Performing skill matching")
    
    try:
        matcher = get_skill_matcher()
        matched_skills, missing_skills = matcher.match(
            resume_skills_processed,
            jd_skills_processed
        )
        
        skill_gap_report = matcher.get_skill_gap_report(
            resume_skills_processed,
            jd_skills_processed,
            jd_text
        )
        
        # Ensure skill_gap_report has all expected keys
        if not skill_gap_report:
            skill_gap_report = {
                'total_required': len(jd_skills_processed),
                'matched_count': len(matched_skills),
                'missing_count': len(missing_skills),
                'matched_skills': matched_skills,
                'critical_missing': [],
                'important_missing': [],
                'nice_to_have_missing': [],
                'coverage_percentage': 0
            }
    except Exception as e:
        task_logger.error(f"Error in skill matching: {e}", exc_info=True)
        matched_skills = []
        missing_skills = jd_skills_processed
        skill_gap_report = {
            'total_required': len(jd_skills_processed),
            'matched_count': 0,
            'missing_count': len(jd_skills_processed),
            'matched_skills': [],
            'critical_missing': jd_skills_processed,
            'important_missing': [],
            'nice_to_have_missing': [],
            'coverage_percentage': 0
        }
    
    task_logger.info(f"Skill gap - Matched: {len(matched_skills)}, Missing: {len(missing_skills)}")
    
    # ===== STEP 8: Hiring probability =====
    task_logger.info("Step 8: Computing hiring probability")
    
    scorer = get_scorer()
    hiring_prob = scorer.compute_hiring_probability(
        final_weighted_score,
        resume_skills_processed,
        jd_skills_processed,
        resume_years=jd_data.get('years_required', 0),  # Simplified
        jd_years_required=jd_data.get('years_required', 0),
        domain='tech'
    )
    
    task_logger.info(f"Hiring probability: {hiring_prob}%")
    
    # ===== STEP 9: Comprehensive LLM Analysis (ONE API CALL) =====
    task_logger.info("Step 9: Running comprehensive LLM analysis (single API call)")
    
    strengths = []
    weaknesses = []
    recommended_roles = []
    rewritten_bullets = []
    roadmap_30 = ""
    roadmap_60 = ""
    roadmap_90 = ""
    
    # Always run LLM analysis — even if no missing skills, we still need
    # strengths, recommended roles and the roadmap
    try:
        # Use resume_skills_processed if available, else fall back to JD skills as context
        skills_for_analysis = resume_skills_processed if resume_skills_processed else []
        # Use missing_skills capped at 5, or jd_skills if missing_skills is empty
        missing_for_analysis = missing_skills[:5] if missing_skills else jd_skills_processed[:5]
        
        gap_count = len(missing_skills) if missing_skills else 0
        match_score_for_prompt = int(hiring_prob) if isinstance(hiring_prob, (int, float)) else 0

        analysis_result = analyze_resume_comprehensive(
            existing_skills=skills_for_analysis,
            target_role=jd_data.get('role', 'target role'),
            missing_skills=missing_for_analysis,
            gap_count=gap_count,
            match_score=match_score_for_prompt,
            jd_role=jd_data.get('role', 'Unknown'),
            jd_required_skills=jd_skills_processed,
            jd_seniority=jd_data.get('seniority_level', 'mid'),
            jd_years=jd_data.get('years_required', 0),
            resume_text=resume_text,
            priority="high"
        )
        
        # Extract structured response
        strengths = analysis_result.get('strengths', [])
        weaknesses = analysis_result.get('weaknesses', [])
        recommended_roles = analysis_result.get('recommended_roles', [])
        rewritten_bullets = analysis_result.get('rewritten_bullets', [])
        
        roadmap = analysis_result.get('roadmap', {})
        roadmap_30 = roadmap.get('30_days', '')
        roadmap_60 = roadmap.get('60_days', '')
        roadmap_90 = roadmap.get('90_days', '')
        
        task_logger.info(f"Comprehensive analysis completed: strengths={len(strengths)}, weaknesses={len(weaknesses)}, roles={len(recommended_roles)}")
    
    except Exception as e:
        task_logger.warning(f"Comprehensive analysis failed: {e}")
        # Graceful fallback — these fields will be empty
    
    # ===== STEP 10: Generate alt titles =====
    task_logger.info("Step 10: Generating alternate job titles")
    
    # Placeholder: would use vector search from Pinecone/ChromaDB
    alternate_titles = []
    
    # ===== RESULT =====
    result = {
        'task_id': task_id,
        'user_id': user_id,
        'resume_id': resume_id,
        'jd_text': jd_text,
        'match_score': float(final_weighted_score) if isinstance(final_weighted_score, (int, float)) else 0.0,
        'hiring_probability': int(hiring_prob) if isinstance(hiring_prob, (int, float)) else 0,
        'cosine_similarity': float(overall_cosine) if isinstance(overall_cosine, (int, float)) else 0.0,
        'granular_scores': {
            'skill_match': float(granular_scores.get('skill_match', 0)) if 'skill_match' in granular_scores else 0.0,
            'project_relevance': float(granular_scores.get('project_relevance', 0)) if 'project_relevance' in granular_scores else 0.0,
            'experience_relevance': float(granular_scores.get('experience_relevance', 0)) if 'experience_relevance' in granular_scores else 0.0
        },
        'matched_skills': list(matched_skills) if matched_skills else [],
        'missing_skills': list(missing_skills) if missing_skills else [],
        'skill_gap_report': skill_gap_report if isinstance(skill_gap_report, dict) else {},
        'critical_missing': list(skill_gap_report.get('critical_missing', [])) if skill_gap_report else [],
        'important_missing': list(skill_gap_report.get('important_missing', [])) if skill_gap_report else [],
        'nice_to_have_missing': list(skill_gap_report.get('nice_to_have_missing', [])) if skill_gap_report else [],
        'jd_role': str(jd_data.get('role', 'Unknown')),
        'jd_seniority': str(jd_data.get('seniority_level', 'mid')),
        'jd_years_required': int(jd_data.get('years_required', 0)) if jd_data.get('years_required') else 0,
        
        # LLM Analysis Results (from single comprehensive API call)
        'strengths': list(strengths) if strengths else [],
        'weaknesses': list(weaknesses) if weaknesses else [],
        'recommended_roles': list(recommended_roles) if recommended_roles else [],
        'roadmap': {
            '30_days': str(roadmap_30) if roadmap_30 else "",
            '60_days': str(roadmap_60) if roadmap_60 else "",
            '90_days': str(roadmap_90) if roadmap_90 else ""
        },
        'rewritten_bullets': list(rewritten_bullets) if rewritten_bullets else [],
        
        'alternate_titles': list(alternate_titles) if alternate_titles else []
    }
    
    task_logger.info(f"Pipeline completed successfully for task {task_id}")
    return result


@app.task(bind=True, base=CallbackTask, name='skillgap_ai.health_check')
def health_check(self) -> Dict[str, str]:
    """Simple health check task."""
    return {'status': 'ok', 'message': 'Worker is running'}
