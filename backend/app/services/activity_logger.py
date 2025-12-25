"""
Activity logging service for tracking user actions.
Essential for debugging and monitoring in production.
"""
from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog
from fastapi import Request
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

def log_activity(
    db: Session,
    user_id: Optional[str],
    action: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    status: str = "success",
    error_message: Optional[str] = None
):
    """
    Log an activity to the database.
    
    Args:
        db: Database session
        user_id: User performing the action
        action: Action being performed (e.g., 'login', 'create_project')
        entity_type: Type of entity (e.g., 'project', 'order')
        entity_id: ID of the entity
        details: Additional context as JSON
        ip_address: Client IP address
        user_agent: Client user agent
        status: Action status (success, failed, error)
        error_message: Error message if status is failed/error
    """
    try:
        activity_log = ActivityLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            status=status,
            error_message=error_message
        )
        db.add(activity_log)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to log activity: {str(e)}")
        db.rollback()

def get_client_ip(request: Request) -> Optional[str]:
    """Extract client IP from request (works with Vercel)"""
    # Check Vercel-specific headers first
    if "x-forwarded-for" in request.headers:
        return request.headers["x-forwarded-for"].split(",")[0].strip()
    if "x-real-ip" in request.headers:
        return request.headers["x-real-ip"]
    # Fallback to client host
    if request.client:
        return request.client.host
    return None

def get_user_agent(request: Request) -> Optional[str]:
    """Extract user agent from request"""
    return request.headers.get("user-agent")
