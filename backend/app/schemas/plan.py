from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PlanResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    price: int
    features: str
    blog_included: bool = False
    max_projects: int = 1
    support_level: str = "Basic"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
