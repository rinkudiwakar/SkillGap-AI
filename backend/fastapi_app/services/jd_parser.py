"""
Job Description parser service - extracts structured data from JD text.
Uses LLM-based extraction with fallback heuristics.
"""
from typing import Optional, Dict, Any, List
import requests
import json
import time
from bs4 import BeautifulSoup
from fastapi_app.config import get_config
from src.logger.logging import get_logger

logger = get_logger(__name__)


class JDParser:
    """Parse job descriptions to extract structured data."""
    
    def __init__(self):
        """Initialize JD parser."""
        self.config = get_config()
    
    def extract_via_llm(self, jd_text: str, max_retries: int = 3) -> Dict[str, Any]:
        """
        Extract JD structure using LLM (GitHub Models).
        
        Args:
            jd_text: raw JD text
            max_retries: retry count for rate limiting
            
        Returns:
            dict with extracted JD data
        """
        if not jd_text:
            logger.warning("Empty JD text provided")
            return self._get_empty_jd()
        
        prompt = f"""Extract structured job description data.

Return JSON only (no markdown, no code blocks):
{{
 "required_skills": [],
 "preferred_skills": [],
 "role": "",
 "seniority_level": "junior|mid|senior",
 "years_required": 0,
 "description": ""
}}

JD Text:
{jd_text}"""
        
        try:
            response_text = self._call_llm(prompt, max_retries)
            data = self._parse_json_response(response_text)
            
            if self._validate_jd_data(data):
                logger.info(f"JD extraction successful. Skills: {len(data.get('required_skills', []))}")
                return data
            else:
                logger.warning("JD extraction returned invalid structure, using fallback")
                return self._extract_via_heuristics(jd_text)
        
        except Exception as e:
            logger.error(f"LLM-based JD extraction failed: {e}, using fallback")
            return self._extract_via_heuristics(jd_text)
    
    def _call_llm(self, prompt: str, max_retries: int = 3) -> str:
        """
        Call LLM API (GitHub Models only).
        Includes exponential backoff for rate limiting.
        
        Args:
            prompt: prompt text
            max_retries: retry count
            
        Returns:
            LLM response
        """
        use_github_models = bool(self.config.GITHUB_PAT)
        
        if use_github_models:
            return self._call_github_models_api(prompt, max_retries)
        else:
            logger.error("GitHub Models API credentials are not configured")
            raise ValueError("GitHub Models API not configured")
    
    def _call_github_models_api(self, prompt: str, max_retries: int) -> str:
        """Call GitHub Models API."""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {self.config.GITHUB_PAT}"
        }
        
        payload = {
            "model": "openai/gpt-4.1",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1000,
            "temperature": 0.3
        }
        
        for attempt in range(max_retries):
            try:
                response = requests.post(
                    self.config.GITHUB_MODELS_API_URL,
                    json=payload,
                    headers=headers,
                    timeout=30
                )
                
                if response.status_code == 429:  # Rate limit
                    delay = 2 ** attempt
                    logger.warning(f"Rate limited. Retry {attempt + 1}/{max_retries} in {delay}s")
                    time.sleep(delay)
                    continue
                
                response.raise_for_status()
                result = response.json()
                
                # Safely access nested keys
                try:
                    return result["choices"][0]["message"]["content"]
                except (KeyError, IndexError, TypeError) as e:
                    logger.error(f"Unexpected API response structure: {e}, response: {result}")
                    return ""
            
            except requests.exceptions.RequestException as e:
                logger.error(f"API call failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    raise
        
        raise RuntimeError("Max retries exceeded for LLM API")
    
    @staticmethod
    def _parse_json_response(response_text: str) -> Dict[str, Any]:
        """
        Parse JSON from LLM response.
        Handles markdown code blocks, extra whitespace, etc.
        
        Args:
            response_text: LLM response text
            
        Returns:
            parsed dict
        """
        try:
            # Try direct JSON parse
            return json.loads(response_text)
        except json.JSONDecodeError:
            pass
        
        # Try extracting JSON from markdown code blocks
        if '```json' in response_text:
            start = response_text.find('```json') + 7
            end = response_text.rfind('```')
            json_str = response_text[start:end].strip()
            return json.loads(json_str)
        
        # Try extracting any JSON object
        if '{' in response_text and '}' in response_text:
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            json_str = response_text[start:end]
            return json.loads(json_str)
        
        logger.error("Could not parse JSON from LLM response")
        return {}
    
    @staticmethod
    def _validate_jd_data(data: Dict[str, Any]) -> bool:
        """Validate JD data structure."""
        required_keys = ['required_skills', 'role', 'years_required']
        return all(key in data for key in required_keys)
    
    def _extract_via_heuristics(self, jd_text: str) -> Dict[str, Any]:
        """
        Extract JD data using simple heuristics.
        Fallback when LLM fails.
        
        Args:
            jd_text: raw JD text
            
        Returns:
            dict with extracted data
        """
        logger.info("Using heuristic-based JD extraction")
        
        # Simple keyword-based extraction
        skill_keywords = [
            'python', 'java', 'javascript', 'typescript', 'golang', 'rust', 'c++',
            'react', 'vue', 'angular', 'fastapi', 'django', 'flask', 'spring',
            'kubernetes', 'docker', 'aws', 'gcp', 'azure', 'postgresql', 'mongodb',
            'redis', 'elasticsearch', 'kafka', 'spark', 'hadoop', 'machine learning',
            'deep learning', 'nlp', 'computer vision', 'tensorflow', 'pytorch'
        ]
        
        jd_lower = jd_text.lower()
        found_skills = [s for s in skill_keywords if s in jd_lower]
        
        # Try to extract years requirement
        years = 0
        if 'year' in jd_lower:
            import re
            match = re.search(r'(\d+)\+?\s*years?', jd_lower)
            if match:
                years = int(match.group(1))
        
        # Try to extract role title (usually in first line or header)
        lines = [line.strip() for line in jd_text.split('\n') if line.strip()]
        role = lines[0] if lines else "Unknown Role"
        if len(role) > 100:
            role = "Target Role"
        
        return {
            'required_skills': found_skills[:5] if found_skills else [],
            'preferred_skills': found_skills[5:] if len(found_skills) > 5 else [],
            'role': role,
            'seniority_level': self._infer_seniority(jd_text),
            'years_required': years,
            'description': jd_text[:500]
        }
    
    @staticmethod
    def _infer_seniority(jd_text: str) -> str:
        """Infer seniority level from JD text."""
        text_lower = jd_text.lower()
        
        if any(word in text_lower for word in ['senior', 'lead', 'principal', 'architect']):
            return 'senior'
        elif any(word in text_lower for word in ['junior', 'entry', 'internship', 'graduate']):
            return 'junior'
        else:
            return 'mid'
    
    @staticmethod
    def _get_empty_jd() -> Dict[str, Any]:
        """Return empty JD structure."""
        return {
            'required_skills': [],
            'preferred_skills': [],
            'role': 'Unknown Role',
            'seniority_level': 'mid',
            'years_required': 0,
            'description': ''
        }


def extract_jd_data(jd_text: str) -> Dict[str, Any]:
    """Convenience function to extract JD data."""
    parser = JDParser()
    return parser.extract_via_llm(jd_text)


def fetch_job_description_from_url(url: str, timeout: int = 20) -> str:
    """
    Fetch and extract job description text from a public job URL.

    Args:
        url: job posting URL
        timeout: request timeout in seconds

    Returns:
        extracted plain text suitable for downstream parsing

    Raises:
        ValueError: if URL is invalid or no usable text could be extracted
        requests.RequestException: if the page request fails
    """
    if not url or not url.strip():
        raise ValueError("Job URL cannot be empty")

    normalized_url = url.strip()
    if not normalized_url.startswith(("http://", "https://")):
        raise ValueError("Job URL must start with http:// or https://")

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        )
    }

    response = requests.get(normalized_url, headers=headers, timeout=timeout)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup(["script", "style", "noscript", "svg", "img", "meta"]):
        tag.decompose()

    selectors = [
        "main",
        "article",
        "[role='main']",
        ".job-description",
        ".jobDescriptionContent",
        ".description",
        "#job-description",
        "#jobDescriptionText",
    ]

    extracted_chunks = []
    for selector in selectors:
        for node in soup.select(selector):
            text = node.get_text(" ", strip=True)
            if text and len(text) > 200:
                extracted_chunks.append(text)

    if not extracted_chunks:
        body_text = soup.get_text(" ", strip=True)
        if body_text:
            extracted_chunks.append(body_text)

    cleaned_chunks = []
    for chunk in extracted_chunks:
        normalized = " ".join(chunk.split())
        if len(normalized) > 200:
            cleaned_chunks.append(normalized)

    if not cleaned_chunks:
        raise ValueError("Could not extract usable job description text from the provided URL")

    combined_text = max(cleaned_chunks, key=len)
    logger.info(f"Fetched job description text from URL: {normalized_url}")
    return combined_text
