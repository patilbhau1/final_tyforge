from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime, timezone
from app.core.database import Base
import uuid

class ActivityLog(Base):
    """
    Activity log for tracking user actions and system events.
    Essential for monitoring user behavior, debugging, and compliance.
    """
    __tablename__ = "activity_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Action details
    action = Column(String, nullable=False, index=True)  # login, create_project, upload_synopsis, etc.
    entity_type = Column(String, nullable=True)  # project, order, synopsis, chatbot
    entity_id = Column(String, nullable=True)
    
    # Additional context stored as JSON
    details = Column(JSON, nullable=True)  # Flexible storage for action-specific data
    
    # Request metadata
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    # Status tracking
    status = Column(String, default="success")  # success, failed, error
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    __table_args__ = (
        # Composite indexes for common queries
        Index('idx_activity_user_action_date', 'user_id', 'action', 'created_at'),
        Index('idx_activity_entity', 'entity_type', 'entity_id'),
        Index('idx_activity_status_action', 'status', 'action'),
    )
