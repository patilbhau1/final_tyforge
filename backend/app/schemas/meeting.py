from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime

class UserSummary(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    
    class Config:
        from_attributes = True

class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    meeting_date: Optional[datetime] = None

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    meeting_date: Optional[datetime] = None
    meeting_link: Optional[str] = None
    status: Optional[str] = None

class MeetingResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    meeting_date: Optional[datetime]
    meeting_link: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    user: Optional[UserSummary] = None
    
    @field_serializer('meeting_date', 'created_at', 'updated_at')
    def serialize_datetime(self, dt: Optional[datetime], _info):
        if dt is None:
            return None
        # Ensure datetime is returned with Z suffix for UTC
        iso = dt.isoformat()
        return iso + 'Z' if not iso.endswith('Z') else iso
    
    class Config:
        from_attributes = True
