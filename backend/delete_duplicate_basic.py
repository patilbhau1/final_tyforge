"""
Delete the duplicate 'Basic Plan' entry
"""
from app.core.database import SessionLocal
from app.models.plan import Plan

def delete_duplicate():
    db = SessionLocal()
    
    try:
        print("=" * 70)
        print("Deleting Duplicate 'Basic Plan'")
        print("=" * 70)
        
        # Find the duplicate 'Basic Plan' (not 'Basic')
        duplicate = db.query(Plan).filter(Plan.name == 'Basic Plan').first()
        
        if duplicate:
            print(f"\n🗑️  Found duplicate: {duplicate.name} - ₹{duplicate.price}")
            db.delete(duplicate)
            db.commit()
            print("✅ Deleted successfully!")
        else:
            print("\n✅ No duplicate found")
        
        # Show final plans
        plans = db.query(Plan).all()
        print("\n" + "=" * 70)
        print(f"Final Plans ({len(plans)} total):")
        print("=" * 70)
        for p in plans:
            print(f"  ✓ {p.name}: ₹{p.price:,}")
        
        if len(plans) != 3:
            print(f"\n⚠️  WARNING: Expected 3 plans, found {len(plans)}")
        else:
            print("\n✅ Perfect! 3 plans as expected")
        
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    delete_duplicate()
