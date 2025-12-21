"""
Idea Submission Model - Track user idea generation requests
"""
from sqlalchemy import Column, String, DateTime, Text, Integer, Index
from datetime import datetime, timezone
from app.core.database import Base
import uuid

class IdeaSubmission(Base):
    """Store all idea generation requests from users"""
    __tablename__ = "idea_submissions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # User info (can be from logged-in user OR guest)
    user_id = Column(String, nullable=True, index=True)  # NULL if not logged in
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    
    # What user asked for
    interests = Column(Text, nullable=False)
    
    # What AI generated
    generated_idea = Column(Text, nullable=False)
    
    # Tracking
    generation_count = Column(Integer, default=1)  # How many times this user generated
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    __table_args__ = (
        Index('idx_idea_phone', 'phone', 'created_at'),
        Index('idx_idea_user', 'user_id', 'created_at'),
    )
