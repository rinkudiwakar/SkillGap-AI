"""
LangChain chains for resume optimization and career guidance.
"""
from typing import Optional, List, Dict, Any, Literal
import requests
import json
import time
from fastapi_app.config import get_config
from ai.src.logger.logging import get_logger
from fastapi_app.services.llm_service import get_llm_service, LLMServiceError

logger = get_logger(__name__)


class LLMChainBase:
    """Base class for LLM chains."""
    
    def __init__(self):
        """Initialize chain with config."""
        self.config = get_config()
    
    def call_llm(self, prompt: str, max_retries: int = 3) -> str:
        """
        Call LLM with prompt.
        
        Args:
            prompt: prompt text
            max_retries: retry count
            
        Returns:
            LLM response
        """
        if self.config.GITHUB_PAT:
            return self._call_github_models(prompt, max_retries)
        else:
            logger.error("GitHub Models API is not configured")
            raise ValueError("GitHub Models API not configured")
    
    def _call_github_models(self, prompt: str, max_retries: int) -> str:
        """Call GitHub Models API with detailed logging."""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {self.config.GITHUB_PAT}"
        }
        
        payload = {
            "model": "openai/gpt-4.1",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 2000,
            "temperature": 0.3
        }
        
        logger.info(f"[LLM API] Starting GitHub Models API call (max_retries={max_retries})")
        
        for attempt in range(max_retries):
            try:
                logger.info(f"[LLM API] Attempt {attempt + 1}/{max_retries} - Calling GitHub Models API")
                response = requests.post(
                    self.config.GITHUB_MODELS_API_URL,
                    json=payload,
                    headers=headers,
                    timeout=30
                )
                
                logger.info(f"[LLM API] Response status: {response.status_code}")
                
                if response.status_code == 429:
                    delay = 2 ** attempt
                    remaining = response.headers.get('x-ratelimit-remaining', 'unknown')
                    reset_time = response.headers.get('x-ratelimit-reset', 'unknown')
                    logger.warning(f"[LLM API] ⚠️ RATE LIMIT EXCEEDED (429)")
                    logger.warning(f"[LLM API] Remaining requests: {remaining}, Reset time: {reset_time}")
                    logger.warning(f"[LLM API] Retrying in {delay}s... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(delay)
                    continue
                
                if response.status_code == 401:
                    logger.error(f"[LLM API] ❌ AUTHENTICATION ERROR (401) - Invalid/expired GitHub PAT")
                    raise requests.exceptions.HTTPError("401: Unauthorized - Check GITHUB_PAT")
                
                if response.status_code == 403:
                    logger.error(f"[LLM API] ❌ PERMISSION ERROR (403) - GitHub PAT lacks permissions")
                    raise requests.exceptions.HTTPError("403: Forbidden - Check GitHub PAT permissions")
                
                response.raise_for_status()
                result = response.json()
                logger.info(f"[LLM API] ✅ API call successful")
                
                # Safely access nested keys
                try:
                    content = result["choices"][0]["message"]["content"]
                    logger.info(f"[LLM API] Response length: {len(content)} characters")
                    return content
                except (KeyError, IndexError, TypeError) as e:
                    logger.error(f"[LLM API] ❌ Unexpected response structure: {e}")
                    logger.error(f"[LLM API] Response: {result}")
                    return ""
            
            except requests.exceptions.Timeout:
                logger.error(f"[LLM API] ⏱️ TIMEOUT on attempt {attempt + 1}/{max_retries}")
                if attempt < max_retries - 1:
                    delay = 2 ** attempt
                    logger.info(f"[LLM API] Retrying in {delay}s...")
                    time.sleep(delay)
                else:
                    raise
            
            except requests.exceptions.ConnectionError as e:
                logger.error(f"[LLM API] 🔌 CONNECTION ERROR on attempt {attempt + 1}/{max_retries}: {e}")
                if attempt < max_retries - 1:
                    delay = 2 ** attempt
                    logger.info(f"[LLM API] Retrying in {delay}s...")
                    time.sleep(delay)
                else:
                    raise
            
            except requests.exceptions.HTTPError as e:
                logger.error(f"[LLM API] ❌ HTTP ERROR on attempt {attempt + 1}/{max_retries}: {e}")
                if attempt < max_retries - 1:
                    delay = 2 ** attempt
                    logger.info(f"[LLM API] Retrying in {delay}s...")
                    time.sleep(delay)
                else:
                    raise
            
            except Exception as e:
                logger.error(f"[LLM API] ❌ Unexpected error on attempt {attempt + 1}/{max_retries}: {type(e).__name__}: {e}")
                if attempt < max_retries - 1:
                    delay = 2 ** attempt
                    logger.info(f"[LLM API] Retrying in {delay}s...")
                    time.sleep(delay)
                else:
                    raise
        
        logger.error(f"[LLM API] ❌ FAILED - Max retries ({max_retries}) exceeded")
        raise RuntimeError("Max retries exceeded for GitHub Models API")
    
class ResumeRewriteChain(LLMChainBase):
    """
    Chain for rewriting resume bullet points.
    Uses new LLM service with dual provider support and batching.
    """
    
    def __init__(self):
        """Initialize chain with config and LLM service."""
        super().__init__()
        self.llm_service = get_llm_service()
    
    def run(
        self,
        bullet_point: str,
        jd_keywords: List[str],
        jd_role: str
    ) -> str:
        """
        Rewrite a single resume bullet point (backward compatible).
        
        Args:
            bullet_point: original bullet point
            jd_keywords: top keywords from JD
            jd_role: target job role
            
        Returns:
            rewritten bullet point
        """
        try:
            # Use batch rewrite with single bullet for consistency
            result = self.run_batch([bullet_point], jd_keywords, jd_role, priority="high")
            return result[0] if result else bullet_point
        except LLMServiceError as e:
            logger.error(f"Rewrite chain failed: {e}")
            return bullet_point  # Return original if rewrite fails
        except Exception as e:
            logger.error(f"Unexpected error in rewrite chain: {e}", exc_info=True)
            return bullet_point
    
    def run_batch(
        self,
        bullets: List[str],
        jd_keywords: List[str],
        jd_role: str,
        priority: Literal["high", "low"] = "high"
    ) -> List[str]:
        """
        Rewrite multiple resume bullet points in a single API call (batched).
        
        Args:
            bullets: list of bullet points to rewrite
            jd_keywords: top keywords from JD
            jd_role: target job role
            priority: priority level - "high" uses OpenAI (gpt-4o-mini), 
                     "low" uses Gemini Flash
            
        Returns:
            list of rewritten bullets (same order as input)
        """
        if not bullets:
            return []
        
        try:
            logger.info(f"Batch rewriting {len(bullets)} bullets for role: {jd_role}")
            rewritten = self.llm_service.rewrite_bullets(
                jd_keywords=jd_keywords,
                role=jd_role,
                bullets=bullets,
                priority=priority
            )
            logger.info(f"Successfully batch rewritten {len(rewritten)} bullets")
            return rewritten
        except LLMServiceError as e:
            logger.error(f"Batch rewrite failed: {e}")
            # Return originals on failure
            return bullets
        except Exception as e:
            logger.error(f"Unexpected error in batch rewrite: {e}", exc_info=True)
            return bullets


class RoadmapChain(LLMChainBase):
    """Chain for generating skill acquisition roadmap."""
    
    def run(
        self,
        role: str,
        existing_skills: List[str],
        missing_skills: List[str]
    ) -> str:
        """
        Generate a learning roadmap for missing skills.
        
        Args:
            role: target job role
            existing_skills: skills already possessed
            missing_skills: skills to acquire
            
        Returns:
            roadmap text
        """
        existing_str = ", ".join(existing_skills[:10])
        missing_str = ", ".join(missing_skills[:5])
        
        prompt = f"""You're doing great! You are only a few skills away from matching the ideal candidate for the {role} position. Here's a focused roadmap to help you bridge the gap.

Create a concise and actionable roadmap to acquire the following missing skills for the {role} role. Focus only on the 'Missing' skills and how to obtain them.

Target Role: {role}
Your Existing Skills (for context): {existing_str}
Missing Skills (create roadmap ONLY for these): {missing_str}

Provide the roadmap in a clear, structured, and encouraging format. Start by praising the user for their existing skills and motivate them that they are close to achieving their goal."""
        
        try:
            result = self.call_llm(prompt)
            logger.info(f"Roadmap generated for role: {role}")
            return result
        except Exception as e:
            logger.error(f"Roadmap chain failed: {e}")
            return ""


class ResumeOptimizationChain(LLMChainBase):
    """Chain for resume optimization suggestions."""
    
    def run(
        self,
        resume_skills: List[str],
        resume_experience: List[str],
        resume_projects: List[str],
        jd_role: str,
        missing_skills: List[str]
    ) -> str:
        """
        Generate resume optimization suggestions.
        
        Args:
            resume_skills: candidate's skills
            resume_experience: candidate's experience
            resume_projects: candidate's projects
            jd_role: target role
            missing_skills: skills to highlight
            
        Returns:
            optimization suggestions
        """
        skills_str = ", ".join(resume_skills[:10])
        exp_str = ", ".join(resume_experience[:5])
        proj_str = ", ".join(resume_projects[:5])
        missing_str = ", ".join(missing_skills[:5])
        
        prompt = f"""Analyze the candidate's resume and the job description. Provide specific, actionable suggestions to optimize the resume for the target role.
Focus on improving the 'missing_skills' section.

Target Role: {jd_role}
Candidate's Skills: {skills_str}
Candidate's Experience: {exp_str}
Candidate's Projects: {proj_str}
Missing Skills: {missing_str}

Provide clear, concise suggestions. For example, suggest rephrasing bullet points, adding specific projects, or highlighting relevant experience."""
        
        try:
            result = self.call_llm(prompt)
            logger.info(f"Resume optimization suggestions generated for role: {jd_role}")
            return result
        except Exception as e:
            logger.error(f"Resume optimization chain failed: {e}")
            return ""


class LearningResourcesChain(LLMChainBase):
    """Chain for suggesting learning resources."""
    
    def run(self, missing_skills: List[str]) -> str:
        """
        Suggest learning resources for missing skills.
        
        Args:
            missing_skills: skills to learn
            
        Returns:
            learning resources list
        """
        missing_str = ", ".join(missing_skills[:5])
        
        prompt = f"""For each of the following missing skills, suggest 1-2 high-quality learning resources (e.g., online courses, books, official documentation, tutorials). Prioritize widely recognized and effective resources.

Missing Skills: {missing_str}

Return the suggestions in a clear, bulleted list format."""
        
        try:
            result = self.call_llm(prompt)
            logger.info(f"Learning resources generated for {len(missing_skills)} skills")
            return result
        except Exception as e:
            logger.error(f"Learning resources chain failed: {e}")
            return ""


class InterviewQuestionsChain(LLMChainBase):
    """Chain for generating interview questions."""
    
    def run(self, role: str, missing_skills: List[str]) -> str:
        """
        Generate interview questions for preparation.
        
        Args:
            role: target job role
            missing_skills: skills to focus on
            
        Returns:
            interview questions
        """
        missing_str = ", ".join(missing_skills[:5])
        
        prompt = f"""Based on the target role and the candidate's missing skills, generate 3-5 challenging technical interview questions. Focus on assessing understanding and problem-solving abilities related to these missing skills.

Target Role: {role}
Missing Skills: {missing_str}

For each question, also provide a brief expected answer or key points to look for."""
        
        try:
            result = self.call_llm(prompt)
            logger.info(f"Interview questions generated for role: {role}")
            return result
        except Exception as e:
            logger.error(f"Interview questions chain failed: {e}")
            return ""


# Convenience functions
def rewrite_bullet(bullet: str, jd_keywords: List[str], jd_role: str) -> str:
    """Rewrite a resume bullet point (single bullet, backward compatible)."""
    chain = ResumeRewriteChain()
    return chain.run(bullet, jd_keywords, jd_role)


def rewrite_bullets_batch(
    bullets: List[str],
    jd_keywords: List[str],
    jd_role: str,
    priority: Literal["high", "low"] = "high"
) -> List[str]:
    """
    Rewrite multiple resume bullets in a single API call (batched).
    
    Args:
        bullets: list of bullet points to rewrite
        jd_keywords: top keywords from JD
        jd_role: target job role
        priority: "high" for OpenAI (gpt-4o-mini), "low" for Gemini Flash
        
    Returns:
        list of rewritten bullets
    """
    chain = ResumeRewriteChain()
    return chain.run_batch(bullets, jd_keywords, jd_role, priority=priority)


def analyze_resume_comprehensive(
    existing_skills: List[str],
    target_role: str,
    missing_skills: List[str],
    gap_count: int,
    match_score: int,
    jd_role: str,
    jd_required_skills: List[str],
    jd_seniority: str,
    jd_years: int,
    resume_text: str = "",
    priority: Literal["high", "low"] = "high"
) -> Dict[str, Any]:
    """
    **Comprehensive single-call analysis** - ONE LLM API call for ALL tasks!
    
    Returns in one response:
    - Rewritten resume bullets (aligned with JD)
    - Learning roadmap (step-by-step skill acquisition plan)
    - Resume suggestions (what to highlight/improve)
    - Learning resources (courses, certifications, docs)
    - Interview prep questions (practice questions for interview)
    
    Args:
        existing_skills: Candidate's current skills
        target_role: Target job role
        missing_skills: Skills gap (top 3-5 most important)
        jd_role: Job description role title
        jd_required_skills: Required skills from JD
        jd_seniority: Seniority level (e.g., "mid", "senior")
        jd_years: Years of experience required
        priority: "high"=OpenAI (default, better quality), "low"=Gemini (faster, cheaper)
        
    Returns:
        Dict with:
        {
            "rewritten_bullets": [...],           # 3 optimized resume bullets
            "learning_roadmap": "...",            # Step-by-step learning plan
            "resume_suggestions": "...",          # Specific improvements
            "learning_resources": "...",          # Courses/books/certs
            "interview_prep": "..."               # Practice questions
        }
        
    Cost/Performance:
        - **1 API call** (vs 4-5 separate calls)
        - ~$0.0001 cost (OpenAI) or ~0.00005 (Gemini)
        - ~2-3 seconds response time
        - 85-90% savings vs separate calls
    
    Example:
        result = analyze_resume_comprehensive(
            existing_skills=["Python", "FastAPI", "PostgreSQL"],
            target_role="Senior Backend Engineer",
            missing_skills=["Kubernetes", "Microservices", "AWS"],
            jd_role="Senior Backend Engineer",
            jd_required_skills=["Python", "FastAPI", "Kubernetes", "Microservices"],
            jd_seniority="senior",
            jd_years=5,
            priority="high"
        )
        
        print(result["rewritten_bullets"])     # 3 optimized bullets
        print(result["learning_roadmap"])      # What to learn and how
        print(result["resume_suggestions"])    # How to improve resume
        print(result["learning_resources"])    # Where to learn
        print(result["interview_prep"])        # Practice questions
    """
    service = get_llm_service()
    return service.analyze_resume_comprehensive(
        existing_skills=existing_skills,
        target_role=target_role,
        missing_skills=missing_skills,
        gap_count=gap_count,
        match_score=match_score,
        jd_role=jd_role,
        jd_required_skills=jd_required_skills,
        jd_seniority=jd_seniority,
        jd_years=jd_years,
        resume_text=resume_text,
        priority=priority
    )


def generate_roadmap(role: str, existing: List[str], missing: List[str]) -> str:
    """Generate learning roadmap."""
    chain = RoadmapChain()
    return chain.run(role, existing, missing)


def generate_resume_suggestions(
    skills: List[str],
    experience: List[str],
    projects: List[str],
    role: str,
    missing: List[str]
) -> str:
    """Generate resume optimization suggestions."""
    chain = ResumeOptimizationChain()
    return chain.run(skills, experience, projects, role, missing)


def generate_learning_resources(missing_skills: List[str]) -> str:
    """Generate learning resources."""
    chain = LearningResourcesChain()
    return chain.run(missing_skills)


def generate_interview_questions(role: str, missing_skills: List[str]) -> str:
    """Generate interview questions."""
    chain = InterviewQuestionsChain()
    return chain.run(role, missing_skills)
