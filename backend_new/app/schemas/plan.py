from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PlanResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    price: int
    features: str
    blog_included: bool
    max_projects: int
    support_level: str
    created_at: datetime
    
    class Config:
        from_attributes = True
