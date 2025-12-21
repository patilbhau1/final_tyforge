from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ServiceResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    price: int
    category: str
    is_addon: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
