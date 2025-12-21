from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SynopsisUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None

class SynopsisResponse(BaseModel):
    id: str
    user_id: str
    project_id: Optional[str]
    file_path: str
    original_name: str
    file_size: Optional[str]
    status: str
    admin_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
