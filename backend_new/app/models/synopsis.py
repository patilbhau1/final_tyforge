from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base
import uuid

class Synopsis(Base):
    __tablename__ = "synopsis"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(String, nullable=True)  # Optional: link to a specific project
    
    file_path = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    file_size = Column(String, nullable=True)
    
    status = Column(String, default="Pending", index=True)  # Pending, Approved, Rejected
    admin_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="synopsis")
    
    __table_args__ = (
        Index('idx_synopsis_user_status', 'user_id', 'status', 'created_at'),
        Index('idx_synopsis_status_date', 'status', 'created_at'),
    )
