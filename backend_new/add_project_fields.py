"""
Migration script to add new fields to projects table
Run this if you already have a projects table without the new fields
"""
from sqlalchemy import create_engine, text
from app.core.config import settings

def add_project_fields():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            # Add file_path column if it doesn't exist
            conn.execute(text("""
                ALTER TABLE projects 
                ADD COLUMN IF NOT EXISTS file_path VARCHAR;
            """))
            conn.commit()
            print("✓ Added file_path column")
        except Exception as e:
            print(f"file_path column may already exist: {e}")
        
        try:
            # Add project_url column if it doesn't exist
            conn.execute(text("""
                ALTER TABLE projects 
                ADD COLUMN IF NOT EXISTS project_url VARCHAR;
            """))
            conn.commit()
            print("✓ Added project_url column")
        except Exception as e:
            print(f"project_url column may already exist: {e}")
        
        try:
            # Add url_approved column if it doesn't exist
            conn.execute(text("""
                ALTER TABLE projects 
                ADD COLUMN IF NOT EXISTS url_approved BOOLEAN DEFAULT FALSE;
            """))
            conn.commit()
            print("✓ Added url_approved column")
        except Exception as e:
            print(f"url_approved column may already exist: {e}")
    
    print("\n✅ Database migration completed!")

if __name__ == "__main__":
    add_project_fields()
