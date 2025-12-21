from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base
import uuid

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True, index=True)  # software, hardware, iot, ml, etc.
    tech_stack = Column(Text, nullable=True)
    
    # Project status
    status = Column(String, default="idea_pending", index=True)  # idea_pending, synopsis_pending, in_progress, completed, cancelled
    idea_generated = Column(Boolean, default=False)
    synopsis_submitted = Column(Boolean, default=False)
    
    # File paths
    synopsis_file_path = Column(String, nullable=True)
    synopsis_original_name = Column(String, nullable=True)
    project_file_path = Column(String, nullable=True)
    project_file_original_name = Column(String, nullable=True)
    
    # Admin-controlled fields for student view
    project_url = Column(String, nullable=True)  # Download URL for completed project
    url_approved = Column(Boolean, default=False)  # Admin approval for download
    admin_notes = Column(Text, nullable=True)  # Admin updates visible to student
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="projects")
    
    __table_args__ = (
        Index('idx_project_user_status', 'user_id', 'status', 'created_at'),
        Index('idx_project_category_status', 'category', 'status'),
    )
