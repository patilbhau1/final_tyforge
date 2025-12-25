"""
Database migration helper script for production deployment.
Run this after deploying to create/update database schema.
"""
import sys
import os
from alembic.config import Config
from alembic import command

def run_migrations():
    """Run all pending migrations"""
    try:
        # Create Alembic config
        alembic_cfg = Config("alembic.ini")
        
        print("🔍 Checking current database version...")
        command.current(alembic_cfg)
        
        print("\n⬆️  Upgrading database to latest version...")
        command.upgrade(alembic_cfg, "head")
        
        print("\n✅ Database migration completed successfully!")
        print("📊 Current database version:")
        command.current(alembic_cfg)
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    print("🚀 TY Project Launchpad - Database Migration Tool")
    print("=" * 60)
    
    # Check if DATABASE_URL is set
    if not os.getenv("DATABASE_URL"):
        print("⚠️  WARNING: DATABASE_URL environment variable not set!")
        print("Please set it to your Neon PostgreSQL connection string.")
        sys.exit(1)
    
    run_migrations()
