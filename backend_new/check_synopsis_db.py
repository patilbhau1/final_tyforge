"""
Quick script to check synopsis records in PostgreSQL database
"""
import sys
from app.core.database import SessionLocal
from app.models.synopsis import Synopsis
from app.models.user import User
from sqlalchemy import inspect

def check_synopsis_data():
    db = SessionLocal()
    
    try:
        print("=" * 70)
        print("📊 SYNOPSIS TABLE - PostgreSQL Database Records")
        print("=" * 70)
        
        # Get all synopsis records
        synopses = db.query(Synopsis).order_by(Synopsis.created_at.desc()).all()
        
        print(f"\n✅ Total Synopsis Records in Database: {len(synopses)}\n")
        
        if len(synopses) == 0:
            print("⚠️  No synopsis records found in database yet.")
            print("   Upload a synopsis through the web app to see data here.\n")
        else:
            for idx, s in enumerate(synopses, 1):
                # Get user info
                user = db.query(User).filter(User.id == s.user_id).first()
                user_email = user.email if user else "Unknown"
                
                print(f"{'─' * 70}")
                print(f"Record #{idx}")
                print(f"{'─' * 70}")
                print(f"📋 ID:           {s.id}")
                print(f"👤 User:         {user_email}")
                print(f"📄 Filename:     {s.original_name}")
                print(f"📦 Size:         {int(s.file_size) / (1024*1024):.2f} MB ({s.file_size} bytes)")
                print(f"📊 Status:       {s.status}")
                print(f"📅 Uploaded:     {s.created_at}")
                print(f"💾 File Path:    {s.file_path}")
                if s.admin_notes:
                    print(f"📝 Admin Notes:  {s.admin_notes}")
                print()
        
        print("=" * 70)
        
        # Check other tables
        print("\n📊 Database Tables:")
        print("=" * 70)
        engine = db.get_bind()
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        for table in sorted(tables):
            columns = inspector.get_columns(table)
            print(f"✓ {table:<30} ({len(columns)} columns)")
        
        print("\n" + "=" * 70)
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_synopsis_data()
