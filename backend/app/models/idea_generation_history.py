from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Index, Boolean
from sqlalchemy.dialects.postgresql import JSON, ARRAY
from datetime import datetime, timezone
from app.core.database import Base
import uuid

class IdeaGenerationHistory(Base):
    """
    Track generated project ideas for users.
    Stores AI-generated ideas, user selections, and refinements.
    """
    __tablename__ = "idea_generation_history"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Idea details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=True, index=True)  # software, hardware, iot, ml, web
    
    # Technical details
    tech_stack = Column(ARRAY(String), nullable=True)  # Array of technologies
    features = Column(JSON, nullable=True)  # List of suggested features
    complexity = Column(String, nullable=True)  # beginner, intermediate, advanced
    estimated_duration = Column(String, nullable=True)  # e.g., "2-3 months"
    
    # User interaction
    user_selected = Column(Boolean, default=False, index=True)
    user_rating = Column(String, nullable=True)  # liked, neutral, disliked
    refinement_count = Column(String, default="0")  # How many times user asked to refine
    
    # Link to actual project if created
    project_id = Column(String, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    
    # Generation metadata
    prompt_used = Column(Text, nullable=True)  # Original user prompt
    generation_model = Column(String, nullable=True)  # AI model used
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        Index('idx_idea_user_selected', 'user_id', 'user_selected', 'created_at'),
        Index('idx_idea_category', 'category', 'user_selected'),
        Index('idx_idea_project', 'project_id'),
    )
