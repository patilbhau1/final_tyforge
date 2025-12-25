import os
import uuid
from fastapi import UploadFile, HTTPException
from app.core.config import settings
from app.core.validation import validate_file_extension, validate_file_size

async def save_upload_file(upload_file: UploadFile, folder: str = "projects") -> str:
    """
    Save uploaded file to the specified folder with security validation
    Returns the file path
    """
    # Validate filename exists
    if not upload_file.filename:
        raise HTTPException(
            status_code=400,
            detail="No filename provided"
        )
    
    # Validate file extension
    allowed_extensions = settings.ALLOWED_EXTENSIONS.split(",")
    validate_file_extension(upload_file.filename, allowed_extensions)
    file_ext = upload_file.filename.split(".")[-1].lower()
    
    # Read content and validate size
    content = await upload_file.read()
    validate_file_size(len(content), settings.MAX_FILE_SIZE)
    
    # Create folder if it doesn't exist
    upload_dir = f"uploads/{folder}"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename to prevent overwriting
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    return file_path
