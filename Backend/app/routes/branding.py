from fastapi import APIRouter, Body, HTTPException, status
from fastapi.responses import Response
from typing import Optional
from datetime import datetime
from ..models import BrandingModel
from ..database import get_database

router = APIRouter(prefix="/branding", tags=["branding"])

@router.get("/", response_description="Get site branding settings", response_model=BrandingModel)
async def get_branding():
    db = await get_database()
    branding = await db["settings"].find_one({"type": "branding"})
    if not branding:
        # Default settings if none exist
        default_branding = {
            "type": "branding",
            "logoText": "Luscent Glow",
            "logoImage": None,
            "useImage": False,
            "updatedAt": str(datetime.now())
        }
        await db["settings"].insert_one(default_branding)
        return default_branding
    return branding

@router.put("/", response_description="Update site branding settings", response_model=BrandingModel)
async def update_branding(branding: BrandingModel = Body(...)):
    db = await get_database()
    update_data = branding.model_dump(by_alias=True, exclude=["id"])
    update_data["updatedAt"] = str(datetime.now())
    update_data["type"] = "branding"
    
    update_result = await db["settings"].find_one_and_update(
        {"type": "branding"},
        {"$set": update_data},
        upsert=True,
        return_document=True
    )
    return update_result
