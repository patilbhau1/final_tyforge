"""Approved Idea Submission Model

This is for users who already have their own project idea and want to submit it
without logging in.

Visible in the admin panel.
"""

from sqlalchemy import Column, String, DateTime, Text, Index
from datetime import datetime, timezone
from app.core.database import Base
import uuid


class ApprovedIdeaSubmission(Base):
    __tablename__ = "approved_idea_submissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Public submitter info
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False, index=True)

    # The approved idea text
    approved_idea = Column(Text, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    __table_args__ = (
        Index("idx_approved_idea_phone_date", "phone", "created_at"),
    )
