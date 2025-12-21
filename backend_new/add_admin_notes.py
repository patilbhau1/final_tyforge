"""
Migration script to add admin_notes field to projects table
"""
from sqlalchemy import create_engine, text
from app.core.config import settings

def add_admin_notes_field():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            # Add admin_notes column if it doesn't exist
            conn.execute(text("""
                ALTER TABLE projects 
                ADD COLUMN IF NOT EXISTS admin_notes TEXT;
            """))
            conn.commit()
            print("✓ Added admin_notes column")
        except Exception as e:
            print(f"admin_notes column may already exist: {e}")
    
    print("\n✅ Database migration completed!")

if __name__ == "__main__":
    add_admin_notes_field()
