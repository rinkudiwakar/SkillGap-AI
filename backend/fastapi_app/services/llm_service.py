"""
LLM Service Layer for Dual Provider Support (Groq + Together AI).
Handles centralized LLM requests with intelligent failover.

PRIMARY: Groq (llama3-70b-8192) - fast, low-cost
FALLBACK: Together AI (mistralai/Mistral-Small-24B-Instruct-2501) - reliable fallback

Single API call per analysis with strict JSON output.
"""
import os
import json
import time
import re
from typing import List, Dict, Any, Optional, Literal
import requests

from fastapi_app.config import get_config
from fastapi_app.utils.prompt_loader import load_prompt
from src.logger.logging import get_logger

logger = get_logger(__name__)

config = get_config()


class LLMServiceError(Exception):
    """Base exception for LLM service errors."""
    pass


class LLMProviderError(LLMServiceError):
    """Exception for LLM provider-specific errors."""
    pass


class GroqProvider:
    """Groq Provider - Primary LLM service using llama3-70b-8192."""
    
    def __init__(self):
        """Initialize Groq provider."""
        self.api_key = os.getenv("GROQ_API_KEY") or config.GROQ_API_KEY
        self.model = "llama-3.3-70b-versatile"
        self.base_url = "https://api.groq.com/openai/v1"
        
        if not self.api_key:
            raise LLMProviderError("GROQ_API_KEY not configured")
        
        logger.info(f"Groq provider initialized with model: {self.model}")
    
    def call(
        self,
        prompt: str,
        max_retries: int = 1,
        temperature: float = 0.3,
        timeout: int = 6
    ) -> str:
        """
        Call Groq API.
        
        Args:
            prompt: prompt text
            max_retries: number of retries
            temperature: sampling temperature
            timeout: request timeout in seconds
            
        Returns:
            model response
            
        Raises:
            LLMProviderError: if call fails
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert career advisor. Return ONLY valid JSON with no additional text or explanations."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": temperature,
            "max_tokens": 2000,
            "top_p": 1
        }
        
        for attempt in range(max_retries):
            try:
                logger.info(f"[GROQ] Attempt {attempt + 1}/{max_retries}: Calling Groq API (timeout={timeout}s)")
                
                response = requests.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=timeout
                )
                
                logger.info(f"[GROQ] Response status: {response.status_code}")
                
                # Handle rate limiting
                if response.status_code == 429:
                    delay = min(2 ** attempt, 4)  # Cap delay at 4 seconds
                    logger.warning(f"[GROQ] Rate limited (429). Retrying in {delay}s...")
                    time.sleep(delay)
                    continue
                
                response.raise_for_status()
                result = response.json()
                
                # Extract content
                try:
                    content = result["choices"][0]["message"]["content"].strip()
                    logger.info(f"[GROQ] ✅ Success - Response length: {len(content)} chars")
                    return content
                except (KeyError, IndexError, TypeError) as e:
                    logger.error(f"[GROQ] Unexpected response structure: {e}")
                    raise LLMProviderError(f"Invalid response structure: {e}")
            
            except requests.exceptions.Timeout:
                logger.error(f"[GROQ] ⏱️  TIMEOUT on attempt {attempt + 1}/{max_retries}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                else:
                    raise LLMProviderError(f"Groq timeout after {max_retries} retries")
            
            except requests.exceptions.ConnectionError as e:
                logger.error(f"[GROQ] 🔌 CONNECTION ERROR: {e}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                else:
                    raise LLMProviderError(f"Groq connection error: {e}")
            
            except requests.exceptions.HTTPError as e:
                logger.error(f"[GROQ] ❌ HTTP ERROR: {e}")
                raise LLMProviderError(f"Groq HTTP error: {e}")
            
            except requests.exceptions.RequestException as e:
                logger.error(f"[GROQ] API error: {e}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                else:
                    raise LLMProviderError(f"Groq API failed: {e}")
            
            except Exception as e:
                logger.error(f"[GROQ] Unexpected error: {e}")
                raise LLMProviderError(f"Groq error: {e}")
        
        raise LLMProviderError("Groq: Max retries exceeded")


class TogetherAIProvider:
    """Together AI Provider - Fallback using mistralai/Mistral-Small-24B-Instruct-2501."""
    
    def __init__(self):
        """Initialize Together AI provider."""
        self.api_key = os.getenv("TOGETHER_API_KEY") or config.TOGETHER_API_KEY
        self.model = "mistralai/Mistral-Small-24B-Instruct-2501"
        self.base_url = "https://api.together.xyz"
        
        if not self.api_key:
            raise LLMProviderError("TOGETHER_API_KEY not configured")
        
        logger.info(f"Together AI provider initialized with model: {self.model}")
    
    def call(
        self,
        prompt: str,
        max_retries: int = 1,
        temperature: float = 0.3,
        timeout: int = 6
    ) -> str:
        """
        Call Together AI API.
        
        Args:
            prompt: prompt text
            max_retries: number of retries
            temperature: sampling temperature
            timeout: request timeout in seconds
            
        Returns:
            model response
            
        Raises:
            LLMProviderError: if call fails
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert career advisor. Return ONLY valid JSON with no additional text or explanations."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": temperature,
            "max_tokens": 2000,
            "top_p": 1
        }
        
        url = f"{self.base_url}/v1/chat/completions"
        
        for attempt in range(max_retries):
            try:
                logger.info(f"[TOGETHER] Attempt {attempt + 1}/{max_retries}: Calling Together AI API (timeout={timeout}s)")
                
                response = requests.post(
                    url,
                    headers=headers,
                    json=payload,
                    timeout=timeout
                )
                
                logger.info(f"[TOGETHER] Response status: {response.status_code}")
                
                # Handle rate limiting
                if response.status_code == 429:
                    delay = min(2 ** attempt, 4)
                    logger.warning(f"[TOGETHER] Rate limited (429). Retrying in {delay}s...")
                    time.sleep(delay)
                    continue
                
                response.raise_for_status()
                result = response.json()
                
                # Extract content
                try:
                    content = result["choices"][0]["message"]["content"].strip()
                    logger.info(f"[TOGETHER] ✅ Success - Response length: {len(content)} chars")
                    return content
                except (KeyError, IndexError, TypeError) as e:
                    logger.error(f"[TOGETHER] Unexpected response structure: {e}")
                    raise LLMProviderError(f"Invalid response structure: {e}")
            
            except requests.exceptions.Timeout:
                logger.error(f"[TOGETHER] ⏱️  TIMEOUT on attempt {attempt + 1}/{max_retries}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                else:
                    raise LLMProviderError(f"Together AI timeout after {max_retries} retries")
            
            except requests.exceptions.ConnectionError as e:
                logger.error(f"[TOGETHER] 🔌 CONNECTION ERROR: {e}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                else:
                    raise LLMProviderError(f"Together AI connection error: {e}")
            
            except requests.exceptions.HTTPError as e:
                logger.error(f"[TOGETHER] ❌ HTTP ERROR: {e}")
                raise LLMProviderError(f"Together AI HTTP error: {e}")
            
            except requests.exceptions.RequestException as e:
                logger.error(f"[TOGETHER] API error: {e}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                else:
                    raise LLMProviderError(f"Together AI API failed: {e}")
            
            except Exception as e:
                logger.error(f"[TOGETHER] Unexpected error: {e}")
                raise LLMProviderError(f"Together AI error: {e}")
        
        raise LLMProviderError("Together AI: Max retries exceeded")


class LLMService:
    """
    Unified LLM service with dual provider support (Groq + Together AI) and intelligent failover.
    
    - PRIMARY: Groq (llama3-70b-8192) - fast, low-cost
    - FALLBACK: Together AI (Mistral Small) - reliable fallback
    
    Single API call per analysis with strict JSON output validation.
    """
    
    def __init__(self):
        """Initialize LLM service with providers."""
        self.groq_provider = None
        self.together_provider = None
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Initialize available providers."""
        try:
            self.groq_provider = GroqProvider()
            logger.info("✅ Groq provider initialized (PRIMARY)")
        except LLMProviderError as e:
            logger.warning(f"⚠️ Groq provider unavailable: {e}")
        
        try:
            self.together_provider = TogetherAIProvider()
            logger.info("✅ Together AI provider initialized (FALLBACK)")
        except LLMProviderError as e:
            logger.warning(f"⚠️ Together AI provider unavailable: {e}")
        
        if not self.groq_provider and not self.together_provider:
            raise LLMServiceError("❌ No LLM providers configured. Set GROQ_API_KEY or TOGETHER_API_KEY")
    
    def _extract_json_from_response(self, response: str) -> Dict[str, Any]:
        """
        Safely extract and parse JSON from LLM response.
        Handles cases where LLM adds extra text.
        
        Args:
            response: LLM response string
            
        Returns:
            parsed JSON dict
            
        Raises:
            LLMServiceError: if JSON parsing fails
        """
        try:
            # First, try parsing directly
            return json.loads(response)
        except json.JSONDecodeError:
            pass
        
        # Try to find JSON object in response
        try:
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                json_str = json_match.group(0)
                return json.loads(json_str)
        except (json.JSONDecodeError, AttributeError):
            pass
        
        logger.error(f"Failed to extract JSON from response:\n{response[:500]}")
        raise LLMServiceError("Could not parse JSON from LLM response")
    
    def _call_provider(
        self,
        provider: Optional[Any],
        prompt: str,
        temperature: float = 0.3,
        timeout: int = 6
    ) -> str:
        """
        Call an LLM provider with timeout.
        
        Args:
            provider: provider instance
            prompt: prompt text
            temperature: sampling temperature
            timeout: request timeout in seconds
            
        Returns:
            model response
            
        Raises:
            LLMProviderError: if call fails
        """
        if not provider:
            raise LLMProviderError("Provider not available")
        
        return provider.call(prompt, max_retries=1, temperature=temperature, timeout=timeout)
    
    def _validate_json_structure(
        self,
        data: Dict[str, Any],
        required_fields: Dict[str, type]
    ) -> None:
        """
        Validate JSON structure matches required fields and types.
        
        Args:
            data: parsed JSON data
            required_fields: dict of {field_name: expected_type}
            
        Raises:
            LLMServiceError: if validation fails
        """
        for field, expected_type in required_fields.items():
            if field not in data:
                raise LLMServiceError(f"Missing required field: {field}")
            
            if not isinstance(data[field], expected_type):
                actual_type = type(data[field]).__name__
                expected_name = expected_type.__name__
                raise LLMServiceError(
                    f"Invalid type for '{field}': expected {expected_name}, got {actual_type}"
                )
    
    def analyze_resume_comprehensive(
        self,
        existing_skills: List[str],
        target_role: str,
        missing_skills: List[str],
        jd_role: str,
        jd_required_skills: List[str],
        jd_seniority: str,
        jd_years: int,
        resume_text: str = "", # New parameter
        priority: Literal["high", "low"] = "high"
    ) -> Dict[str, Any]:
        """
        **Comprehensive single-call analysis** - ONE API call for ALL analysis.
        
        Returns structured JSON with:
        - strengths: list of candidate strengths
        - weaknesses: list of areas to improve
        - missing_skills: critical skills gap
        - recommended_roles: alternative roles
        - rewritten_bullets: high-impact resume improvements
        - roadmap: 30/60/90 day learning plan
        
        Args:
            existing_skills: candidate's current skills
            target_role: target job role
            missing_skills: skills gap (top 3-5)
            jd_role: JD role title
            jd_required_skills: required skills
            jd_seniority: seniority level
            jd_years: years of experience required
            resume_text: raw resume content for bullet rewriting
            priority: "high" for better quality
            
        Returns:
            Dict with structured analysis
            
        Raises:
            LLMServiceError: if analysis fails
        """
        try:
            # Load and format prompt
            prompt_template = load_prompt("analyze.txt")
            
            existing_str = ", ".join(existing_skills[:10]) if existing_skills else "None"
            missing_str = ", ".join(missing_skills[:5]) if missing_skills else "None"
            jd_skills_str = ", ".join(jd_required_skills[:10]) if jd_required_skills else "None"
            
            # Use raw resume text snippet to keep context window safe but useful
            resume_snippet = resume_text[:4000] if resume_text else "No content"

            prompt = prompt_template.format(
                existing_skills=existing_str,
                target_role=target_role,
                missing_skills=missing_str,
                jd_role=jd_role,
                jd_required_skills=jd_skills_str,
                jd_seniority=jd_seniority,
                jd_years=jd_years,
                resume_text=resume_snippet
            )
            
            logger.info(f"[ANALYSIS] Starting comprehensive analysis for: {target_role}")
            
            # Try Groq first (PRIMARY)
            response = None
            if self.groq_provider:
                try:
                    logger.info("[ANALYSIS] Attempting Groq (PRIMARY)...")
                    response = self._call_provider(self.groq_provider, prompt, timeout=30)
                    logger.info("[ANALYSIS] ✅ Groq succeeded")
                except LLMProviderError as e:
                    logger.warning(f"[ANALYSIS] Groq failed: {e}. Trying fallback...")
            
            # Try Together AI (FALLBACK)
            if response is None and self.together_provider:
                try:
                    logger.info("[ANALYSIS] Attempting Together AI (FALLBACK)...")
                    response = self._call_provider(self.together_provider, prompt, timeout=30)
                    logger.info("[ANALYSIS] ✅ Together AI succeeded")
                except LLMProviderError as e:
                    logger.error(f"[ANALYSIS] Together AI also failed: {e}")
                    raise LLMServiceError(f"All providers failed: {e}")
            
            if response is None:
                raise LLMServiceError("No LLM providers available")
            
            # Parse and validate JSON
            parsed = self._extract_json_from_response(response)
            
            required_fields = {
                "strengths": list,
                "weaknesses": list,
                "missing_skills": list,
                "recommended_roles": list,
                "rewritten_bullets": list, # New required field
                "roadmap": dict
            }
            
            self._validate_json_structure(parsed, required_fields)
            
            # Validate roadmap structure
            roadmap = parsed.get("roadmap", {})
            if not isinstance(roadmap, dict):
                raise LLMServiceError("roadmap must be a dictionary")
            
            required_roadmap_keys = {"30_days", "60_days", "90_days"}
            roadmap_keys = set(roadmap.keys())
            if not required_roadmap_keys.issubset(roadmap_keys):
                missing_keys = required_roadmap_keys - roadmap_keys
                raise LLMServiceError(f"Missing roadmap keys: {missing_keys}")
            
            logger.info("[ANALYSIS] ✅ Comprehensive analysis completed and validated")
            return parsed
        
        except LLMServiceError as e:
            logger.error(f"[ANALYSIS] LLM Service Error: {e}")
            raise
        except Exception as e:
            logger.error(f"[ANALYSIS] Unexpected error: {e}", exc_info=True)
            raise LLMServiceError(f"Analysis failed: {e}")
    
    def rewrite_bullets(
        self,
        jd_keywords: List[str],
        role: str,
        bullets: List[str],
        priority: Literal["high", "low"] = "high"
    ) -> List[str]:
        """
        Rewrite resume bullets in single API call.
        
        Args:
            jd_keywords: JD keywords
            role: target job role
            bullets: list of bullets to rewrite
            priority: priority level (not used - both use same providers)
            
        Returns:
            list of rewritten bullets
            
        Raises:
            LLMServiceError: if rewriting fails
        """
        if not bullets:
            logger.warning("No bullets provided for rewriting")
            return []
        
        try:
            prompt_template = load_prompt("rewrite.txt")
            
            keywords_str = ", ".join(jd_keywords[:10]) if jd_keywords else "keywords"
            bullets_text = "\n".join([f"- {b}" for b in bullets])
            
            prompt = prompt_template.format(
                jd_keywords=keywords_str,
                role=role,
                bullets=bullets_text
            )
            
            logger.info(f"[REWRITE] Rewriting {len(bullets)} bullets for role: {role}")
            
            # Try Groq first
            response = None
            if self.groq_provider:
                try:
                    logger.info("[REWRITE] Attempting Groq...")
                    response = self._call_provider(self.groq_provider, prompt, timeout=30)
                    logger.info("[REWRITE] ✅ Groq succeeded")
                except LLMProviderError as e:
                    logger.warning(f"[REWRITE] Groq failed: {e}. Trying fallback...")
            
            # Try Together AI fallback
            if response is None and self.together_provider:
                try:
                    logger.info("[REWRITE] Attempting Together AI...")
                    response = self._call_provider(self.together_provider, prompt, timeout=30)
                    logger.info("[REWRITE] ✅ Together AI succeeded")
                except LLMProviderError as e:
                    logger.error(f"[REWRITE] Together AI failed: {e}")
                    raise LLMServiceError(f"All providers failed: {e}")
            
            if response is None:
                raise LLMServiceError("No LLM providers available")
            
            # Parse JSON
            parsed = self._extract_json_from_response(response)
            rewritten_bullets = parsed.get("rewritten_bullets", [])
            
            # Validate count
            if len(rewritten_bullets) != len(bullets):
                logger.warning(
                    f"Bullet count mismatch: input={len(bullets)}, output={len(rewritten_bullets)}. "
                    f"Using original bullets."
                )
                return bullets
            
            logger.info(f"[REWRITE] ✅ Successfully rewritten {len(rewritten_bullets)} bullets")
            return rewritten_bullets
        
        except LLMServiceError as e:
            logger.error(f"[REWRITE] LLM Service Error: {e}. Returning original bullets.")
            return bullets
        except Exception as e:
            logger.error(f"[REWRITE] Unexpected error: {e}. Returning original bullets.")
            return bullets


# Singleton instance
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """
    Get LLM service singleton.
    
    Returns:
        LLM service instance with Groq + Together AI providers
    """
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
