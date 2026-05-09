import sys
import os
from pathlib import Path

BACKEND_DIR = Path('D:/ResumeAI/SkillGap-AI/backend')
PROJECT_ROOT = BACKEND_DIR.parent
AI_DIR = PROJECT_ROOT / 'ai'
for p in [BACKEND_DIR, PROJECT_ROOT, AI_DIR]:
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))

from fastapi_app.services.llm_service import get_llm_service

service = get_llm_service()
try:
    res = service.analyze_resume_comprehensive(
        existing_skills=['Python', 'Django', 'FastAPI'],
        target_role='Backend Engineer',
        missing_skills=[],
        gap_count=0,
        match_score=85,
        jd_role='Backend Engineer',
        jd_required_skills=['Python', 'Django', 'FastAPI'],
        jd_seniority='mid',
        jd_years=3,
        resume_text='Developed Python applications using Django and FastAPI.',
        priority='high'
    )
    import json
    print("=== RESULT ===")
    print(json.dumps(res, indent=2))
except Exception as e:
    print("=== ERROR ===")
    print(e)
