"""
Scorer module - wraps scoring functions from model_evaluation with configuration.
"""
from typing import Dict, Any
import yaml
from pathlib import Path
from ai.src.model.model_Evaluation import (
    cosine_distance,
    keyword_boost,
    experience_penalty,
    hiring_probability,
    compute_granular_scores,
    compute_final_weighted_score,
    rank_job_titles
)
from fastapi_app.ml.embedder import get_embedder
from ai.src.logger.logging import get_logger

logger = get_logger(__name__)


class ScoringConfig:
    """Configuration for scoring functions."""
    
    def __init__(self):
        """Load configuration from params.yaml."""
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load params.yaml."""
        backend_dir = Path(__file__).resolve().parents[2]
        project_root = backend_dir.parent if backend_dir.name == "backend" else backend_dir
        params_path = project_root / "ai" / "params.yaml"
        try:
            with open(params_path, 'r') as f:
                return yaml.safe_load(f) or {}
        except Exception as e:
            logger.error(f"Failed to load params.yaml: {e}")
            return {}
    
    @property
    def weight_skills(self) -> float:
        return self.config.get('scoring', {}).get('weight_skills', 0.6)
    
    @property
    def weight_projects(self) -> float:
        return self.config.get('scoring', {}).get('weight_projects', 0.2)
    
    @property
    def weight_experience(self) -> float:
        return self.config.get('scoring', {}).get('weight_experience', 0.2)
    
    @property
    def keyword_boost_max(self) -> float:
        return self.config.get('scoring', {}).get('keyword_boost_max', 0.05)
    
    @property
    def exp_penalty_per_year(self) -> float:
        return self.config.get('scoring', {}).get('exp_penalty_per_year', 0.07)
    
    @property
    def similarity_threshold(self) -> float:
        return self.config.get('similarity', {}).get('threshold_soft_gap', 0.60)
    
    @property
    def domain_factors(self) -> Dict[str, float]:
        return self.config.get('domain_factors', {'default': 1.0})
    
    def get_domain_factor(self, domain: str) -> float:
        """Get domain adjustment factor."""
        return self.domain_factors.get(domain, self.domain_factors.get('default', 1.0))


# Global config instance
_scoring_config = ScoringConfig()


class Scorer:
    """Scoring utility class with configuration."""
    
    def __init__(self, config: ScoringConfig = None):
        """Initialize scorer with config."""
        self.config = config or _scoring_config
        self.embedder = get_embedder()
    
    def compute_granular_scores(
        self,
        resume_skills_emb,
        resume_projects_emb,
        resume_experience_emb,
        jd_skills_emb,
        jd_role_emb
    ) -> Dict[str, float]:
        """Compute component scores."""
        return compute_granular_scores(
            resume_skills_emb,
            resume_projects_emb,
            resume_experience_emb,
            jd_skills_emb,
            jd_role_emb
        )
    
    def compute_final_score(
        self,
        overall_cosine: float,
        skill_score: float,
        project_score: float,
        experience_score: float
    ) -> float:
        """Compute final weighted score."""
        return compute_final_weighted_score(
            overall_cosine,
            skill_score,
            project_score,
            experience_score,
            weight_skills=self.config.weight_skills,
            weight_projects=self.config.weight_projects,
            weight_experience=self.config.weight_experience
        )
    
    def compute_hiring_probability(
        self,
        cosine_score: float,
        resume_skills: list,
        jd_skills: list,
        resume_years: int,
        jd_years_required: int,
        domain: str = "tech",
        seniority_level_match: bool = True,
        is_senior_candidate_vs_junior_jd: bool = False,
        missing_skills_count: int = -1
    ) -> int:
        """
        Compute hiring probability percentage.
        
        Args:
            cosine_score: final weighted match score
            resume_skills: normalized resume skills
            jd_skills: normalized JD skills
            resume_years: years of experience
            jd_years_required: required years
            domain: job domain (tech, finance, etc.)
            seniority_level_match: whether levels match
            is_senior_candidate_vs_junior_jd: overqualified flag
            missing_skills_count: count of missing skills to boost probability if 0
            
        Returns:
            hiring probability percentage [1, 99]
        """
        boost = keyword_boost(
            resume_skills,
            jd_skills,
            max_boost=self.config.keyword_boost_max
        )
        
        penalty = experience_penalty(
            resume_years,
            jd_years_required,
            penalty_per_year=self.config.exp_penalty_per_year
        )
        
        domain_factor = self.config.get_domain_factor(domain)
        
        prob = hiring_probability(
            cosine_score=cosine_score,
            keyword_boost_val=boost,
            exp_penalty_val=penalty,
            domain_factor=domain_factor,
            seniority_level_match=seniority_level_match,
            is_senior_candidate_vs_junior_jd=is_senior_candidate_vs_junior_jd,
            missing_skills_count=missing_skills_count
        )
        
        return prob
    
    def rank_titles(self, resume_embedding, job_titles: list) -> list:
        """Rank job titles by relevance."""
        return rank_job_titles(resume_embedding, job_titles, self.embedder.embed)


def get_scorer() -> Scorer:
    """Get or create scorer instance."""
    return Scorer(_scoring_config)
