"""
Upload router - endpoints for resume uploads.
"""
from typing import Optional, Dict, Any
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from pydantic import BaseModel
import uuid
import os
from pathlib import Path
import shutil
from fastapi_app.services.resume_parser import process_resume_pdf
from src.logger.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api", tags=["uploads"])

# Upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


class UploadResponse(BaseModel):
    """Response model for upload endpoint."""
    resume_id: str
    filename: str
    file_path: str
    extraction_confidence: float
    text_length: int
    extracted_text: str
    raw_sections: Dict[str, Any]
    error: Optional[str] = None


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload resume PDF",
    description="Upload and process resume PDF file"
)
async def upload_resume(file: UploadFile = File(...)) -> UploadResponse:
    """
    Upload and process resume PDF.
    
    Args:
        file: PDF file upload
        
    Returns:
        UploadResponse with resume_id and extraction details
    """
    logger.info(f"Received resume upload: {file.filename}")
    
    # Validate file
    if not file.filename:
        logger.error("Empty filename")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    if not file.filename.lower().endswith('.pdf'):
        logger.error(f"Invalid file type: {file.filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported"
        )
    
    # Generate resume ID
    resume_id = str(uuid.uuid4())
    safe_filename = f"{resume_id}.pdf"
    file_path = UPLOAD_DIR / safe_filename
    
    try:
        # Save uploaded file
        with open(file_path, 'wb') as f:
            content = await file.read()
            f.write(content)
        
        logger.info(f"File saved: {file_path}")
        
        # Process resume
        logger.info(f"Processing resume: {file_path}")
        result = process_resume_pdf(str(file_path))
        
        if result.get('error'):
            logger.error(f"Resume processing failed: {result['error']}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to process resume: {result['error']}"
            )
        
        text_length = len(result.get('text', ''))
        confidence = result.get('confidence', 0.0)
        extracted_text = result.get('text', '')
        raw_sections = result.get('sections', {})
        
        logger.info(
            f"Resume processed successfully. "
            f"Confidence: {confidence:.2f}, Text length: {text_length}"
        )
        
        return UploadResponse(
            resume_id=resume_id,
            filename=file.filename,
            file_path=str(file_path),
            extraction_confidence=confidence,
            text_length=text_length,
            extracted_text=extracted_text,
            raw_sections=raw_sections,
            error=None
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume upload failed: {e}")
        # Clean up
        if file_path.exists():
            file_path.unlink()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process resume upload"
        )


@router.get(
    "/resume/{resume_id}",
    summary="Get resume info",
    description="Get information about an uploaded resume"
)
async def get_resume_info(resume_id: str) -> Dict[str, Any]:
    """
    Get information about an uploaded resume.
    
    Args:
        resume_id: resume identifier
        
    Returns:
        dict with resume information
    """
    logger.info(f"Getting info for resume: {resume_id}")
    
    file_path = UPLOAD_DIR / f"{resume_id}.pdf"
    
    if not file_path.exists():
        logger.error(f"Resume not found: {resume_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume {resume_id} not found"
        )
    
    try:
        # Get file info
        file_size = file_path.stat().st_size
        
        return {
            'resume_id': resume_id,
            'filename': file_path.name,
            'file_path': str(file_path),
            'file_size': file_size,
            'exists': True
        }
    
    except Exception as e:
        logger.error(f"Error getting resume info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get resume information"
        )
