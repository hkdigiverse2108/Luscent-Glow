from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Optional
from datetime import datetime, timezone
from ..models import HomeSettingsModel
from ..database import get_database
from bson import ObjectId

router = APIRouter(prefix="/home", tags=["Home Page"])

@router.get("/settings", response_description="Get homepage settings", response_model=HomeSettingsModel)
async def get_home_settings():
    """
    Retrieve the current homepage dynamic settings.
    If no settings are found, returns default placeholders.
    """
    db = await get_database()
    settings = await db["home_settings"].find_one({})
    if not settings:
        # Provide default data to avoid frontend breaks
        return HomeSettingsModel(
            brandStory={
                "description": "We believe skincare is more than a routine; it is a sacred ritual. By merging ancient botanical wisdom with cutting-edge molecular science, we create formulas that don't just sit on the surface — they transform from within."
            },
            discountBanner={
                "title": "Season of Radiance",
                "discountText": "UP TO 50% OFF",
                "isActive": True
            },
            instagram={
                "profileHandle": "@hk_digiverse",
                "description": "Explore our latest innovations and milestones."
            }
        )
    return settings

@router.put("/settings", response_description="Update homepage settings", response_model=HomeSettingsModel)
async def update_home_settings(settings: HomeSettingsModel = Body(...)):
    """
    Overwrite or initialize the global homepage settings.
    """
    db = await get_database()
    current_time = datetime.now(timezone.utc).isoformat()
    settings_dict = settings.model_dump(by_alias=True, exclude={"id"})
    settings_dict["updatedAt"] = current_time

    # Find the existing document or create a new one
    existing = await db["home_settings"].find_one({})
    if existing:
        await db["home_settings"].replace_one({"_id": existing["_id"]}, settings_dict)
        settings_dict["_id"] = existing["_id"]
    else:
        result = await db["home_settings"].insert_one(settings_dict)
        settings_dict["_id"] = result.inserted_id

    return settings_dict
