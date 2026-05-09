"""
Match router - endpoints for resume-JD matching pipeline.
"""
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import uuid
from fastapi_app.worker import match_pipeline
from fastapi_app.services.jd_parser import fetch_job_description_from_url
from ai.src.logger.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api", tags=["matching"])


class MatchRequest(BaseModel):
    """Request model for match endpoint."""
    resume_text: str = Field(..., description="Extracted resume text")
    jd_text: Optional[str] = Field(
        default=None,
        description="Job description text"
    )
    jd_url: Optional[str] = Field(
        default=None,
        description="Public URL for the job posting"
    )
    user_id: Optional[str] = Field(None, description="User identifier")
    resume_id: Optional[str] = Field(None, description="Resume identifier")


class MatchResponse(BaseModel):
    """Response model for match endpoint."""
    task_id: str = Field(..., description="Unique task ID for tracking")
    status: str = Field(default="pending", description="Task status")
    message: str = Field(default="", description="Status message")


class MatchResultResponse(BaseModel):
    """Response model for match result."""
    task_id: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@router.post(
    "/match",
    response_model=MatchResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Submit resume-JD matching task",
    description="Submit resume and either JD text or a JD URL for asynchronous matching analysis"
)
async def submit_match(request: MatchRequest) -> MatchResponse:
    """
    Submit resume and JD for matching analysis.
    Returns a task ID for polling results.
    
    Args:
        request: MatchRequest with resume_text and either jd_text or jd_url
        
    Returns:
        MatchResponse with task_id
    """
    logger.info("Received match request")
    
    # Validate inputs
    if not request.resume_text or not request.resume_text.strip():
        logger.error("Empty resume text")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text cannot be empty"
        )
    
    jd_text = (request.jd_text or "").strip()
    jd_url = (request.jd_url or "").strip()

    if not jd_text and not jd_url:
        logger.error("Missing JD text and JD URL")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either JD text or a JD URL"
        )

    if jd_url:
        try:
            jd_text = fetch_job_description_from_url(jd_url)
        except Exception as e:
            logger.error(f"Failed to fetch JD from URL: {e}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to extract job description from URL: {e}"
            )

    if not jd_text:
        logger.error("Empty JD text after processing")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="JD text cannot be empty"
        )
    
    # Generate task ID
    task_id = str(uuid.uuid4())
    
    try:
        # Dispatch Celery task
        celery_task = match_pipeline.apply_async(
            args=[
                request.resume_text,
                jd_text,
                task_id,
                request.user_id,
                request.resume_id
            ],
            task_id=task_id,
            retry=True,
            retry_policy={
                'max_retries': 3,
                'interval_start': 1,
                'interval_step': 0.5,
                'interval_max': 10
            }
        )
        
        logger.info(f"Match pipeline task submitted: {task_id}")
        
        return MatchResponse(
            task_id=task_id,
            status="pending",
            message="Task submitted for processing"
        )
    
    except Exception as e:
        logger.error(f"Failed to submit match task: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit matching task"
        )


@router.get(
    "/result/{task_id}",
    response_model=MatchResultResponse,
    summary="Get match results",
    description="Retrieve results for a submitted match task"
)
async def get_result(task_id: str) -> MatchResultResponse:
    """
    Get matching results by task ID.
    Returns result if available, pending status if not yet complete.
    
    Args:
        task_id: task identifier from /match endpoint
        
    Returns:
        MatchResultResponse with status and optional result
    """
    logger.info(f"Fetching result for task: {task_id}")
    
    try:
        from fastapi_app.worker import app as celery_app
        
        # Get task result
        async_result = celery_app.AsyncResult(task_id)
        
        if async_result.failed():
            logger.error(f"Task {task_id} failed: {async_result.info}")
            return MatchResultResponse(
                task_id=task_id,
                status="failed",
                error=str(async_result.info)
            )
        
        elif async_result.successful():
            logger.info(f"Task {task_id} succeeded")
            result = async_result.result
            
            # Check if result contains an error field (graceful error handling)
            if isinstance(result, dict) and result.get('status') == 'error':
                logger.error(f"Task {task_id} returned error status: {result.get('error')}")
                return MatchResultResponse(
                    task_id=task_id,
                    status="error",
                    error=result.get('error', 'Unknown error'),
                    result=result
                )
            
            return MatchResultResponse(
                task_id=task_id,
                status="completed",
                result=result
            )
        
        else:
            # Still processing
            logger.info(f"Task {task_id} is pending")
            return MatchResultResponse(
                task_id=task_id,
                status="pending",
                result=None
            )
    
    except Exception as e:
        logger.error(f"Error retrieving result for task {task_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve task result"
        )


@router.get(
    "/task-status/{task_id}",
    summary="Get task status",
    description="Get current status of a matching task"
)
async def get_task_status(task_id: str) -> Dict[str, Any]:
    """
    Get current status of a task.
    
    Args:
        task_id: task identifier
        
    Returns:
        dict with status information
    """
    logger.info(f"Getting status for task: {task_id}")
    
    try:
        from fastapi_app.worker import app as celery_app
        
        async_result = celery_app.AsyncResult(task_id)
        
        status_info = {
            'task_id': task_id,
            'status': async_result.status,
            'ready': async_result.ready(),
            'successful': async_result.successful() if async_result.ready() else None,
            'failed': async_result.failed() if async_result.ready() else None
        }
        
        if async_result.failed():
            status_info['error'] = str(async_result.info)
        
        return status_info
    
    except Exception as e:
        logger.error(f"Error getting task status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get task status"
        )
