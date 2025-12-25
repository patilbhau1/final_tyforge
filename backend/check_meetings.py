from app.core.database import SessionLocal
from app.models.meeting import Meeting

def check_meetings():
    db = SessionLocal()
    try:
        meetings = db.query(Meeting).all()
        print(f"Found {len(meetings)} meetings:")
        for m in meetings:
            print(f"ID: {m.id}, Title: {m.title}, Date: {m.meeting_date}, Type: {type(m.meeting_date)}")
    finally:
        db.close()

if __name__ == "__main__":
    check_meetings()
