"""
Matcher module - hybrid skill matching combining exact and semantic matching.
"""
from typing import List, Tuple
from src.model.model_Evaluation import get_skill_match
from fastapi_app.ml.embedder import get_embedder
from src.logger.logging import get_logger

logger = get_logger(__name__)


class SkillMatcher:
    """Skill matching utility."""
    
    def __init__(self, similarity_threshold: float = 0.60):
        """
        Initialize skill matcher.
        
        Args:
            similarity_threshold: cosine similarity threshold for semantic matching
        """
        self.similarity_threshold = similarity_threshold
        self.embedder = get_embedder()
    
    def match(
        self,
        resume_skills: List[str],
        jd_skills: List[str]
    ) -> Tuple[List[str], List[str]]:
        """
        Match resume skills to JD skills.
        Two-stage: exact match, then semantic fallback.
        
        Args:
            resume_skills: normalized resume skills
            jd_skills: normalized JD skills
            
        Returns:
            (matched_skills, missing_skills)
        """
        try:
            matched, missing = get_skill_match(
                resume_skills,
                jd_skills,
                embedder=self.embedder.embed,
                similarity_threshold=self.similarity_threshold
            )
            
            logger.info(
                f"Skill matching complete. Matched: {len(matched)}/{len(jd_skills)}, "
                f"Missing: {len(missing)}"
            )
            
            return matched, missing
        except Exception as e:
            logger.error(f"Error in skill matching: {e}")
            # Fallback to exact matching
            matched = [s for s in jd_skills if s in resume_skills]
            missing = [s for s in jd_skills if s not in resume_skills]
            return matched, missing
    
    def get_skill_gap_report(
        self,
        resume_skills: List[str],
        jd_skills: List[str],
        jd_text: str = ""
    ) -> dict:
        """
        Generate detailed skill gap report.
        
        Args:
            resume_skills: normalized resume skills
            jd_skills: normalized JD skills
            jd_text: raw JD text for context
            
        Returns:
            dict with matched, missing, gap analysis
        """
        try:
            matched, missing = self.match(resume_skills, jd_skills)
        except Exception as e:
            logger.error(f"Error during skill matching in get_skill_gap_report: {e}")
            matched = []
            missing = list(jd_skills) if jd_skills else []
        
        # Categorize by importance (simple heuristic based on frequency)
        critical_missing = []
        important_missing = []
        nice_to_have_missing = []
        
        for skill in missing:
            if not skill:  # Skip empty skills
                continue
            # Count occurrences in JD text
            freq = jd_text.lower().count(skill.lower()) if jd_text else 0
            
            if freq >= 2:
                critical_missing.append(skill)
            elif freq >= 1:
                important_missing.append(skill)
            else:
                nice_to_have_missing.append(skill)
        
        # Calculate coverage percentage safely
        coverage_percentage = 0
        if jd_skills and len(jd_skills) > 0:
            coverage_percentage = (len(matched) / len(jd_skills) * 100)
        
        return {
            "total_required": len(jd_skills),
            "matched_count": len(matched),
            "missing_count": len(missing),
            "matched_skills": matched,
            "critical_missing": critical_missing,
            "important_missing": important_missing,
            "nice_to_have_missing": nice_to_have_missing,
            "coverage_percentage": coverage_percentage
        }


def get_skill_matcher(threshold: float = 0.60) -> SkillMatcher:
    """Get or create skill matcher instance."""
    return SkillMatcher(similarity_threshold=threshold)
