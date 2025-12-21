"""
Remove duplicate/old plans and keep only the new ones with correct pricing
"""
from app.core.database import SessionLocal
from app.models.plan import Plan

def clean_plans():
    db = SessionLocal()
    
    try:
        print("=" * 70)
        print("Cleaning Duplicate Plans")
        print("=" * 70)
        
        # Get all plans
        all_plans = db.query(Plan).all()
        
        print(f"\nCurrent plans in database: {len(all_plans)}")
        for p in all_plans:
            print(f"  - {p.name}: ₹{p.price}")
        
        # Delete plans with old/incorrect pricing
        # Keep only: Basic (1499), Standard (5000), Premium (9999)
        plans_to_delete = db.query(Plan).filter(
            ~Plan.price.in_([1499, 5000, 9999])
        ).all()
        
        if plans_to_delete:
            print(f"\n🗑️  Deleting {len(plans_to_delete)} old plans:")
            for p in plans_to_delete:
                print(f"  - {p.name}: ₹{p.price}")
                db.delete(p)
            
            db.commit()
            print("\n✅ Old plans deleted!")
        else:
            print("\n✅ No old plans to delete")
        
        # Show remaining plans
        remaining_plans = db.query(Plan).all()
        print("\n" + "=" * 70)
        print(f"Final plans in database: {len(remaining_plans)}")
        print("=" * 70)
        for p in remaining_plans:
            print(f"  ✓ {p.name}: ₹{p.price:,}")
        
        print("\n" + "=" * 70)
        print("✅ Database cleaned successfully!")
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clean_plans()
