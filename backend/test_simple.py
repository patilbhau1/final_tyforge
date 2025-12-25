"""Quick test to see what's wrong"""
import sys
print("Python is working!")

try:
    print("\n1. Testing imports...")
    from app.core.config import settings
    print("✅ Config imported")
    
    print("\n2. Testing database URL...")
    print(f"   DATABASE_URL: {settings.DATABASE_URL[:50]}...")
    
    print("\n3. Testing database connection...")
    from sqlalchemy import create_engine, text
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1;"))
        print("✅ Database connected!")
    
    print("\n4. Testing FastAPI import...")
    from app.main import app
    print("✅ FastAPI app imported!")
    
    print("\n✅ ALL TESTS PASSED! Backend should work!")
    
except Exception as e:
    print(f"\n❌ ERROR: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
