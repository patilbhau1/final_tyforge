from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Index, Integer
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime, timezone
from app.core.database import Base
import uuid

class ChatbotHistory(Base):
    """
    Store chatbot conversation history for users.
    Tracks idea generation conversations and user queries.
    """
    __tablename__ = "chatbot_history"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Conversation tracking
    session_id = Column(String, nullable=True, index=True)  # Group related messages
    message_type = Column(String, nullable=False)  # user, assistant, system
    
    # Message content
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=True)
    
    # Context and metadata
    context = Column(JSON, nullable=True)  # Store conversation context
    intent = Column(String, nullable=True)  # idea_generation, help, query
    
    # Performance tracking
    response_time_ms = Column(Integer, nullable=True)
    
    # Related entities
    project_id = Column(String, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    __table_args__ = (
        Index('idx_chatbot_user_session', 'user_id', 'session_id', 'created_at'),
        Index('idx_chatbot_intent', 'intent', 'created_at'),
        Index('idx_chatbot_project', 'project_id'),
    )
