"""
Compatibility endpoints for frontend legacy API calls
These are aliases/wrappers for existing endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.admin_request import AdminRequest
from app.schemas.user import UserResponse
from app.schemas.project import ProjectResponse
from app.schemas.admin_request import AdminRequestResponse
from app.services.file_service import save_upload_file
from typing import Optional

router = APIRouter(prefix="/api", tags=["Compatibility"])

# User Profile Updates
class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    signup_step: Optional[str] = None

@router.put("/update-profile", response_model=UserResponse)
async def update_profile(
    profile_data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Legacy endpoint: Update user profile (alias for PUT /api/users/me)"""
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)

@router.get("/user/signup-status")
async def get_signup_status(current_user: User = Depends(get_current_user)):
    """Get user's signup workflow status"""
    return {
        "signup_step": current_user.signup_step,
        "selected_plan_id": current_user.selected_plan_id,
        "has_synopsis": current_user.has_synopsis,
        "needs_idea_generation": current_user.needs_idea_generation,
        "onboarding_completed": current_user.onboarding_completed
    }

# Project Management
class CreateProjectIdeaRequest(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    tech_stack: Optional[str] = None
    idea_generated: Optional[bool] = False

@router.post("/create-project-idea", response_model=ProjectResponse)
async def create_project_idea(
    project_data: CreateProjectIdeaRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Legacy endpoint: Create project (alias for POST /api/projects)"""
    new_project = Project(
        user_id=current_user.id,
        title=project_data.title,
        description=project_data.description,
        category=project_data.category,
        tech_stack=project_data.tech_stack,
        idea_generated=project_data.idea_generated or False,
        status="idea_pending"
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    return ProjectResponse.model_validate(new_project)

@router.post("/upload-synopsis/{project_id}")
async def upload_synopsis_for_project(
    project_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload synopsis file for a specific project"""
    # Verify project belongs to user
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Save file
    file_path = await save_upload_file(file, "synopsis")
    
    # Update project
    project.synopsis_file_path = file_path
    project.synopsis_original_name = file.filename
    project.synopsis_submitted = True
    project.status = "synopsis_pending"
    
    # Update user
    current_user.has_synopsis = True
    
    db.commit()
    db.refresh(project)
    
    return {
        "message": "Synopsis uploaded successfully",
        "project_id": project_id,
        "file_path": file_path,
        "filename": file.filename
    }

# Admin Help Requests
class AdminHelpRequest(BaseModel):
    request_type: str
    subject: Optional[str] = None
    description: str

@router.post("/request-admin-help", response_model=AdminRequestResponse)
async def request_admin_help(
    request_data: AdminHelpRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a request for admin help"""
    new_request = AdminRequest(
        user_id=current_user.id,
        request_type=request_data.request_type,
        subject=request_data.subject or request_data.request_type,
        description=request_data.description,
        status="pending"
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    return AdminRequestResponse.model_validate(new_request)
