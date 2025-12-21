from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
from datetime import datetime, timezone
from app.core.database import Base
import uuid

class Plan(Base):
    __tablename__ = "plans"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Integer, nullable=False)
    features = Column(Text, nullable=False)  # JSON string or comma-separated
    blog_included = Column(Boolean, default=False)
    max_projects = Column(Integer, default=1)  # -1 for unlimited
    support_level = Column(String, default="Basic")  # Basic, Standard, Premium
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
