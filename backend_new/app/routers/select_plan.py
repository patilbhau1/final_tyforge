from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api", tags=["Plan Selection"])

class SelectPlanRequest(BaseModel):
    plan_id: str
    service_type: str = None  # web-app or iot

@router.post("/select-plan")
async def select_plan(
    request: SelectPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's selected plan during signup"""
    from app.models.plan import Plan
    from app.models.order import Order
    
    # Get plan details
    plan = db.query(Plan).filter(Plan.id == request.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Update user
    current_user.selected_plan_id = request.plan_id
    current_user.signup_step = "synopsis"  # Move to next step
    
    # Create order for this plan
    new_order = Order(
        user_id=current_user.id,
        plan_id=plan.id,
        plan_name=plan.name,
        amount=plan.price,
        service_type=request.service_type,
        status="pending"
    )
    db.add(new_order)
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Plan selected successfully",
        "plan_id": request.plan_id,
        "plan_name": plan.name,
        "service_type": request.service_type,
        "next_step": "synopsis"
    }
