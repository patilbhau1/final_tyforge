"""
Update plans with new pricing structure:
- Basic: ₹1,499
- Standard: ₹5,000  
- Premium: ₹9,999

Both services (Web/App and IoT) have same pricing
"""
from app.core.database import SessionLocal
from app.models.plan import Plan

def update_plans():
    db = SessionLocal()
    
    try:
        print("=" * 70)
        print("Updating Plans with New Pricing Structure")
        print("=" * 70)
        
        # Delete existing plans
        db.query(Plan).delete()
        print("\n✅ Cleared existing plans")
        
        # New plans with updated prices
        new_plans = [
            {
                "name": "Basic",
                "description": "Perfect for getting started with your project",
                "price": 1499,
                "features": "1 Project,Email Support,Basic Templates,Synopsis Review,Project Guidance",
                "blog_included": False,
                "max_projects": 1,
                "support_level": "Basic"
            },
            {
                "name": "Standard", 
                "description": "Most popular - Complete project support",
                "price": 5000,
                "features": "2 Projects,Priority Support,Advanced Templates,Synopsis Review,Code Review,Documentation Help,Project Deployment,Testing Support",
                "blog_included": False,
                "max_projects": 2,
                "support_level": "Standard"
            },
            {
                "name": "Premium",
                "description": "Ultimate solution with everything included",
                "price": 9999,
                "features": "3 Projects,24/7 Support,All Templates,Complete Code Review,Full Documentation,Deployment Guide,Testing & QA,1-on-1 Mentoring,Technical Blog",
                "blog_included": True,
                "max_projects": 3,
                "support_level": "Premium"
            }
        ]
        
        for plan_data in new_plans:
            plan = Plan(**plan_data)
            db.add(plan)
            print(f"\n✅ Created: {plan_data['name']} - ₹{plan_data['price']}")
        
        db.commit()
        
        print("\n" + "=" * 70)
        print("✅ Plans updated successfully!")
        print("=" * 70)
        
        # Show updated plans
        plans = db.query(Plan).all()
        print("\n📋 Updated Plans:")
        print("=" * 70)
        for p in plans:
            print(f"\n{p.name} - ₹{p.price}")
            print(f"   {p.description}")
            print(f"   Features: {p.features}")
            print(f"   Max Projects: {p.max_projects}")
            print(f"   Support: {p.support_level}")
        
        print("\n" + "=" * 70)
        print("\n💡 Note: Same pricing applies for both services:")
        print("   - Web & App Development")
        print("   - IoT Projects")
        print("\n" + "=" * 70)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_plans()
