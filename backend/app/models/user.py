from sqlalchemy import Column, String, Boolean, DateTime, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, default="")
    is_admin = Column(Boolean, default=False, index=True)
    
    # Signup workflow
    signup_step = Column(String, default="basic_info")  # basic_info, plan_selection, synopsis, idea_generation, completed
    selected_plan_id = Column(String, nullable=True)
    has_synopsis = Column(Boolean, default=False)
    needs_idea_generation = Column(Boolean, default=False)
    onboarding_completed = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    # Order has two FKs to users: user_id (owner) and payment_verified_by (admin)
    orders = relationship(
        "Order",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="Order.user_id",
    )
    verified_orders = relationship(
        "Order",
        foreign_keys="Order.payment_verified_by",
        viewonly=True,
    )
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    synopsis = relationship("Synopsis", back_populates="user", cascade="all, delete-orphan")
    meetings = relationship("Meeting", back_populates="user", cascade="all, delete-orphan")
    user_services = relationship("UserService", back_populates="user", cascade="all, delete-orphan")
    admin_requests = relationship("AdminRequest", back_populates="user", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_user_email_admin', 'email', 'is_admin'),
        Index('idx_user_created', 'created_at'),
    )
