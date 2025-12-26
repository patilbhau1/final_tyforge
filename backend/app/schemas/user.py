from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    signup_step: Optional[str] = None
    selected_plan_id: Optional[str] = None
    has_synopsis: Optional[bool] = None
    needs_idea_generation: Optional[bool] = None
    onboarding_completed: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone: str
    is_admin: bool
    signup_step: Optional[str] = "basic_info"
    selected_plan_id: Optional[str] = None
    has_synopsis: Optional[bool] = False
    needs_idea_generation: Optional[bool] = False
    onboarding_completed: Optional[bool] = False
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
