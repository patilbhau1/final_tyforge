"""
Test database connection
"""
from sqlalchemy import create_engine, text
import sys

DATABASE_URL = "postgresql://postgres:Whitedevil16%40@localhost:5432/tyforge_db"

print("=" * 60)
print("Testing PostgreSQL Connection")
print("=" * 60)

try:
    print("\n1. Testing connection to PostgreSQL server...")
    # First try to connect to postgres database
    postgres_url = "postgresql://postgres:Whitedevil16%40@localhost:5432/postgres"
    engine = create_engine(postgres_url)
    
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"✅ PostgreSQL is running!")
        print(f"   Version: {version[:50]}...")
    
    print("\n2. Checking if database 'tyforge_db' exists...")
    with engine.connect() as conn:
        result = conn.execute(text("SELECT datname FROM pg_database WHERE datname='tyforge_db';"))
        db_exists = result.fetchone()
        
        if db_exists:
            print("✅ Database 'tyforge_db' exists!")
        else:
            print("❌ Database 'tyforge_db' does NOT exist!")
            print("\n   Creating database 'tyforge_db'...")
            # Need to use autocommit for CREATE DATABASE
            conn.execute(text("COMMIT"))
            conn.execute(text("CREATE DATABASE tyforge_db;"))
            print("✅ Database 'tyforge_db' created!")
    
    print("\n3. Testing connection to 'tyforge_db'...")
    app_engine = create_engine(DATABASE_URL)
    with app_engine.connect() as conn:
        result = conn.execute(text("SELECT 1;"))
        print("✅ Successfully connected to 'tyforge_db'!")
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED! Database is ready!")
    print("=" * 60)
    print("\nYou can now run: python run.py")
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    print("\n" + "=" * 60)
    print("TROUBLESHOOTING:")
    print("=" * 60)
    print("1. Is PostgreSQL running?")
    print("2. Is the password correct? (Whitedevil16@)")
    print("3. Is PostgreSQL running on port 5432?")
    print("4. Try running: services.msc (Windows) and check 'postgresql' service")
    print("\nIf PostgreSQL is not installed:")
    print("Download from: https://www.postgresql.org/download/windows/")
    sys.exit(1)
