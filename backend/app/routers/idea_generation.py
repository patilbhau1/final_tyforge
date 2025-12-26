"""
Idea Generation API using X.AI Grok
Generates unique project ideas based on user's field of interest
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.project import Project
from app.models.idea_submission import IdeaSubmission
import httpx
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/idea-generation", tags=["Idea Generation"])

MAX_GENERATIONS_PER_USER = 50

class IdeaGenerationRequest(BaseModel):
    field_of_interest: str

class IdeaGenerationResponse(BaseModel):
    idea: str
    field: str
    success: bool

class IdeaSubmissionRequest(BaseModel):
    name: str
    phone: str
    interests: str
    generated_idea: str

@router.post("/generate", response_model=IdeaGenerationResponse)
async def generate_project_idea(
    request: IdeaGenerationRequest,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """
    Generate a unique project idea using X.AI Grok API with Groq fallback
    Works for both authenticated and guest users
    """
    if not settings.XAI_API_KEY and not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="AI API keys not configured")
    
    try:
        # Analyze user input to determine if it's specific or vague
        user_input = request.field_of_interest.strip()
        
        # Check if user provided specific details (tech stack, devices, specific idea)
        has_specifics = any([
            len(user_input.split()) > 3,  # More than 3 words = likely specific
            any(tech in user_input.lower() for tech in ['arduino', 'raspberry', 'python', 'react', 'node', 'ml', 'ai', 'sensor', 'app', 'web', 'mobile', 'iot', 'blockchain', 'flutter', 'django', 'flask']),
            any(word in user_input.lower() for word in ['monitoring', 'tracking', 'detection', 'prediction', 'automation', 'management', 'analysis', 'control'])
        ])
        
        if has_specifics:
            # User provided specific input - build on their idea
            prompt = f"""You are a final year engineering project advisor. The student has this project idea/interest:

"{user_input}"

Based on their input, generate ONE complete and enhanced project idea that:
- Builds upon what they mentioned
- Adds technical depth and innovation
- Suggests specific technologies and implementation approach
- Keeps it under 100 words
- Makes it unique and industry-relevant

Format: Just provide the enhanced project idea description, nothing else."""
        else:
            # Vague input - generate random innovative idea
            prompt = f"""You are a final year engineering project advisor. Generate ONE unique, innovative, and practical project idea for a student interested in: {user_input}

Requirements:
- Keep it under 100 words
- Be specific about the technology stack
- Make it unique and not a common project
- Highlight what makes this project special
- Include practical real-world application

