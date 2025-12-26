#!/usr/bin/env python3
"""
Run script for TY Project Launchpad Backend - Fixed version
"""
import uvicorn
import os
import sys

# Set encoding for Windows
if sys.platform == 'win32':
    import io
    io.stdout = io.TextIOWrapper(io.stdout.buffer, encoding='utf-8')
    io.stderr = io.TextIOWrapper(io.stderr.buffer, encoding='utf-8')

# Import after encoding fix
try:
    from app.services.init_db import init_database
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure you're running from the backend directory")
    sys.exit(1)

def truncate_password(password, max_length=72):
    """Truncate password to bcrypt max length"""
    return password[:max_length]

if __name__ == "__main__":
    print("=" * 60)
    print("TY PROJECT LAUNCHPAD - Backend Server")
    print("=" * 60)
    
    # Initialize database with truncated password
    try:
        # Temporarily modify the admin password in environment
        original_password = os.environ.get('ADMIN_PASSWORD', '')
        if len(original_password) > 72:
            truncated_password = truncate_password(original_password)
            os.environ['ADMIN_PASSWORD'] = truncated_password
            print(f"⚠️  Admin password truncated to {len(truncated_password)} characters for bcrypt compatibility")
        
        init_database()
        
        # Restore original password if needed
        if original_password:
            os.environ['ADMIN_PASSWORD'] = original_password
            
    except Exception as e:
        print(f"Database initialization failed: {e}")
        print("Continuing with server startup...")
    
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