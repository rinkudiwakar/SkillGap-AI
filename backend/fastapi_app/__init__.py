"""SkillGap AI backend package."""
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parent if BACKEND_DIR.name == "backend" else BACKEND_DIR
AI_DIR = REPO_ROOT / "ai"

for path in (BACKEND_DIR, REPO_ROOT, AI_DIR):
    path_str = str(path)
    if path.exists() and path_str not in sys.path:
        sys.path.insert(0, path_str)
