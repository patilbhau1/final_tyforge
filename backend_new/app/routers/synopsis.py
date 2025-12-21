from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, Request, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.synopsis import Synopsis
from app.schemas.synopsis import SynopsisResponse, SynopsisUpdate
from app.services.file_service import save_upload_file
from app.services.activity_logger import log_activity, get_client_ip, get_user_agent
from fastapi.responses import FileResponse
import os
import logging
import uuid

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/synopsis", tags=["Synopsis"])

@router.post("/upload", response_model=SynopsisResponse)
async def upload_synopsis(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Save file
        file_path = await save_upload_file(file, "synopsis")
        
        # Create synopsis record
        new_synopsis = Synopsis(
            user_id=current_user.id,
            file_path=file_path,
            original_name=file.filename,
            file_size=str(file.size) if file.size else "0"
        )
        db.add(new_synopsis)
        
        # Update user
        current_user.has_synopsis = True
        
        db.commit()
        db.refresh(new_synopsis)
        
        # Log activity
        log_activity(
            db=db,
            user_id=current_user.id,
            action="upload_synopsis",
            entity_type="synopsis",
            entity_id=new_synopsis.id,
            details={
                "filename": file.filename,
                "file_size": file.size,
                "status": "success"
            },
            ip_address=get_client_ip(request),
            user_agent=get_user_agent(request),
            status="success"
        )
        
        logger.info(f"Synopsis uploaded: {file.filename} by user {current_user.email}")
        
        return SynopsisResponse.model_validate(new_synopsis)
    except Exception as e:
        # Log failure
        log_activity(
            db=db,
            user_id=current_user.id,
            action="upload_synopsis",
            entity_type="synopsis",
            entity_id=None,
            details={"filename": file.filename if file else "unknown"},
            ip_address=get_client_ip(request),
            user_agent=get_user_agent(request),
            status="failed",
            error_message=str(e)
        )
        logger.error(f"Synopsis upload failed: {str(e)}")
        raise

@router.get("/", response_model=List[SynopsisResponse])
async def get_my_synopsis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    synopsis_list = db.query(Synopsis).filter(Synopsis.user_id == current_user.id).all()
    return [SynopsisResponse.model_validate(s) for s in synopsis_list]

# IMPORTANT: /all routes must come BEFORE /{synopsis_id} to avoid conflicts!
@router.get("/all/list", response_model=List[SynopsisResponse])
async def get_all_synopsis_list(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    synopsis_list = db.query(Synopsis).offset(skip).limit(limit).all()
    return [SynopsisResponse.model_validate(s) for s in synopsis_list]

# Add alias endpoint for /all to match frontend expectations
@router.get("/all", response_model=List[SynopsisResponse])
async def get_all_synopsis(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    logger.info(f"Admin {admin_user.email} fetching all synopsis")
    synopsis_list = db.query(Synopsis).offset(skip).limit(limit).all()
    logger.info(f"Found {len(synopsis_list)} synopsis records")
    return [SynopsisResponse.model_validate(s) for s in synopsis_list]

@router.get("/{synopsis_id}", response_model=SynopsisResponse)
async def get_synopsis_by_id(
    synopsis_id: str = Path(..., regex="^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # synopsis_id must be a UUID format, so "all" won't match
    synopsis = db.query(Synopsis).filter(
        Synopsis.id == synopsis_id,
        Synopsis.user_id == current_user.id
    ).first()
    if not synopsis:
        raise HTTPException(status_code=404, detail="Synopsis not found")
    return SynopsisResponse.model_validate(synopsis)

@router.get("/{synopsis_id}/download")
async def download_synopsis(
    synopsis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    synopsis = db.query(Synopsis).filter(
        Synopsis.id == synopsis_id,
        Synopsis.user_id == current_user.id
    ).first()
    if not synopsis:
        raise HTTPException(status_code=404, detail="Synopsis not found")
    
    file_path = synopsis.file_path
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename=synopsis.original_name,
        media_type="application/pdf"
    )

@router.put("/{synopsis_id}", response_model=SynopsisResponse)
async def update_synopsis_status(
    synopsis_id: str,
    synopsis_update: SynopsisUpdate,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    synopsis = db.query(Synopsis).filter(Synopsis.id == synopsis_id).first()
    if not synopsis:
        raise HTTPException(status_code=404, detail="Synopsis not found")
    
    update_data = synopsis_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(synopsis, field, value)
    
    db.commit()
    db.refresh(synopsis)
    return SynopsisResponse.model_validate(synopsis)

# Admin: Download any synopsis
@router.get("/admin/download/{synopsis_id}")
async def admin_download_synopsis(
    synopsis_id: str,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint to download any synopsis"""
    synopsis = db.query(Synopsis).filter(Synopsis.id == synopsis_id).first()
    if not synopsis:
        raise HTTPException(status_code=404, detail="Synopsis not found")
    
    file_path = synopsis.file_path
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename=synopsis.original_name,
        media_type="application/pdf"
    )

# Admin: Update synopsis status and notes
@router.put("/admin/{synopsis_id}", response_model=SynopsisResponse)
async def admin_update_synopsis(
    synopsis_id: str,
    status: Optional[str] = Query(None),
    admin_notes: Optional[str] = Query(None),
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint to update synopsis status and add notes"""
    synopsis = db.query(Synopsis).filter(Synopsis.id == synopsis_id).first()
    if not synopsis:
        raise HTTPException(status_code=404, detail="Synopsis not found")
    
    if status:
        synopsis.status = status
    if admin_notes is not None:  # Allow empty string to clear notes
        synopsis.admin_notes = admin_notes
    
    db.commit()
    db.refresh(synopsis)
    return SynopsisResponse.model_validate(synopsis)
