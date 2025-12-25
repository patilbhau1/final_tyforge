from pydantic import BaseModel, Field
from datetime import datetime


class ApprovedIdeaSubmissionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=6, max_length=20)
    approved_idea: str = Field(..., min_length=5)


class ApprovedIdeaSubmissionResponse(BaseModel):
    id: str
    name: str
    phone: str
    approved_idea: str
    created_at: datetime

    class Config:
        from_attributes = True
