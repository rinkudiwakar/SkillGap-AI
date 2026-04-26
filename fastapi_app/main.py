"""
FastAPI application factory and main entry point.
SkillGap AI - Semantic Job Matching & Skill Gap Analysis
"""
from fastapi import FastAPI, middleware
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Dict, Any
import logging

from fastapi_app.config import get_config
from fastapi_app.routers import match, upload, health
from src.logger.logging import configure_logging

# Configure logging
configure_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    
    Startup:
    - Load embedding models
    - Initialize connections
    
    Shutdown:
    - Cleanup resources
    """
    logger.info("=== SkillGap AI API Starting ===")
    
    try:
        # Load embedding model on startup
        from fastapi_app.ml.embedder import get_embedder
        embedder = get_embedder()
        embedder.load()
        logger.info("Embedding model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load embedding model: {e}")
        raise
    
    yield
    
    logger.info("=== SkillGap AI API Shutting Down ===")


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application.
    
    Returns:
        configured FastAPI app instance
    """
    config = get_config()
    
    app = FastAPI(
        title="SkillGap AI",
        description="Semantic job matching and skill gap analysis platform",
        version="1.0.0",
        docs_url="/docs" if config.DEBUG else None,
        redoc_url="/redoc" if config.DEBUG else None,
        lifespan=lifespan
    )
    
    # === MIDDLEWARE ===
    
    # CORS middleware
    allowed_origins = config.ALLOWED_ORIGINS.split(',') if isinstance(config.ALLOWED_ORIGINS, str) else config.ALLOWED_ORIGINS
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        max_age=600
    )
    
    # === ROUTERS ===
    
    # Health check routes (no auth required)
    app.include_router(health.router)
    
    # Matching routes
    app.include_router(match.router)
    
    # Upload routes
    app.include_router(upload.router)
    
    # === ROOT ENDPOINT ===
    
    @app.get("/", tags=["root"])
    async def root() -> Dict[str, Any]:
        """Root endpoint."""
        return {
            "service": "SkillGap AI API",
            "version": "1.0.0",
            "status": "operational",
            "docs": "/docs" if config.DEBUG else None,
            "health": "/health",
            "ready": "/ready"
        }
    
    # === ERROR HANDLERS ===
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request, exc):
        """Handle uncaught exceptions."""
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
    
    logger.info("FastAPI application created successfully")
    return app


# Create app instance for uvicorn
app = create_app()


if __name__ == "__main__":
    import uvicorn
    
    config = get_config()
    
    uvicorn.run(
        "fastapi_app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=config.DEBUG,
        log_level="info" if not config.DEBUG else "debug"
    )
