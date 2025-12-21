from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.plan import Plan
from app.schemas.plan import PlanResponse

router = APIRouter(prefix="/api/plans", tags=["Plans"])

@router.get("/", response_model=List[PlanResponse])
async def get_all_plans(db: Session = Depends(get_db)):
    plans = db.query(Plan).all()
    return [PlanResponse.model_validate(plan) for plan in plans]

@router.get("/{plan_id}", response_model=PlanResponse)
async def get_plan_by_id(plan_id: str, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return PlanResponse.model_validate(plan)
