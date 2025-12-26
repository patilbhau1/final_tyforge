"""
Chatbot API using Groq for conversational project assistance
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User
from app.models.chatbot_history import ChatbotHistory
import httpx
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    plan_name: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    session_id: str
    should_finalize: bool = False

class SummarizeRequest(BaseModel):
    text: str
    model: Optional[str] = None
    max_tokens: Optional[int] = 150
    temperature: Optional[float] = 0.5

class SummarizeResponse(BaseModel):
    summary: str

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Chatbot endpoint for conversational project assistance
    Uses Groq API (with Grok fallback)
    """
    if not settings.GROQ_API_KEY and not settings.XAI_API_KEY:
        raise HTTPException(status_code=500, detail="AI API keys not configured")
    
    try:
        # Generate or use existing session ID
        session_id = request.session_id or str(uuid.uuid4())
        
        # Build system prompt
        system_prompt = f"""You are a concise, friendly, and professional project assistant for TYForge.
The user has selected the {request.plan_name} plan.

Your goals:
1. Help the user define their project by asking for:
   - Project name
   - Brief description (1-2 sentences about how it works)
2. Keep responses under 2 sentences
3. Do NOT ask for technical details like programming languages or implementations
4. When you have both project name and description, say:
   "Great! I have your project details. Please click 'Finalize & Proceed' below."
   Then add [FINALIZE] at the end of your response.
5. Stay on topic - only discuss the user's project

Be friendly, professional, and guide the conversation efficiently."""

        # Prepare messages for API
        api_messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        for msg in request.messages:
            api_messages.append({
                "role": "user" if msg.role == "user" else "assistant",
                "content": msg.content
            })
        
        generated_response = None
        api_used = "unknown"
        
        # Try Groq first
        if settings.GROQ_API_KEY:
            try:
                logger.info("Attempting chatbot response using Groq API...")
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": settings.GROQ_MODEL,
                            "messages": api_messages,
                            "temperature": 0.7,
                            "max_tokens": 200
                        }
                    )
                
                if response.status_code == 200:
                    data = response.json()
                    generated_response = data['choices'][0]['message']['content'].strip()
                    api_used = "groq"
                    logger.info("✅ Chatbot response generated using Groq")
                else:
                    logger.warning(f"Groq API failed: {response.status_code}")
            except Exception as e:
                logger.warning(f"Groq API error: {str(e)}")
        
        # Fallback to Grok if Groq failed
        if not generated_response and settings.XAI_API_KEY:
            try:
                logger.info("Falling back to Grok API...")
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        "https://api.x.ai/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.XAI_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": settings.XAI_MODEL,
                            "messages": api_messages,
                            "temperature": 0.7,
                            "stream": False
                        }
                    )
                
                if response.status_code == 200:
                    data = response.json()
                    generated_response = data['choices'][0]['message']['content'].strip()
                    api_used = "grok"
                    logger.info("✅ Chatbot response generated using Grok (fallback)")
                else:
                    logger.error(f"Grok API failed: {response.status_code}")
            except Exception as e:
                logger.error(f"Grok API error: {str(e)}")
        
        if not generated_response:
            raise HTTPException(status_code=500, detail="Failed to generate response from AI services")
        
        # Check if response suggests finalization
        should_finalize = "[FINALIZE]" in generated_response
        generated_response = generated_response.replace("[FINALIZE]", "").strip()
        
        # Save to database
        try:
            # Save user message
            user_message = ChatbotHistory(
                user_id=current_user.id,
                session_id=session_id,
                message_type="user",
                message=request.messages[-1].content if request.messages else "",
                intent="project_definition"
            )
            db.add(user_message)
            
            # Save assistant response
            assistant_message = ChatbotHistory(
                user_id=current_user.id,
                session_id=session_id,
                message_type="assistant",
                message=generated_response,
                response=generated_response,
                intent="project_definition"
            )
            db.add(assistant_message)
            db.commit()
        except Exception as e:
            logger.warning(f"Failed to save chat history: {e}")
            # Don't fail the request if history save fails
        
        return ChatResponse(
            message=generated_response,
            session_id=session_id,
            should_finalize=should_finalize
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chatbot error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_conversation(
    request: SummarizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Summarize conversation text for project requirements
    """
    if not settings.GROQ_API_KEY and not settings.XAI_API_KEY:
        raise HTTPException(status_code=500, detail="AI API keys not configured")
    
    try:
        summary_prompt = f"Summarize the following project conversation into concise requirements:\n\n{request.text}\n\nProvide a clear, brief summary of the project requirements."
        
        generated_summary = None
        
        # Try Groq first
        if settings.GROQ_API_KEY:
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": request.model or settings.GROQ_MODEL,
                            "messages": [
                                {"role": "system", "content": "You are a helpful assistant that summarizes project requirements."},
                                {"role": "user", "content": summary_prompt}
                            ],
                            "temperature": request.temperature,
                            "max_tokens": request.max_tokens
                        }
                    )
                
                if response.status_code == 200:
                    data = response.json()
                    generated_summary = data['choices'][0]['message']['content'].strip()
                    logger.info("✅ Summary generated using Groq")
            except Exception as e:
                logger.warning(f"Groq summarization error: {e}")
        
        # Fallback to Grok
        if not generated_summary and settings.XAI_API_KEY:
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        "https://api.x.ai/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.XAI_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": settings.XAI_MODEL,
                            "messages": [
                                {"role": "system", "content": "You are a helpful assistant that summarizes project requirements."},
                                {"role": "user", "content": summary_prompt}
                            ],
                            "temperature": request.temperature,
                            "stream": False
                        }
                    )
                
                if response.status_code == 200:
                    data = response.json()
                    generated_summary = data['choices'][0]['message']['content'].strip()
                    logger.info("✅ Summary generated using Grok")
            except Exception as e:
                logger.error(f"Grok summarization error: {e}")
        
        if not generated_summary:
            # Fallback to simple summary
            generated_summary = "Project requirements summary: " + request.text[:150] + "..."
        
        return SummarizeResponse(summary=generated_summary)
    
    except Exception as e:
        logger.error(f"Summarization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Summarization error: {str(e)}")

@router.get("/history")
async def get_chat_history(
    session_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get chat history for current user"""
    query = db.query(ChatbotHistory).filter(ChatbotHistory.user_id == current_user.id)
    
    if session_id:
        query = query.filter(ChatbotHistory.session_id == session_id)
    
    history = query.order_by(ChatbotHistory.created_at.asc()).all()
    
    return [
        {
            "id": h.id,
            "session_id": h.session_id,
            "message_type": h.message_type,
            "message": h.message,
            "response": h.response,
            "created_at": h.created_at
        }
        for h in history
    ]
