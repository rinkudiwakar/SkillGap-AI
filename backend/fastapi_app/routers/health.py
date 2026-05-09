"""
Health router - health check and readiness probe endpoints.
"""
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
from src.logger.logging import get_logger
import redis

logger = get_logger(__name__)

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    summary="Health check",
    description="Basic health check endpoint"
)
async def health() -> Dict[str, str]:
    """
    Basic health check.
    
    Returns:
        dict with status
    """
    logger.info("Health check requested")
    return {"status": "ok"}


@router.get(
    "/ready",
    summary="Readiness probe",
    description="Check if service is ready (all dependencies healthy)"
)
async def ready() -> Dict[str, Any]:
    """
    Readiness probe - check all dependencies.
    
    Returns:
        dict with readiness status and component health
    """
    logger.info("Readiness check requested")
    
    from fastapi_app.config import get_config
    
    config = get_config()
    readiness = {
        'ready': True,
        'components': {}
    }
    
    # Check Redis
    try:
        r = redis.from_url(config.REDIS_URL, decode_responses=True)
        r.ping()
        readiness['components']['redis'] = 'healthy'
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        readiness['components']['redis'] = 'unhealthy'
        readiness['ready'] = False
    
    # Check embedding model availability
    try:
        from fastapi_app.ml.embedder import get_embedder
        embedder = get_embedder()
        if embedder.get() is not None:
            readiness['components']['embedding_model'] = 'loaded'
        else:
            readiness['components']['embedding_model'] = 'not_loaded'
    except Exception as e:
        logger.error(f"Embedding model check failed: {e}")
        readiness['components']['embedding_model'] = 'unhealthy'
        readiness['ready'] = False
    
    # Check Celery worker availability
    try:
        from fastapi_app.worker import app as celery_app
        celery_app.control.inspect().active()
        readiness['components']['celery'] = 'healthy'
    except Exception as e:
        logger.warning(f"Celery check failed: {e}")
        readiness['components']['celery'] = 'warning'
    
    if not readiness['ready']:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service not ready",
            headers={"X-Readiness": "not-ready"}
        )
    
    return readiness


@router.get(
    "/version",
    summary="API version",
    description="Get API version"
)
async def version() -> Dict[str, str]:
    """Get API version."""
    return {
        'version': '1.0.0',
        'name': 'SkillGap AI API',
        'status': 'production'
    }
