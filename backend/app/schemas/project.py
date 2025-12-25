from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    tech_stack: Optional[str] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tech_stack: Optional[str] = None
    status: Optional[str] = None
    idea_generated: Optional[bool] = None
    synopsis_submitted: Optional[bool] = None
    project_url: Optional[str] = None
    url_approved: Optional[bool] = None
    admin_notes: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    category: Optional[str]
    tech_stack: Optional[str]
    status: str
    idea_generated: bool
    synopsis_submitted: bool
    synopsis_file_path: Optional[str]
    synopsis_original_name: Optional[str]
    project_file_path: Optional[str]
    project_file_original_name: Optional[str]
    project_url: Optional[str]
    url_approved: Optional[bool]
    admin_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
