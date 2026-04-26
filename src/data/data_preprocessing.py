"""
Data preprocessing module - normalizes and cleans text and skills.
Extracted from production_style_code_skillGap_ai.ipynb
"""
import re
import json
from typing import List, Dict, Any, Optional
from src.logger.logging import get_logger

logger = get_logger(__name__)


def clean_text(text: str) -> str:
    """
    Lower-case, remove special chars, collapse whitespace.
    
    Args:
        text: raw text input
        
    Returns:
        cleaned text
    """
    if not text:
        return ""
    
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def clean_skill(skill: str) -> str:
    """
    Clean a single skill string.
    Remove brackets, special chars, collapse whitespace.
    
    Args:
        skill: raw skill string
        
    Returns:
        cleaned skill
    """
    if not skill:
        return ""
    
    skill = skill.lower().strip()
    skill = re.sub(r'\(.*?\)', '', skill)  # remove brackets
    skill = re.sub(r'[^a-z0-9\.\+\#]', ' ', skill)  # keep only alphanumeric + . + # +
    skill = re.sub(r'\s+', ' ', skill)
    return skill.strip()


def normalize_skills(skills: List[str]) -> List[str]:
    """
    Normalize a list of skills:
    - lowercase
    - remove special chars
    - standardize replacements (-, _)
    - deduplicate
    
    Args:
        skills: list of raw skill strings
        
    Returns:
        normalized, deduplicated skill list
    """
    if not skills:
        return []
    
    normalized = []
    
    for s in skills:
        if not s:
            continue
        
        s = s.lower().strip()
        s = re.sub(r'[^a-z0-9\s+#]', '', s)
        s = s.replace('-', ' ').replace('_', ' ')
        s = re.sub(r'\s+', ' ', s)
        
        if s:
            normalized.append(s)
    
    return list(set(normalized))


def clean_jd_skills(skills: List[str]) -> List[str]:
    """Clean JD skills list."""
    if not skills:
        return []
    return [clean_skill(s) for s in skills if s]


# Filter out non-technical soft skills
NON_TECH_SKILLS = {
    "problem solving",
    "business strategy",
    "technical leadership",
    "communication",
    "teamwork",
    "leadership",
    "management",
    "critical thinking",
    "analytical skills",
    "attention to detail"
}


def filter_technical(skills: List[str]) -> List[str]:
    """
    Filter out non-technical soft skills.
    
    Args:
        skills: list of skills
        
    Returns:
        filtered list with only technical skills
    """
    return [s for s in skills if s not in NON_TECH_SKILLS]


def expand_skills(
    skills: List[str],
    skill_expansion_map: Optional[Dict[str, List[str]]] = None,
    max_expansions: int = 3
) -> List[str]:
    """
    Expand skills using mapping (e.g., 'Python' → ['Django', 'FastAPI', 'Flask']).
    Prevents skill explosion by limiting expansions per skill.
    
    Args:
        skills: base skills to expand
        skill_expansion_map: mapping from skill to related skills
        max_expansions: max expansion items per skill
        
    Returns:
        expanded deduplicated skill list
    """
    if not skills:
        return []
    
    if not skill_expansion_map:
        return list(set(skills))
    
    expanded = []
    
    for s in skills:
        s_clean = clean_skill(s)
        expanded.append(s_clean)
        
        # Get expansions from map
        expansions = skill_expansion_map.get(s_clean, [])
        
        if isinstance(expansions, dict):
            # Handle nested dict structure
            flat = []
            for v in expansions.values():
                if isinstance(v, list):
                    flat.extend(v)
            expansions = flat
        elif not isinstance(expansions, list):
            expansions = []
        
        # Limit expansions and clean them
        for exp in expansions[:max_expansions]:
            exp_clean = clean_skill(exp)
            if exp_clean:
                expanded.append(exp_clean)
    
    # Deduplicate strictly
    return list(set(expanded))


def get_skill_expansions(
    skill: str,
    skill_expansion_map: Optional[Dict[str, List[str]]] = None,
    max_expansions: int = 3
) -> List[str]:
    """
    Get expansion items for a single skill.
    
    Args:
        skill: skill to expand
        skill_expansion_map: mapping dict
        max_expansions: limit on expansions
        
    Returns:
        list of expansion skills
    """
    if not skill_expansion_map:
        return []
    
    skill_key = clean_skill(skill)
    expansions = skill_expansion_map.get(skill_key, [])
    
    if isinstance(expansions, dict):
        flat = []
        for v in expansions.values():
            if isinstance(v, list):
                flat.extend(v)
        return flat[:max_expansions]
    elif isinstance(expansions, list):
        return expansions[:max_expansions]
    
    return []


def process_resume_skills(
    skills: List[str],
    skill_expansion_map: Optional[Dict[str, List[str]]] = None,
    use_expansion: bool = True,
    max_expansions: int = 3
) -> List[str]:
    """
    Process resume skills: normalize → optionally expand → filter technical → deduplicate.
    
    Args:
        skills: raw resume skills
        skill_expansion_map: optional skill expansion mapping
        use_expansion: whether to apply skill expansion
        max_expansions: limit expansion items
        
    Returns:
        processed skill list
    """
    if not skills:
        return []
    
    normalized = normalize_skills(skills)
    
    if not use_expansion or not skill_expansion_map:
        filtered = filter_technical(normalized)
        return list(set(filtered))
    
    expanded = expand_skills(normalized, skill_expansion_map, max_expansions)
    filtered = filter_technical(expanded)
    
    return list(set(filtered))


def process_jd_skills(
    skills: List[str],
    skill_expansion_map: Optional[Dict[str, List[str]]] = None,
    use_expansion: bool = True,
    max_expansions: int = 3
) -> List[str]:
    """
    Process JD skills: normalize → optionally expand → deduplicate.
    (Note: don't filter JD skills as they define requirements)
    
    Args:
        skills: raw JD skills
        skill_expansion_map: optional skill expansion mapping
        use_expansion: whether to apply skill expansion
        max_expansions: limit expansion items
        
    Returns:
        processed skill list
    """
    if not skills:
        return []
    
    normalized = normalize_skills(skills)
    
    if not use_expansion or not skill_expansion_map:
        return list(set(normalized))
    
    expanded = expand_skills(normalized, skill_expansion_map, max_expansions)
    return list(set(expanded))


def load_skill_expansion_map(file_path: str) -> Optional[Dict[str, Any]]:
    """
    Load skill expansion mapping from JSON file.
    
    Args:
        file_path: path to skill_expansion.json
        
    Returns:
        skill expansion dictionary or None if load fails
    """
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.warning(f"Skill expansion file not found: {file_path}")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse skill expansion file: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error loading skill expansion: {e}")
        return None
