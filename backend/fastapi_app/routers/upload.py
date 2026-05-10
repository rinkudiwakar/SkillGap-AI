"""
Upload router - endpoints for resume uploads.
Files are processed ephemerally: the PDF is saved to a temp location,
text is extracted, and the file is deleted immediately after.
Nothing is stored permanently on disk.
"""
from typing import Optional, Dict, Any
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from pydantic import BaseModel
import uuid
import os
from pathlib import Path
import tempfile
from fastapi_app.services.resume_parser import process_resume_pdf
from ai.src.logger.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api", tags=["uploads"])


class UploadResponse(BaseModel):
    """Response model for upload endpoint."""
    resume_id: str
    filename: str
    file_path: str          # always empty string — no permanent storage
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
    description="Upload and process resume PDF file. The file is never stored permanently."
)
async def upload_resume(file: UploadFile = File(...)) -> UploadResponse:
    """
    Upload and process resume PDF ephemerally.

    The PDF is written to a temporary file, text is extracted,
    and the file is deleted immediately — nothing is retained on disk.

    Args:
        file: PDF file upload

    Returns:
        UploadResponse with resume_id and extraction details (no file_path)
    """
    logger.info(f"Received resume upload: {file.filename}")

    # Validate file
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )

    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported"
        )

    resume_id = str(uuid.uuid4())

    # Use a temp file that is always cleaned up — even on error
    tmp_path: Optional[Path] = None
    try:
        content = await file.read()

        # Write to a uniquely-named temp file so concurrent requests don't collide
        with tempfile.NamedTemporaryFile(
            suffix=".pdf",
            prefix=f"resume_{resume_id}_",
            delete=False
        ) as tmp:
            tmp.write(content)
            tmp_path = Path(tmp.name)

        logger.info(f"Temp file written: {tmp_path} — will be deleted after extraction")

        # Parse the resume
        result = process_resume_pdf(str(tmp_path))

        if result.get('error'):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to process resume: {result['error']}"
            )

        text_length = len(result.get('text', ''))
        confidence = result.get('confidence', 0.0)
        extracted_text = result.get('text', '')
        raw_sections = result.get('sections', {})

        logger.info(
            f"Resume processed — id={resume_id}, "
            f"confidence={confidence:.2f}, length={text_length} chars"
        )

        return UploadResponse(
            resume_id=resume_id,
            filename=file.filename,
            file_path="",          # intentionally empty — ephemeral processing only
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process resume upload"
        )
    finally:
        # ALWAYS delete the temp file — success or failure
        if tmp_path and tmp_path.exists():
            try:
                tmp_path.unlink()
                logger.info(f"Temp file deleted: {tmp_path}")
            except Exception as cleanup_err:
                logger.warning(f"Could not delete temp file {tmp_path}: {cleanup_err}")


@router.get(
    "/resume/{resume_id}",
    summary="Get resume info",
    description="Stub endpoint — resumes are not stored permanently."
)
async def get_resume_info(resume_id: str) -> Dict[str, Any]:
    """
    Stub: resumes are processed ephemerally and not stored.
    This endpoint exists for API compatibility but always returns not-found.
    """
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Resumes are not stored permanently. Re-upload to re-analyse."
    )
