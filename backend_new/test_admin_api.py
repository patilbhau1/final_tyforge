"""
Test script to verify admin can access synopsis data
"""
import requests
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import create_access_token
from datetime import timedelta

def test_admin_access():
    print("=" * 70)
    print("🧪 Testing Admin API Access")
    print("=" * 70)
    
    # Get or create admin user
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "admin@tyforge.com").first()
    
    if not admin:
        print("❌ No admin user found!")
        print("Creating admin user...")
        from app.core.security import get_password_hash
        admin = User(
            email="admin@tyforge.com",
            password=get_password_hash("admin123"),
            name="Admin User",
            phone="1234567890",
            is_admin=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print("✅ Admin user created!")
    
    # Generate token
    token = create_access_token(
        data={"sub": admin.id},
        expires_delta=timedelta(minutes=43200)
    )
    
    print(f"\n📋 Admin Details:")
    print(f"   Email: {admin.email}")
    print(f"   Is Admin: {admin.is_admin}")
    print(f"   Token: {token[:50]}...\n")
    
    # Test API call
    print("🔍 Testing API: GET /api/synopsis/all")
    try:
        response = requests.get(
            "http://localhost:8000/api/synopsis/all",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success! Found {len(data)} synopsis\n")
            
            if len(data) > 0:
                print("   First synopsis:")
                print(f"      - ID: {data[0]['id']}")
                print(f"      - File: {data[0]['original_name']}")
                print(f"      - Status: {data[0]['status']}")
                print(f"      - User ID: {data[0]['user_id']}")
        else:
            print(f"   ❌ Failed: {response.text}")
    
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
    
    db.close()
    print("\n" + "=" * 70)
    print(f"\n💡 Use this token in your frontend:")
    print(f"   localStorage.setItem('admin_token', '{token}');")
    print("\n" + "=" * 70)

if __name__ == "__main__":
    test_admin_access()
