"""
Add service_type column to orders table
"""
from app.core.database import engine
from sqlalchemy import text

def add_service_type_column():
    print("=" * 70)
    print("Adding service_type column to orders table")
    print("=" * 70)
    
    try:
        with engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='orders' AND column_name='service_type'
            """))
            
            if result.fetchone():
                print("\n✅ Column 'service_type' already exists!")
            else:
                # Add the column
                conn.execute(text("""
                    ALTER TABLE orders 
                    ADD COLUMN service_type VARCHAR NULL
                """))
                conn.commit()
                print("\n✅ Added 'service_type' column to orders table!")
            
            print("\n" + "=" * 70)
            print("Migration completed successfully!")
            print("=" * 70)
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\nNote: If running fresh, tables will be created with the new column.")

if __name__ == "__main__":
    add_service_type_column()
