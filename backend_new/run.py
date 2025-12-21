#!/usr/bin/env python3
"""
Run script for TY Project Launchpad Backend
"""
import uvicorn
from app.services.init_db import init_database

if __name__ == "__main__":
    print("=" * 60)
    print("TY PROJECT LAUNCHPAD - Backend Server")
    print("=" * 60)
    
    # Initialize database
    init_database()
    
    print("\n🚀 Starting server on http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("=" * 60 + "\n")
    
    # Run server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
