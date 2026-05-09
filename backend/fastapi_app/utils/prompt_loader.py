"""
Prompt loader utility for loading prompts from files.
Centralizes all prompt management in /prompts directory.
"""
from pathlib import Path
from typing import Optional
from ai.src.logger.logging import get_logger

logger = get_logger(__name__)

# Project paths
BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_DIR.parent if BACKEND_DIR.name == "backend" else BACKEND_DIR
PROMPTS_DIR = PROJECT_ROOT / "ai" / "prompts"


def load_prompt(filename: str) -> str:
    """
    Load a prompt from /prompts directory.
    
    Args:
        filename: name of prompt file (e.g., 'rewrite.txt')
        
    Returns:
        prompt text content
        
    Raises:
        FileNotFoundError: if prompt file doesn't exist
        IOError: if file cannot be read
    """
    prompt_path = PROMPTS_DIR / filename
    
    if not prompt_path.exists():
        logger.error(f"Prompt file not found: {prompt_path}")
        raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
    
    try:
        with open(prompt_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            logger.debug(f"Loaded prompt: {filename}")
            return content
    except IOError as e:
        logger.error(f"Failed to read prompt file {filename}: {e}")
        raise


def get_prompt_path(filename: str) -> Path:
    """
    Get full path to a prompt file.
    
    Args:
        filename: name of prompt file
        
    Returns:
        full path to prompt file
    """
    return PROMPTS_DIR / filename
