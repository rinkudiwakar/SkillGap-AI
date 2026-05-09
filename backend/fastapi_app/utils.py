"""
Utility functions for SkillGap AI.
"""
from typing import Dict, Any, List, Optional
from pathlib import Path
import json
from ai.src.logger.logging import get_logger

logger = get_logger(__name__)


def load_json_file(file_path: str) -> Optional[Dict[str, Any]]:
    """
    Load JSON file safely.
    
    Args:
        file_path: path to JSON file
        
    Returns:
        parsed dict or None if load fails
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"File not found: {file_path}")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in {file_path}: {e}")
        return None
    except Exception as e:
        logger.error(f"Error loading {file_path}: {e}")
        return None


def save_json_file(data: Dict[str, Any], file_path: str) -> bool:
    """
    Save data to JSON file safely.
    
    Args:
        data: data to save
        file_path: path to save to
        
    Returns:
        True if successful, False otherwise
    """
    try:
        path = Path(file_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        logger.error(f"Error saving to {file_path}: {e}")
        return False


def truncate_text(text: str, max_length: int = 500, suffix: str = "...") -> str:
    """
    Truncate text to max length.
    
    Args:
        text: text to truncate
        max_length: maximum length
        suffix: suffix to append if truncated
        
    Returns:
        truncated text
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def format_percentage(value: float, decimals: int = 2) -> str:
    """
    Format float as percentage string.
    
    Args:
        value: value between 0 and 1
        decimals: decimal places
        
    Returns:
        formatted percentage string
    """
    return f"{value * 100:.{decimals}f}%"


def format_score(value: float, decimals: int = 2) -> str:
    """
    Format score value.
    
    Args:
        value: score between 0 and 1
        decimals: decimal places
        
    Returns:
        formatted score string
    """
    return f"{value:.{decimals}f}"


def categorize_score(score: float) -> str:
    """
    Categorize match score.
    
    Args:
        score: score between 0 and 1
        
    Returns:
        category string
    """
    if score >= 0.85:
        return "Excellent"
    elif score >= 0.70:
        return "Good"
    elif score >= 0.55:
        return "Moderate"
    elif score >= 0.40:
        return "Weak"
    else:
        return "Poor"


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Split text into overlapping chunks.
    
    Args:
        text: text to chunk
        chunk_size: size of each chunk
        overlap: overlap between chunks
        
    Returns:
        list of text chunks
    """
    if not text or chunk_size <= 0:
        return []
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        start = end - overlap
        
        if start >= len(text):
            break
    
    return chunks
