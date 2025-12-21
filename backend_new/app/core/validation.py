"""
Input validation utilities for API endpoints
"""
import re
from typing import Optional
from fastapi import HTTPException, status

# Validation patterns
EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
PHONE_PATTERN = re.compile(r'^\+?[1-9]\d{1,14}$')  # E.164 format
PASSWORD_MIN_LENGTH = 6
NAME_MIN_LENGTH = 2
NAME_MAX_LENGTH = 100

def validate_email(email: str) -> str:
    """
    Validate email format
    """
    if not email or not isinstance(email, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    email = email.strip().lower()
    
    if not EMAIL_PATTERN.match(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    if len(email) > 255:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is too long"
        )
    
    return email

def validate_password(password: str) -> str:
    """
    Validate password strength
    """
    if not password or not isinstance(password, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required"
        )
    
    if len(password) < PASSWORD_MIN_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password must be at least {PASSWORD_MIN_LENGTH} characters long"
        )
    
    if len(password) > 128:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is too long"
        )
    
    return password

def validate_name(name: str) -> str:
    """
    Validate name field
    """
    if not name or not isinstance(name, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required"
        )
    
    name = name.strip()
    
    if len(name) < NAME_MIN_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Name must be at least {NAME_MIN_LENGTH} characters long"
        )
    
    if len(name) > NAME_MAX_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Name must not exceed {NAME_MAX_LENGTH} characters"
        )
    
    # Check for suspicious characters
    if re.search(r'[<>\"\'%;()&+]', name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name contains invalid characters"
        )
    
    return name

def validate_phone(phone: Optional[str]) -> Optional[str]:
    """
    Validate phone number (optional field)
    """
    if not phone:
        return None
    
    if not isinstance(phone, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format"
        )
    
    phone = phone.strip()
    
    # Remove common separators for validation
    phone_clean = re.sub(r'[\s\-\(\)]', '', phone)
    
    if not PHONE_PATTERN.match(phone_clean):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format. Use international format (e.g., +1234567890)"
        )
    
    return phone

def validate_file_extension(filename: str, allowed_extensions: list) -> bool:
    """
    Validate file extension
    """
    if not filename or '.' not in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )
    
    extension = filename.rsplit('.', 1)[1].lower()
    
    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    return True

def validate_file_size(file_size: int, max_size: int) -> bool:
    """
    Validate file size
    """
    if file_size > max_size:
        max_size_mb = max_size / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of {max_size_mb:.1f}MB"
        )
    
    return True

def sanitize_string(value: str, max_length: int = 1000) -> str:
    """
    Sanitize string input to prevent XSS and injection attacks
    """
    if not value:
        return ""
    
    # Remove null bytes
    value = value.replace('\x00', '')
    
    # Limit length
    if len(value) > max_length:
        value = value[:max_length]
    
    return value.strip()
