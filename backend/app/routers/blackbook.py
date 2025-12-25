from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from app.core.security import get_current_user
from app.models.user import User
import os

router = APIRouter(prefix="/api/blackbook", tags=["BlackBook"])

@router.get("/download")
async def download_blackbook(current_user: User = Depends(get_current_user)):
    # Look for blackbook.pdf in uploads/blackbook
    blackbook_path = "uploads/blackbook/blackbook.pdf"
    if not os.path.exists(blackbook_path):
        raise HTTPException(status_code=404, detail="BlackBook not found")
    
    return FileResponse(
        path=blackbook_path,
        filename="BlackBook.pdf",
        media_type="application/pdf"
    )