Format: Just provide the project idea description, nothing else."""

        generated_idea = None
        api_used = "unknown"
        
        # Try Grok first if API key is available
        if settings.XAI_API_KEY:
            try:
                logger.info("Attempting to generate idea using Grok API...")
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        "https://api.x.ai/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.XAI_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "messages": [
                                {
                                    "role": "system",
                                    "content": "You are a helpful engineering project advisor who generates unique and innovative project ideas."
                                },
                                {
                                    "role": "user",
                                    "content": prompt
                                }
                            ],
                            "model": settings.XAI_MODEL,
                            "stream": False,
                            "temperature": 0.8
                        }
                    )
                
                if response.status_code == 200:
                    data = response.json()
                    generated_idea = data['choices'][0]['message']['content'].strip()
                    api_used = "grok"
                    logger.info("✅ Idea generated successfully using Grok")
                else:
                    logger.warning(f"Grok API failed: {response.status_code} - {response.text[:200]}")
            except Exception as e:
                logger.warning(f"Grok API error: {str(e)}")
        
        # Fallback to Groq if Grok failed or not configured
        if not generated_idea and settings.GROQ_API_KEY:
            try:
                logger.info("Falling back to Groq API...")
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "messages": [
                                {
                                    "role": "system",
                                    "content": "You are a helpful engineering project advisor who generates unique and innovative project ideas."
                                },
                                {
                                    "role": "user",
                                    "content": prompt
                                }
                            ],
                            "model": settings.GROQ_MODEL,
                            "temperature": 0.8,
                            "max_tokens": 500
                        }
                    )
                
                if response.status_code == 200:
                    data = response.json()
                    generated_idea = data['choices'][0]['message']['content'].strip()
                    api_used = "groq"
                    logger.info("✅ Idea generated successfully using Groq (fallback)")
                else:
                    logger.error(f"Groq API failed: {response.status_code} - {response.text}")
            except Exception as e:
                logger.error(f"Groq API error: {str(e)}")
        
        # If both failed, raise error
        if not generated_idea:
            raise HTTPException(status_code=500, detail="Failed to generate idea from AI services")
        
        # Log generation (user info optional)
        user_info = "guest user"
        if authorization:
            try:
                from app.core.security import decode_access_token
                token = authorization.replace("Bearer ", "")
                payload = decode_access_token(token)
                user_info = payload.get("sub", "unknown")
            except:
                pass
        
        logger.info(f"Generated idea for {user_info} - Field: {request.field_of_interest}")
        
        return IdeaGenerationResponse(
            idea=generated_idea,
            field=request.field_of_interest,
            success=True
        )
        
    except httpx.TimeoutException:
        logger.error("X.AI API timeout")
        raise HTTPException(status_code=504, detail="AI service timeout. Please try again.")
    except Exception as e:
        logger.error(f"Error generating idea: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate idea: {str(e)}")

@router.get("/count")
async def get_generation_count(
    phone: str = None,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """
    Get how many times user has generated ideas
    Checks by user_id if logged in, or by phone number
    Works for both authenticated and guest users
    """
    try:
        # Try to get user from token if provided
        user_id = None
        if authorization:
            try:
                from app.core.security import decode_access_token
                token = authorization.replace("Bearer ", "")
                payload = decode_access_token(token)
                user_id = payload.get("sub")
            except:
                pass
        
        if user_id:
            count = db.query(IdeaSubmission).filter(IdeaSubmission.user_id == user_id).count()
        elif phone:
            count = db.query(IdeaSubmission).filter(IdeaSubmission.phone == phone).count()
        else:
            count = 0
        
        return {
            "count": count,
            "max": MAX_GENERATIONS_PER_USER,
            "remaining": MAX_GENERATIONS_PER_USER - count,
            "can_generate": count < MAX_GENERATIONS_PER_USER
        }
    except Exception as e:
        logger.error(f"Error getting count: {str(e)}")
        return {"count": 0, "max": MAX_GENERATIONS_PER_USER, "remaining": MAX_GENERATIONS_PER_USER, "can_generate": True}

@router.post("/submit-idea")
async def submit_idea(
    request: IdeaSubmissionRequest,
    db: Session = Depends(get_db)
):
    """
    Submit idea - works for both logged in and guest users
    Tracks generation count and enforces limit
    """
    try:
        # Try to get current user (optional - can be guest)
        token = None
        user_id = None
        try:
            # This will fail if not logged in, which is fine
            from fastapi import Header
            pass
        except:
            pass
        
        # Check generation count by phone number
        existing_count = db.query(IdeaSubmission).filter(IdeaSubmission.phone == request.phone).count()
        
        if existing_count >= MAX_GENERATIONS_PER_USER:
            return {
                "success": False,
                "message": f"You've reached the limit of {MAX_GENERATIONS_PER_USER} idea generations. Please contact us for more discussion.",
                "limit_reached": True
            }
        
        # Save submission
        submission = IdeaSubmission(
            user_id=user_id,
            name=request.name,
            phone=request.phone,
            interests=request.interests,
            generated_idea=request.generated_idea,
            generation_count=existing_count + 1
        )
        
        db.add(submission)
        db.commit()
        db.refresh(submission)
        
        logger.info(f"Idea submitted by {request.name} ({request.phone}) - Count: {existing_count + 1}")
        
        return {
            "success": True,
            "message": "Your idea has been submitted successfully! We will reach out to you shortly.",
            "submission_id": submission.id,
            "generation_count": existing_count + 1,
            "remaining": MAX_GENERATIONS_PER_USER - (existing_count + 1)
        }
        
    except Exception as e:
        logger.error(f"Error submitting idea: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to submit idea: {str(e)}")

@router.get("/submissions")
async def get_all_submissions(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint to view all idea submissions
    """
    try:
        submissions = db.query(IdeaSubmission).order_by(
            IdeaSubmission.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        return [{
            "id": s.id,
            "user_id": s.user_id,
            "name": s.name,
            "phone": s.phone,
            "interests": s.interests,
            "generated_idea": s.generated_idea,
            "generation_count": s.generation_count,
            "created_at": s.created_at.isoformat()
        } for s in submissions]
        
    except Exception as e:
        logger.error(f"Error fetching submissions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch submissions: {str(e)}")
