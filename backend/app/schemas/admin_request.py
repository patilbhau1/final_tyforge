from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AdminRequestCreate(BaseModel):
    request_type: str
    subject: str
    description: str

class AdminRequestUpdate(BaseModel):
    status: Optional[str] = None
    admin_response: Optional[str] = None
    admin_id: Optional[str] = None

class AdminRequestResponse(BaseModel):
    id: str
    user_id: str
    request_type: str
    subject: str
    description: str
    status: str
    admin_response: Optional[str]
    admin_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
