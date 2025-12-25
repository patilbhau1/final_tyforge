from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrderCreate(BaseModel):
    plan_id: Optional[str] = None
    plan_name: str
    amount: int
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    notes: Optional[str] = None
    # Admin can optionally store notes when verifying proof
    payment_proof_original_name: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    user_id: str
    plan_id: Optional[str]
    plan_name: str
    amount: int
    status: str
    service_type: Optional[str]
    payment_method: Optional[str]
    transaction_id: Optional[str]
    notes: Optional[str]

    # Payment proof
    payment_proof_path: Optional[str] = None
    payment_proof_original_name: Optional[str] = None
    payment_proof_uploaded_at: Optional[datetime] = None
    payment_verified_at: Optional[datetime] = None
    payment_verified_by: Optional[str] = None

    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
