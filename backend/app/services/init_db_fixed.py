from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.core.config import settings
from app.models import User, Plan, Service
from datetime import datetime
import sys

# Set encoding for Windows
if sys.platform == 'win32':
    import sys
    import io
    if hasattr(sys.stdout, 'buffer'):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    if hasattr(sys.stderr, 'buffer'):
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def truncate_password(password, max_length=72):
    """Truncate password to bcrypt max length to avoid ValueError"""
    if len(password) > max_length:
        print(f"⚠️  Password truncated from {len(password)} to {max_length} characters for bcrypt compatibility")
        return password[:max_length]
    return password

def init_database():
    """Initialize database with default data"""
    print("Initializing database...")
    
    # Create tables in local development only (prefer Alembic migrations in production)
    if settings.AUTO_CREATE_TABLES:
        Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create admin user if not exists
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin_user:
            # Truncate password if too long for bcrypt
            truncated_password = truncate_password(settings.ADMIN_PASSWORD)
            admin_user = User(
                email=settings.ADMIN_EMAIL,
                password=get_password_hash(truncated_password),
                name="Admin",
                phone="",
                is_admin=True,
                onboarding_completed=True
            )
            db.add(admin_user)
            print(f"Admin user created: {settings.ADMIN_EMAIL}")
        else:
            print(f"Admin user already exists: {settings.ADMIN_EMAIL}")
        
        # Create default plans
        plans_data = [
            {
                "id": "basic_plan",
                "name": "Basic Plan",
                "description": "Perfect for simple projects",
                "price": 5000,
                "features": "Synopsis writing,Basic support,1 project",
                "blog_included": False,
                "max_projects": 1,
                "support_level": "Basic"
            },
            {
                "id": "standard_plan",
                "name": "Standard Plan",
                "description": "Most popular choice",
                "price": 12000,
                "features": "Full project development,Standard support,3 projects,Blog included",
                "blog_included": True,
                "max_projects": 3,
                "support_level": "Standard"
            },
            {
                "id": "premium_plan",
                "name": "Premium Plan",
                "description": "Complete solution with premium features",
                "price": 25000,
                "features": "Complete project suite,Premium support,Unlimited projects,Blog included,Priority delivery",
                "blog_included": True,
                "max_projects": -1,
                "support_level": "Premium"
            }
        ]
        
        for plan_data in plans_data:
            existing_plan = db.query(Plan).filter(Plan.id == plan_data["id"]).first()
            if not existing_plan:
                plan = Plan(**plan_data)
                db.add(plan)
                print(f"Plan created: {plan_data['name']}")
        
        # Create default services
        services_data = [
            {
                "id": "synopsis_service",
                "name": "Synopsis Writing",
                "description": "Professional synopsis writing service",
                "price": 2000,
                "category": "documentation",
                "is_addon": True
            },
            {
                "id": "project_dev_service",
                "name": "Project Development",
                "description": "Complete project development from scratch",
                "price": 10000,
                "category": "software",
                "is_addon": False
            },
            {
                "id": "blackbook_service",
                "name": "BlackBook Creation",
                "description": "Professional black book documentation",
                "price": 3000,
                "category": "documentation",
                "is_addon": True
            },
            {
                "id": "hardware_service",
                "name": "Hardware Project",
                "description": "IoT and hardware project implementation",
                "price": 15000,
                "category": "hardware",
                "is_addon": False
            }
        ]
        
        for service_data in services_data:
            existing_service = db.query(Service).filter(Service.id == service_data["id"]).first()
            if not existing_service:
                service = Service(**service_data)
                db.add(service)
                print(f"Service created: {service_data['name']}")
        
        db.commit()
        print("Database initialization completed!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()