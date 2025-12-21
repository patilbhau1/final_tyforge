from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base
import uuid

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id = Column(String, nullable=True, index=True)
    plan_name = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    status = Column(String, default="pending", index=True)  # pending, paid, completed, cancelled
    service_type = Column(String, nullable=True)  # web-app, iot
    payment_method = Column(String, nullable=True)
    transaction_id = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    # Payment proof upload (screenshot/receipt)
    payment_proof_path = Column(String, nullable=True)
    payment_proof_original_name = Column(String, nullable=True)
    payment_proof_uploaded_at = Column(DateTime, nullable=True)
    payment_verified_at = Column(DateTime, nullable=True)
    payment_verified_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="orders", foreign_keys=[user_id])
    verified_by_admin = relationship("User", foreign_keys=[payment_verified_by], viewonly=True)
    
    __table_args__ = (
        Index('idx_order_user_status', 'user_id', 'status', 'created_at'),
        Index('idx_order_plan_status', 'plan_id', 'status'),
    )
