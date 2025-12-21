from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_admin_user
from app.models.user import User
from app.models.approved_idea_submission import ApprovedIdeaSubmission
from app.schemas.approved_idea_submission import (
    ApprovedIdeaSubmissionCreate,
    ApprovedIdeaSubmissionResponse,
)

router = APIRouter(prefix="/api/approved-ideas", tags=["Approved Ideas"])


@router.post("/submit", response_model=dict)
async def submit_approved_idea(payload: ApprovedIdeaSubmissionCreate, db: Session = Depends(get_db)):
    """Public endpoint (no login required) for submitting an already-approved project idea."""
    submission = ApprovedIdeaSubmission(
        name=payload.name.strip(),
        phone=payload.phone.strip(),
        approved_idea=payload.approved_idea.strip(),
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return {
        "success": True,
        "message": "Your idea is submitted. We will reach you soon.",
        "submission_id": submission.id,
    }


@router.get("/submissions", response_model=List[ApprovedIdeaSubmissionResponse])
async def admin_list_approved_ideas(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    submissions = (
        db.query(ApprovedIdeaSubmission)
        .order_by(ApprovedIdeaSubmission.created_at.desc())
        .offset(skip)
        .limit(min(limit, 200))
        .all()
    )
    return [ApprovedIdeaSubmissionResponse.model_validate(s) for s in submissions]
