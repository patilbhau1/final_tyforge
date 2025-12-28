from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_admin_user, get_current_user
from app.models.user import User
from app.models.admin_request import AdminRequest
from app.models.project import Project
from app.schemas.admin_request import AdminRequestCreate, AdminRequestResponse, AdminRequestUpdate
from app.services.file_service import save_upload_file
from fastapi.responses import FileResponse
from fastapi import Response
from pydantic import BaseModel
import os

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# Pydantic models for new endpoints
class ProjectUrlShare(BaseModel):
    user_id: str
    project_url: str
    approved: bool

# Admin Requests
@router.post("/requests", response_model=AdminRequestResponse)
async def create_admin_request(
    request_data: AdminRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_request = AdminRequest(
        user_id=current_user.id,
        **request_data.model_dump()
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return AdminRequestResponse.model_validate(new_request)

@router.get("/requests/me", response_model=List[AdminRequestResponse])
async def get_my_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all requests submitted by the current user"""
    requests = db.query(AdminRequest).filter(
        AdminRequest.user_id == current_user.id
    ).order_by(AdminRequest.created_at.desc()).all()
    return [AdminRequestResponse.model_validate(r) for r in requests]

@router.get("/requests", response_model=List[AdminRequestResponse])
async def get_all_admin_requests(
    skip: int = 0,
    limit: int = 50,  # Reduced default limit for better performance
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    # Add maximum limit to prevent excessive data retrieval
    if limit > 100:
        limit = 100
    
    requests = db.query(AdminRequest).order_by(AdminRequest.created_at.desc()).offset(skip).limit(limit).all()
    return [AdminRequestResponse.model_validate(r) for r in requests]

@router.put("/requests/{request_id}", response_model=AdminRequestResponse)
async def update_admin_request(
    request_id: str,
    request_update: AdminRequestUpdate,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    admin_request = db.query(AdminRequest).filter(AdminRequest.id == request_id).first()
    if not admin_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    update_data = request_update.model_dump(exclude_unset=True)
    if "admin_id" not in update_data:
        update_data["admin_id"] = admin_user.id
    
    for field, value in update_data.items():
        setattr(admin_request, field, value)
    
    db.commit()
    db.refresh(admin_request)
    return AdminRequestResponse.model_validate(admin_request)

# BlackBook Management
@router.post("/blackbook/upload")
async def upload_blackbook(
    file: UploadFile = File(...),
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    file_path = await save_upload_file(file, "blackbook")
    return {"message": "BlackBook uploaded successfully", "file_path": file_path}

@router.get("/blackbook/download")
async def download_blackbook(
    admin_user: User = Depends(get_current_admin_user)
):
    # Look for blackbook.pdf in uploads/blackbook
    blackbook_path = "uploads/blackbook/blackbook.pdf"
    if not os.path.exists(blackbook_path):
        raise HTTPException(status_code=404, detail="BlackBook not found")
    
    return FileResponse(
        path=blackbook_path,
        filename="BlackBook.pdf",
        media_type="application/pdf"
    )

# File Management
@router.post("/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = "projects",
    admin_user: User = Depends(get_current_admin_user)
):
    file_path = await save_upload_file(file, folder)
    return {
        "message": "File uploaded successfully",
        "file_path": file_path,
        "filename": file.filename
    }

# Dashboard Stats
@router.get("/stats")
async def get_admin_stats(
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    from app.models.order import Order
    from app.models.project import Project
    from app.models.synopsis import Synopsis
    
    total_users = db.query(User).count()
    total_orders = db.query(Order).count()
    total_projects = db.query(Project).count()
    pending_synopsis = db.query(Synopsis).filter(Synopsis.status == "Pending").count()
    pending_requests = db.query(AdminRequest).filter(AdminRequest.status == "pending").count()
    
    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "total_projects": total_projects,
        "pending_synopsis": pending_synopsis,
        "pending_requests": pending_requests
    }

# Project File Upload for Students
@router.post("/upload-project")
async def upload_project_file(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Upload project ZIP file for a student"""
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Save file to user's project folder
    file_path = await save_upload_file(file, f"projects/{user_id}")
    
    # Update or create project record
    project = db.query(Project).filter(Project.user_id == user_id).first()
    if project:
        project.project_file_path = file_path
        project.project_file_original_name = file.filename
        project.status = "completed"
    else:
        new_project = Project(
            user_id=user_id,
            title="Admin Uploaded Project",
            description="Project files uploaded by admin",
            project_file_path=file_path,
            project_file_original_name=file.filename,
            status="completed"
        )
        db.add(new_project)
    
    db.commit()
    
    return {
        "message": "Project file uploaded successfully",
        "file_path": file_path,
        "user_id": user_id
    }

# Share Project URL with Student
@router.post("/share-project-url")
async def share_project_url(
    data: ProjectUrlShare,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Share or revoke project URL access based on payment status"""
    # Verify user exists
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check payment status
    from app.models.order import Order
    has_paid = db.query(Order).filter(
        Order.user_id == data.user_id,
        Order.status == "completed"
    ).first() is not None
    
    if data.approved and not has_paid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student must complete payment before accessing project"
        )
    
    # Update or create project with URL
    project = db.query(Project).filter(Project.user_id == data.user_id).first()
    if project:
        if data.approved:
            project.project_url = data.project_url
            project.url_approved = True
        else:
            project.url_approved = False
    else:
        if data.approved:
            new_project = Project(
                user_id=data.user_id,
                title="Shared Project",
                description="Project shared by admin",
                project_url=data.project_url,
                url_approved=True,
                status="completed"
            )
            db.add(new_project)
    
    db.commit()
    
    return {
        "message": "Project URL updated successfully",
        "approved": data.approved,
        "has_payment": has_paid
    }

# Download Project (Student endpoint with payment verification)
@router.get("/download-project/{user_id}")
async def download_project(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download project file - requires payment verification"""
    # Check if requesting user has paid
    from app.models.order import Order
    has_paid = db.query(Order).filter(
        Order.user_id == current_user.id,
        Order.status == "completed"
    ).first() is not None
    
    if not has_paid and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Payment required to download project files"
        )
    
    # Get project - find the one with a file path
    project = db.query(Project).filter(
        Project.user_id == user_id,
        Project.project_file_path.isnot(None)
    ).first()
    if not project or not project.project_file_path:
        raise HTTPException(status_code=404, detail="Project file not found")
    
    if not project.url_approved and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Project access not yet approved by admin"
        )
    
    file_path = project.project_file_path
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    
    # Use original filename if available, otherwise fallback to UUID filename
    download_filename = project.project_file_original_name or os.path.basename(file_path)
    
    response = FileResponse(
        path=file_path,
        filename=download_filename,
        media_type="application/zip"
    )
    
    # Ensure content-disposition header is set correctly
    response.headers["Content-Disposition"] = f"attachment; filename=\"{download_filename}\""
    
    return response

# Update Project Status and Notes (for student view)
@router.put("/update-project/{project_id}")
async def update_project_for_student(
    project_id: str,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    admin_notes: Optional[str] = None,
    project_url: Optional[str] = None,
    url_approved: Optional[bool] = None
):
    """Update project status, notes, and download access for student"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update fields if provided
    if status is not None:
        project.status = status
    if admin_notes is not None:
        project.admin_notes = admin_notes
    if project_url is not None:
        project.project_url = project_url
    if url_approved is not None:
        project.url_approved = url_approved
    
    db.commit()
    db.refresh(project)
    
    return {
        "message": "Project updated successfully",
        "project_id": project_id,
        "status": project.status,
        "url_approved": project.url_approved
    }
