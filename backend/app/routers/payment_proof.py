"""Payment proof upload + verification.

Flow:
- Student uploads a payment screenshot against an Order.
- Admin reviews and approves -> marks Order.status = 'completed'.

Note: In production, store files in S3/Blob; local disk is fine for dev.
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import os

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.order import Order
from app.services.file_service import save_upload_file

router = APIRouter(prefix="/api/payment", tags=["Payment"])


@router.post("/orders/{order_id}/proof")
async def upload_payment_proof(
    order_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Allow only images
    filename = (file.filename or "").lower()
    if not (filename.endswith(".jpg") or filename.endswith(".jpeg") or filename.endswith(".png")):
        raise HTTPException(status_code=400, detail="Only JPG/JPEG/PNG images are allowed")

    proof_path = await save_upload_file(file, "payments")

    order.payment_proof_path = proof_path
    order.payment_proof_original_name = file.filename
    order.payment_proof_uploaded_at = datetime.now(timezone.utc)
    order.status = "paid"  # submitted proof (awaiting admin verification)

    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "message": "Payment proof uploaded. Awaiting admin verification.",
        "order": {
            "id": order.id,
            "status": order.status,
            "payment_proof_original_name": order.payment_proof_original_name,
            "payment_proof_uploaded_at": order.payment_proof_uploaded_at,
        },
    }


@router.get("/orders/{order_id}/proof")
async def get_my_payment_proof(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order or not order.payment_proof_path:
        raise HTTPException(status_code=404, detail="Payment proof not found")

    if not os.path.exists(order.payment_proof_path):
        raise HTTPException(status_code=404, detail="Payment proof file missing")

    return FileResponse(order.payment_proof_path, media_type="image/*", filename=order.payment_proof_original_name or "payment.png")


@router.get("/admin/orders/{order_id}/proof")
async def admin_get_payment_proof(
    order_id: str,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order or not order.payment_proof_path:
        raise HTTPException(status_code=404, detail="Payment proof not found")

    if not os.path.exists(order.payment_proof_path):
        raise HTTPException(status_code=404, detail="Payment proof file missing")

    return FileResponse(order.payment_proof_path, media_type="image/*", filename=order.payment_proof_original_name or "payment.png")


@router.post("/admin/orders/{order_id}/approve")
async def admin_approve_payment(
    order_id: str,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if not order.payment_proof_path:
        raise HTTPException(status_code=400, detail="No payment proof uploaded")

    order.status = "completed"
    order.payment_verified_at = datetime.now(timezone.utc)
    order.payment_verified_by = admin_user.id

    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "message": "Payment approved and order marked completed.",
        "order_id": order.id,
        "status": order.status,
    }
