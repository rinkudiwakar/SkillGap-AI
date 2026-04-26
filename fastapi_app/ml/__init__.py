"""ML module for FastAPI app."""
from fastapi_app.ml.embedder import get_embedder, embed
from fastapi_app.ml.scorer import get_scorer, Scorer
from fastapi_app.ml.matcher import get_skill_matcher, SkillMatcher

__all__ = [
    'get_embedder',
    'embed',
    'get_scorer',
    'Scorer',
    'get_skill_matcher',
    'SkillMatcher'
]
