"""Add payment proof columns to orders table (for existing DBs without migrations).

Safe to run multiple times.
"""
from sqlalchemy import text
from app.core.database import engine

COLUMNS = [
    ("payment_proof_path", "VARCHAR"),
    ("payment_proof_original_name", "VARCHAR"),
    ("payment_proof_uploaded_at", "TIMESTAMP"),
    ("payment_verified_at", "TIMESTAMP"),
    ("payment_verified_by", "VARCHAR"),
]


def column_exists(conn, table: str, column: str) -> bool:
    res = conn.execute(
        text(
            """
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = :table
              AND column_name = :column
            LIMIT 1
            """
        ),
        {"table": table, "column": column},
    )
    return res.first() is not None


def main():
    print("=" * 70)
    print("Adding payment proof columns to orders table")
    print("=" * 70)

    with engine.connect() as conn:
        changed = False
        for col, col_type in COLUMNS:
            if column_exists(conn, "orders", col):
                print(f"✅ Column already exists: {col}")
                continue

            print(f"➕ Adding column: {col}")
            conn.execute(text(f"ALTER TABLE orders ADD COLUMN {col} {col_type} NULL"))
            changed = True

        if changed:
            conn.commit()
            print("\n✅ Migration complete")
        else:
            print("\n✅ Nothing to change")


if __name__ == "__main__":
    main()
