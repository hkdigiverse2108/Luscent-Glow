from fastapi import APIRouter, HTTPException, status
from ..database import get_database
from ..models import FAQSettingsModel
from datetime import datetime

router = APIRouter(prefix="/faq", tags=["FAQ"])

@router.get("/settings", response_description="Get FAQ page settings", response_model=FAQSettingsModel)
async def get_faq_settings():
    db = await get_database()
    settings = await db["faq_settings"].find_one({})
    if not settings:
        # Fallback if no settings exist in DB
        return {
            "heroBadge": "Concierge Services",
            "heroTitle": "How can we assist you?",
            "heroDescription": "Explore our curated guide to the most frequent inquiries regarding your journey to radiant skin.",
            "categories": [],
            "supportTitle": "Still have questions?",
            "supportDescription": "Our Glow Concierge team is here to assist you with any personalized requests.",
            "supportButtonText": "Contact Concierge",
            "supportButtonLink": "/contact",
            "updatedAt": datetime.utcnow().isoformat()
        }
    return settings

@router.put("/settings", response_description="Update FAQ page settings", response_model=FAQSettingsModel)
async def update_faq_settings(settings: FAQSettingsModel):
    db = await get_database()
    
    settings_dict = settings.model_dump(by_alias=True, exclude=["id"])
    settings_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    result = await db["faq_settings"].find_one_and_update(
        {}, 
        {"$set": settings_dict}, 
        upsert=True, 
        return_document=True
    )
    return result
