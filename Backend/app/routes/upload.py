import os
import uuid
import time
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/upload", tags=["Upload"])

# Go up three levels from app/routes to reach the project root (Luscent-Glow/)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
UPLOAD_DIR = os.path.join(PROJECT_ROOT, "Frontend", "public", "uploads")

@router.post("", response_description="Upload a file")
async def upload_file(file: UploadFile = File(...)):
    # Create directory if it doesn't exist
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        
    # Standardize image filename with timestamp to avoid collisions
    file_extension = os.path.splitext(file.filename)[1]
    if not file_extension:
        # Fallback for files without extensions
        content_type = file.content_type
        if "image/jpeg" in content_type: file_extension = ".jpg"
        elif "image/png" in content_type: file_extension = ".png"
        elif "image/webp" in content_type: file_extension = ".webp"
        else: file_extension = ".img"
        
    unique_filename = f"{int(time.time())}_{uuid.uuid4().hex[:8]}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        file_url = f"/uploads/{unique_filename}"
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "status": "success", 
                "url": file_url, 
                "filePath": file_url,
                "filepath": file_url,
                "filename": unique_filename
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )
