from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.meeting import Meeting
from app.schemas.meeting import MeetingCreate, MeetingResponse, MeetingUpdate

router = APIRouter(prefix="/api/meetings", tags=["Meetings"])

@router.post("/", response_model=MeetingResponse)
async def create_meeting_request(
    meeting_data: MeetingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_meeting = Meeting(
        user_id=current_user.id,
        **meeting_data.model_dump()
    )
    db.add(new_meeting)
    db.commit()
    db.refresh(new_meeting)
    return MeetingResponse.model_validate(new_meeting)

@router.get("/", response_model=List[MeetingResponse])
async def get_my_meetings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meetings = db.query(Meeting).filter(Meeting.user_id == current_user.id).all()
    return [MeetingResponse.model_validate(m) for m in meetings]

# Alias for /me
@router.get("/me", response_model=List[MeetingResponse])
async def get_my_meetings_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meetings = db.query(Meeting).filter(Meeting.user_id == current_user.id).all()
    return [MeetingResponse.model_validate(m) for m in meetings]

@router.put("/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: str,
    meeting_update: MeetingUpdate,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    update_data = meeting_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(meeting, field, value)
    
    db.commit()
    db.refresh(meeting)
    return MeetingResponse.model_validate(meeting)

from sqlalchemy.orm import Session, joinedload

# ... (rest of imports)

@router.delete("/{meeting_id}")
async def delete_meeting(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == current_user.id
    ).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    db.delete(meeting)
    db.commit()
    return {"message": "Meeting deleted successfully"}

@router.get("/all", response_model=List[MeetingResponse])
async def get_all_meetings(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    meetings = db.query(Meeting).options(joinedload(Meeting.user)).order_by(Meeting.meeting_date.desc()).offset(skip).limit(limit).all()
    return [MeetingResponse.model_validate(m) for m in meetings]
