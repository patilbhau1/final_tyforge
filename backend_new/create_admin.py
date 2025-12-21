"""
Script to create an admin user
Run this script to ensure admin user exists in the database
"""
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from app.core.config import settings

def create_admin_user():
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        
        if admin:
            print(f"✅ Admin user already exists: {settings.ADMIN_EMAIL}")
            if not admin.is_admin:
                admin.is_admin = True
                db.commit()
                print("✅ Updated user to admin status")
        else:
            # Create new admin user
            admin = User(
                email=settings.ADMIN_EMAIL,
                password=get_password_hash(settings.ADMIN_PASSWORD),
                name="Admin",
                phone="",
                is_admin=True
            )
            db.add(admin)
            db.commit()
            print(f"✅ Admin user created: {settings.ADMIN_EMAIL}")
            print(f"   Password: {settings.ADMIN_PASSWORD}")
        
        print("\n🔐 Admin Credentials:")
        print(f"   Email: {settings.ADMIN_EMAIL}")
        print(f"   Password: {settings.ADMIN_PASSWORD}")
        print(f"\n🌐 Access admin panel at: http://localhost:8080/admin/login")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
