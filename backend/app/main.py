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







# Also add standard CORS middleware as fallback
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
