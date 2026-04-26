"""Chains module for FastAPI app."""
from fastapi_app.chains.llm_chains import (
    ResumeRewriteChain,
    RoadmapChain,
    ResumeOptimizationChain,
    LearningResourcesChain,
    InterviewQuestionsChain,
    rewrite_bullet,
    rewrite_bullets_batch,
    analyze_resume_comprehensive,
    generate_roadmap,
    generate_resume_suggestions,
    generate_learning_resources,
    generate_interview_questions
)

__all__ = [
    'ResumeRewriteChain',
    'RoadmapChain',
    'ResumeOptimizationChain',
    'LearningResourcesChain',
    'InterviewQuestionsChain',
    'rewrite_bullet',
    'rewrite_bullets_batch',
    'analyze_resume_comprehensive',
    'generate_roadmap',
    'generate_resume_suggestions',
    'generate_learning_resources',
    'generate_interview_questions'
]
