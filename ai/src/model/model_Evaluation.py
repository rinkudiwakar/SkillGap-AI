"""
Model evaluation module - scoring, skill matching, and hiring probability.
Extracted from production_style_code_skillGap_ai.ipynb
"""
import math
from typing import List, Tuple, Dict, Any, Optional
import numpy as np
from src.logger.logging import get_logger

logger = get_logger(__name__)


def cosine_distance(vec_a: list, vec_b: list) -> float:
    """
    Compute cosine similarity between two embedding vectors.
    Returns scalar in range [-1, 1], typically [0, 1] for embeddings.
    
    Args:
        vec_a: first embedding vector
        vec_b: second embedding vector
        
    Returns:
        cosine similarity score
    """
    try:
        arr_a = np.asarray(vec_a, dtype=np.float32)
        arr_b = np.asarray(vec_b, dtype=np.float32)

        norm_a = np.linalg.norm(arr_a)
        norm_b = np.linalg.norm(arr_b)

        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0

        result = float(np.dot(arr_a, arr_b) / (norm_a * norm_b))
        return result
    except Exception as e:
        logger.error(f"Error computing cosine similarity: {e}")
        return 0.0


def keyword_boost(resume_skills: List[str], jd_skills: List[str], max_boost: float = 0.05) -> float:
    """
    Calculate keyword boost for exact skill matches.
    Bonus based on overlap ratio (capped at max_boost).
    
    From PRD: keyword_boost = min(0.05, exact_keyword_overlap_ratio * 0.1)
    
    Args:
        resume_skills: normalized resume skills
        jd_skills: normalized JD skills
        max_boost: maximum boost value (from config)
        
    Returns:
        boost value in [0, max_boost]
    """
    if not jd_skills:
        return 0.0
    
    overlap = len(set(resume_skills) & set(jd_skills))
    overlap_ratio = overlap / len(jd_skills)
    boost = overlap_ratio * 0.15  # Increased from 0.1
    
    return min(max_boost, boost)


def experience_penalty(
    resume_years: int,
    jd_years_required: int,
    penalty_per_year: float = 0.07
) -> float:
    """
    Calculate penalty for experience mismatch.
    Penalize if resume has fewer years than required.
    
    From PRD: exp_penalty = max(0.0, (jd_years_required - resume_years) * 0.03)
    
    Args:
        resume_years: years of experience in resume
        jd_years_required: required years for JD
        penalty_per_year: penalty multiplier per year gap
        
    Returns:
        penalty value (non-negative)
    """
    if jd_years_required <= 0:
        return 0.0
    
    gap = max(0, jd_years_required - resume_years)
    penalty = gap * penalty_per_year
    
    return penalty


def sigmoid(x: float) -> float:
    """
    Standard sigmoid function for probability calibration.
    
    Args:
        x: input value
        
    Returns:
        sigmoid output in (0, 1)
    """
    try:
        return 1.0 / (1.0 + math.exp(-x))
    except OverflowError:
        return 1.0 if x > 0 else 0.0


def hiring_probability(
    cosine_score: float,
    keyword_boost_val: float = 0.0,
    exp_penalty_val: float = 0.0,
    seniority_factor: float = 1.0,
    domain_factor: float = 1.0,
    seniority_level_match: bool = True,
    is_senior_candidate_vs_junior_jd: bool = False
) -> int:
    """
    Calculate hiring probability percentage.
    
    From PRD:
    base_prob = sigmoid(cosine_score * 10 - 5) * 100
    seniority_adj = 1.0 if levels match, 0.85 if junior vs senior, 1.10 if senior vs junior
    hire_prob = clamp((base_prob * domain_adj * seniority_adj) + keyword_boost - exp_penalty, min=1, max=99)
    
    Args:
        cosine_score: overall cosine similarity score
        keyword_boost_val: keyword match bonus
        exp_penalty_val: experience gap penalty
        seniority_factor: seniority adjustment factor
        domain_factor: domain-specific adjustment factor
        seniority_level_match: whether resume and JD seniority levels match
        is_senior_candidate_vs_junior_jd: whether candidate is senior but JD is junior
        
    Returns:
        hiring probability as integer percentage [1, 99]
    """
    # Base probability from sigmoid calibration
    # Base probability from sigmoid calibration
    base_prob = sigmoid(cosine_score * 10 - 2.5) * 100
    
    # Apply domain factor
    adjusted = base_prob * domain_factor
    
    # Apply seniority adjustment
    if not seniority_level_match:
        if is_senior_candidate_vs_junior_jd:
            adjusted *= 1.10  # Bonus for overqualified
            adjusted = min(adjusted, 100)  # Cap at 100 before clamping
        else:
            adjusted *= 0.85  # Discount for underqualified
    
    # Apply bonuses and penalties
    final_prob = adjusted + keyword_boost_val - exp_penalty_val
    
    # Clamp to [1, 99]
    final_prob = max(1, min(99, final_prob))
    
    return int(final_prob)


