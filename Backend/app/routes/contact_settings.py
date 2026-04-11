from fastapi import APIRouter, HTTPException, status
from ..database import get_database
from ..models import ContactSettingsModel
from datetime import datetime

router = APIRouter(prefix="/contact-settings", tags=["Contact Settings"])

@router.get("/settings", response_description="Get contact page settings", response_model=ContactSettingsModel)
async def get_contact_settings():
    db = await get_database()
    settings = await db["contact_settings"].find_one({})
    if not settings:
        # Fallback if no settings exist in DB
        return {
            "heroBadge": "Glow Support",
            "heroTitle": "Your Radiance, Our Priority.",
            "heroDescription": "Whether you seek personalized product curation or require immediate support, our artisan team is here to illuminate your journey.",
            "formTitle": "Initiate a Conversation",
            "formSubjects": [
                "Curation Advice",
                "Order Support",
                "Partnership Inquiry",
                "Press & Media",
                "General Exploration"
            ],
            "channels": [
                {"icon": "Phone", "badge": "Support Care", "value": "+91 97126 63607", "desc": "Available for one-on-one WhatsApp curation."},
                {"icon": "Mail", "badge": "Artisan Support", "value": "hello@luscentglow.com", "desc": "For deeper inquiries and shared visions."}
            ],
            "boutiqueImage": "/assets/contact/boutique-storefront.png",
            "faqTitle": "Seeking Instant Curation?",
            "faqSubtitle": "Most inquiries are illuminated in our FAQ registry.",
            "faqLinks": ["Shipping Registry", "Return Rituals", "Authenticity Seal"],
            "updatedAt": datetime.utcnow().isoformat()
        }
    return settings

@router.put("/settings", response_description="Update contact page settings", response_model=ContactSettingsModel)
async def update_contact_settings(settings: ContactSettingsModel):
    db = await get_database()
    
    settings_dict = settings.model_dump(by_alias=True, exclude=["id"])
    settings_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    result = await db["contact_settings"].find_one_and_update(
        {}, 
        {"$set": settings_dict}, 
        upsert=True, 
        return_document=True
    )
    return result
