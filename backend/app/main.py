from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth, users, orders, projects, synopsis, meetings, plans, admin, blackbook, select_plan, compatibility, idea_generation, payment_proof, approved_ideas, chatbot
from app.core.exceptions import (
    AppException, app_exception_handler,
    sqlalchemy_exception_handler, general_exception_handler
)
from sqlalchemy.exc import SQLAlchemyError
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create tables in local development only (prefer Alembic migrations in production)
if settings.AUTO_CREATE_TABLES:
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TY Project Launchpad API",
    description="Final Year Engineering Project Management Platform",
    version="2.0.0"
)

# ⚠️ CRITICAL: CORS middleware MUST be registered FIRST
# This ensures OPTIONS preflight requests get proper headers before exception handlers run

# Dynamic CORS configuration based on environment
allowed_origins = [
    settings.FRONTEND_URL,  # Primary frontend URL from environment
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
]

# Add production domains
production_domains = [
    "https://tyforge.in",
    "https://www.tyforge.in",
    "http://tyforge.in",
    "http://www.tyforge.in",
    # Ngrok URLs (for development/testing)
    "https://05401f824dee.ngrok-free.app",
]
allowed_origins.extend(production_domains)

# Remove duplicates and None values
allowed_origins = list(set(filter(None, allowed_origins)))

logging.info(f"🔒 CORS allowed origins: {allowed_origins}")

# Custom CORS middleware to handle Vercel preview deployments
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class CustomCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")
        
        # Check if origin is allowed
        is_allowed = False
        if origin:
            # Exact match
            if origin in allowed_origins:
                is_allowed = True
            # Allow all *.vercel.app domains
            elif origin.endswith(".vercel.app") and origin.startswith("https://"):
                is_allowed = True
            # Allow all *.onrender.com domains
            elif origin.endswith(".onrender.com") and origin.startswith("https://"):
                is_allowed = True
        
        # Handle preflight requests
        if request.method == "OPTIONS":
            if is_allowed:
                return Response(
                    content="",
                    status_code=200,
                    headers={
                        "Access-Control-Allow-Origin": origin,
                        "Access-Control-Allow-Methods": "*",
                        "Access-Control-Allow-Headers": "*",
                        "Access-Control-Allow-Credentials": "true",
                        "Access-Control-Max-Age": "600",
                    }
                )
        
        response = await call_next(request)
        
        # Add CORS headers to response if origin is allowed
        if is_allowed and origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Expose-Headers"] = "*"
        
        return response

from starlette.responses import Response

# Apply custom CORS middleware
app.add_middleware(CustomCORSMiddleware)

# Also add standard CORS middleware as fallback
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Register exception handlers (AFTER CORS)
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(orders.router)
app.include_router(projects.router)
app.include_router(synopsis.router)
app.include_router(meetings.router)
app.include_router(plans.router)
app.include_router(admin.router)
app.include_router(blackbook.router)
app.include_router(select_plan.router)
app.include_router(compatibility.router)
app.include_router(idea_generation.router)
app.include_router(approved_ideas.router)
app.include_router(payment_proof.router)  # Legacy/compatibility endpoints
app.include_router(chatbot.router)

@app.get("/")
async def root():
    return {
        "message": "TY Project Launchpad API v2.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