def get_skill_match(
    resume_skills: List[str],
    jd_skills: List[str],
    embedder,
    similarity_threshold: float = 0.60
) -> Tuple[List[str], List[str]]:
    """
    Identify matched and missing skills using exact + semantic matching.
    
    Two-stage matching:
    1. Exact match (fast, reliable)
    2. Semantic fallback (handles synonyms)
    
    Args:
        resume_skills: normalized resume skills
        jd_skills: normalized JD skills
        embedder: callable that embeds text → vector
        similarity_threshold: cosine similarity threshold for semantic match
        
    Returns:
        (matched_skills, missing_skills) tuples
    """
    if not jd_skills:
        return [], []
    
    matched = []
    missing = []
    
    # Precompute embeddings for efficiency
    jd_embeddings = {}
    resume_embeddings = {}
    
    try:
        for j in jd_skills:
            jd_embeddings[j] = embedder(j)
        
        for r in resume_skills:
            resume_embeddings[r] = embedder(r)
    except Exception as e:
        logger.error(f"Error generating embeddings for skill matching: {e}")
        # Fallback to exact matching only
        for j in jd_skills:
            if j in resume_skills:
                matched.append(j)
            else:
                missing.append(j)
        return matched, missing
    
    # Perform matching
    for j in jd_skills:
        found = False
        j_emb = jd_embeddings[j]
        
        # 1. Exact match (fast)
        if j in resume_skills:
            matched.append(j)
            found = True
        else:
            # 2. Semantic match
            for r, r_emb in resume_embeddings.items():
                score = cosine_distance(r_emb, j_emb)
                if score > similarity_threshold:
                    matched.append(j)
                    found = True
                    break
        
        if not found:
            missing.append(j)
    
    return matched, missing


def compute_granular_scores(
    resume_skills_emb: list,
    resume_projects_emb: list,
    resume_experience_emb: list,
    jd_skills_emb: list,
    jd_role_emb: list
) -> Dict[str, float]:
    """
    Compute granular component scores.
    
    Args:
        resume_skills_emb: embedding of resume skills text
        resume_projects_emb: embedding of resume projects text
        resume_experience_emb: embedding of resume experience text
        jd_skills_emb: embedding of JD skills (weighted)
        jd_role_emb: embedding of JD role
        
    Returns:
        dict with component scores
    """
    scores = {
        "skill_match": cosine_distance(resume_skills_emb, jd_skills_emb),
        "project_relevance": cosine_distance(resume_projects_emb, jd_role_emb),
        "experience_relevance": cosine_distance(resume_experience_emb, jd_role_emb)
    }
    
    return scores


def compute_final_weighted_score(
    overall_cosine: float,
    skill_score: float,
    project_score: float,
    experience_score: float,
    weight_skills: float = 0.6,
    weight_projects: float = 0.2,
    weight_experience: float = 0.2
) -> float:
    """
    Compute final weighted match score using component scores.
    
    From PRD: weighted_score = weights × component_scores × overall_cosine
    
    Args:
        overall_cosine: overall cosine similarity
        skill_score: skill match component score
        project_score: project relevance component score
        experience_score: experience relevance component score
        weight_skills: weight for skills (default 0.6)
        weight_projects: weight for projects (default 0.2)
        weight_experience: weight for experience (default 0.2)
        
    Returns:
        final weighted score in range [0, 1]
    """
    # Weights should sum to 1.0
    if abs((weight_skills + weight_projects + weight_experience) - 1.0) > 0.01:
        logger.warning("Weights do not sum to 1.0; normalizing")
        total = weight_skills + weight_projects + weight_experience
        weight_skills /= total
        weight_projects /= total
        weight_experience /= total
    
    weighted = (
        weight_skills * skill_score +
        weight_projects * project_score +
        weight_experience * experience_score
    )
    
    # NEW: Use additive mix of weighted components and overall context
    # This prevents low overall_cosine from tanking a high skill match
    final = (0.7 * weighted) + (0.3 * overall_cosine)
    
    # Clamp to [0, 1]
    return max(0.0, min(1.0, final))


def rank_job_titles(
    resume_embedding: list,
    job_titles: List[str],
    embedder
) -> List[Tuple[str, float]]:
    """
    Rank job titles by semantic similarity to resume embedding.
    
    Args:
        resume_embedding: resume embedding vector
        job_titles: list of candidate job titles
        embedder: callable that embeds text → vector
        
    Returns:
        list of (title, similarity_score) tuples, sorted by score descending
    """
    if not job_titles:
        return []
    
    try:
        ranked = []
        for title in job_titles:
            title_emb = embedder(title)
            score = cosine_distance(resume_embedding, title_emb)
            ranked.append((title, score))
        
        # Sort by score descending
        ranked.sort(key=lambda x: x[1], reverse=True)
        return ranked
    except Exception as e:
        logger.error(f"Error ranking job titles: {e}")
        return [(t, 0.0) for t in job_titles]
