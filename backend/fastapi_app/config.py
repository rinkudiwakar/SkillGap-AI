"""
Configuration management for FastAPI app.
Loads from params.yaml, environment variables, and .env files.
"""
import os
from typing import Optional, Dict, Any
from pathlib import Path
import yaml
from dotenv import load_dotenv
from src.logger.logging import get_logger

logger = get_logger(__name__)

# Project paths
BACKEND_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_DIR.parent if BACKEND_DIR.name == "backend" else BACKEND_DIR
AI_DIR = PROJECT_ROOT / "ai"
ENV_DIR = PROJECT_ROOT / "env"

# Load .env file
for ENV_FILE in (ENV_DIR / ".env", PROJECT_ROOT / ".env"):
    if ENV_FILE.exists():
        load_dotenv(ENV_FILE)


class Config:
    """Main configuration class."""
    
    # Application
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = APP_ENV == "development"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
    
    # GitHub Models
    GITHUB_PAT: str = os.getenv("GITHUB_PAT", "")
    GITHUB_MODELS_API_URL: str = os.getenv(
        "GITHUB_MODELS_API_URL",
        "https://models.github.ai/inference/chat/completions"
    )
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    
    # LLM Providers (Primary & Fallback)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    TOGETHER_API_KEY: str = os.getenv("TOGETHER_API_KEY", "")
    
    # Legacy providers (deprecated)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # AWS
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_DEFAULT_REGION: str = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "skillgap-resumes")
    
    # Redis / Celery
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1")
    
    # Vector Store
    VECTOR_STORE_TYPE: str = os.getenv("VECTOR_STORE_TYPE", "chroma")  # chroma or pinecone
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "skillgap-titles")
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
    
    # MLflow / Dagshub
    MLFLOW_TRACKING_URI: str = os.getenv("MLFLOW_TRACKING_URI", "")
    MLFLOW_TRACKING_USERNAME: str = os.getenv("MLFLOW_TRACKING_USERNAME", "")
    MLFLOW_TRACKING_PASSWORD: str = os.getenv("MLFLOW_TRACKING_PASSWORD", "")
    MLFLOW_MODEL_NAME: str = os.getenv("MLFLOW_MODEL_NAME", "skillgap-embedder")
    
    # Feature flags
    USE_SKILL_EXPANSION: bool = os.getenv("USE_SKILL_EXPANSION", "true").lower() == "true"
    
    @classmethod
    def load_params_yaml(cls) -> Dict[str, Any]:
        """Load params.yaml configuration."""
        params_path = AI_DIR / "params.yaml"
        
        try:
            if params_path.exists():
                with open(params_path, 'r') as f:
                    return yaml.safe_load(f) or {}
            else:
                logger.warning(f"params.yaml not found at {params_path}")
                return {}
        except Exception as e:
            logger.error(f"Failed to load params.yaml: {e}")
            return {}
    
    @classmethod
    def get_params(cls) -> Dict[str, Any]:
        """Get parameters dictionary."""
        return cls.load_params_yaml()


# Singleton config instance
_config = Config()


def get_config() -> Config:
    """Get configuration instance."""
    return _config


def get_params() -> Dict[str, Any]:
    """Get parameters dictionary from params.yaml."""
    return Config.get_params()
