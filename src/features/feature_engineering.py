"""
Feature engineering module - builds text representations and generates embeddings.
Extracted from production_style_code_skillGap_ai.ipynb
"""
from typing import List, Dict, Any, Optional
from src.logger.logging import get_logger

logger = get_logger(__name__)


def build_resume_skills_text(resume_data: Dict[str, Any]) -> str:
    """
    Build text representation from resume skills.
    
    Args:
        resume_data: structured resume dict with 'skills' key
        
    Returns:
        comma-separated skills string
    """
    skills = resume_data.get("skills", [])
    if not skills:
        return ""
    return ", ".join(str(s) for s in skills)


def build_resume_projects_text(resume_data: Dict[str, Any]) -> str:
    """
    Build text representation from resume projects.
    Handles both dict and string project formats.
    
    Args:
        resume_data: structured resume dict with 'projects' key
        
    Returns:
        space-separated project descriptions
    """
    projects = resume_data.get("projects", [])
    if not projects:
        return ""
    
    project_descriptions = []
    
    for project in projects:
        if isinstance(project, dict):
            # Prioritize 'name' or 'title', then 'description'
            if project.get("name"):
                project_descriptions.append(project["name"])
            elif project.get("title"):
                project_descriptions.append(project["title"])
            elif project.get("description"):
                project_descriptions.append(project["description"])
            else:
                project_descriptions.append(str(project))
        elif isinstance(project, str):
            project_descriptions.append(project)
    
    return " ".join(project_descriptions)


def build_resume_experience_text(resume_data: Dict[str, Any]) -> str:
    """
    Build text representation from resume experience.
    Combines role, company, and description for each position.
    
    Args:
        resume_data: structured resume dict with 'experience' key
        
    Returns:
        experience text
    """
    experiences = resume_data.get("experience", [])
    if not experiences:
        return ""
    
    experience_descriptions = []
    
    for exp in experiences:
        if isinstance(exp, dict):
            role = exp.get("role", "")
            company = exp.get("company", "")
            description = exp.get("description", "")
            
            parts = [p for p in [role, company, description] if p]
            
            if parts:
                experience_descriptions.append(". ".join(parts))
            else:
                experience_descriptions.append(str(exp))
        elif isinstance(exp, str):
            experience_descriptions.append(exp)
    
    return " ".join(experience_descriptions)


def build_jd_skills_text(jd_data: Dict[str, Any]) -> str:
    """
    Build text representation from JD skills.
    Weight required skills 3x over preferred skills.
    
    Args:
        jd_data: structured JD dict with 'required_skills' and 'preferred_skills'
        
    Returns:
        weighted skills text
    """
    required = jd_data.get("required_skills", [])
    preferred = jd_data.get("preferred_skills", [])
    
    req_text = " ".join(str(s) for s in required)
    pref_text = " ".join(str(s) for s in preferred)
    
    # Weight required skills 3x
    return f"{req_text} {req_text} {req_text} {pref_text}"


def build_jd_role_text(jd_data: Dict[str, Any]) -> str:
    """
    Build text representation from JD role information.
    
    Args:
        jd_data: structured JD dict with 'role' key
        
    Returns:
        role text
    """
    return jd_data.get("role", "")


def build_resume_overall_text(resume_data: Dict[str, Any]) -> str:
    """
    Build comprehensive resume text by combining all sections.
    
    Args:
        resume_data: structured resume dict
        
    Returns:
        overall resume text representation
    """
    skills_text = build_resume_skills_text(resume_data)
    projects_text = build_resume_projects_text(resume_data)
    experience_text = build_resume_experience_text(resume_data)
    
    parts = []
    if skills_text:
        parts.append(f"Skills: {skills_text}")
    if projects_text:
        parts.append(f"Projects: {projects_text}")
    if experience_text:
        parts.append(f"Experience: {experience_text}")
    
    return " ".join(parts)


def build_jd_overall_text(jd_data: Dict[str, Any]) -> str:
    """
    Build comprehensive JD text by combining all sections.
    Weight required skills and role more heavily.
    
    Args:
        jd_data: structured JD dict
        
    Returns:
        overall JD text representation
    """
    required = " ".join(str(s) for s in jd_data.get("required_skills", []))
    preferred = " ".join(str(s) for s in jd_data.get("preferred_skills", []))
    role = jd_data.get("role", "")
    
    # Weight: required 3x, role 2x
    return f"{required} {required} {required} {preferred} {role} {role}"


def extract_resume_sections(resume_text: str) -> Dict[str, str]:
    """
    Extract common resume sections from raw text.
    Helps organize text for better embedding.
    
    Args:
        resume_text: raw resume text
        
    Returns:
        dict with 'skills', 'experience', 'education', 'projects' sections
    """
    sections = {
        "skills": "",
        "experience": "",
        "education": "",
        "projects": ""
    }
    
    # Simple heuristic: look for common section headers
    lines = resume_text.split('\n')
    current_section = None
    
    for line in lines:
        line_lower = line.lower().strip()
        
        if 'skill' in line_lower:
            current_section = 'skills'
        elif 'experience' in line_lower or 'employment' in line_lower:
            current_section = 'experience'
        elif 'education' in line_lower:
            current_section = 'education'
        elif 'project' in line_lower:
            current_section = 'projects'
        elif current_section and line.strip():
            sections[current_section] += line + "\n"
    
    return sections
