from fastapi import APIRouter, HTTPException, status
from ..database import get_database
from ..models import AboutSettingsModel
from datetime import datetime

router = APIRouter(prefix="/about", tags=["About Us"])

@router.get("/settings", response_description="Get about us page settings", response_model=AboutSettingsModel)
async def get_about_settings():
    db = await get_database()
    settings = await db["about_settings"].find_one({})
    if not settings:
        # Fallback if no settings exist in DB
        return {
            "heroImage": "/assets/about/hero-about.png",
            "heroBadge": "The Luscent Chronicle",
            "heroTitle": "Curating Radiance, Defying Convention.",
            "narrativeTitle": "Beauty is not a trend. It is a Quiet Revolution.",
            "narrativeParagraphs": [
                "Luscent Glow was born from a singular obsession: to bridge the gap between scientific precision and botanical poetry.",
                "Founded in 2024, we set out to eliminate the noise of the beauty industry."
            ],
            "values": [
                {"icon": "Leaf", "title": "Botanical Excellence", "desc": "We source the rarest extracts."},
                {"icon": "Heart", "title": "Cruelty-Free Ethics", "desc": "We are 100% vegan."},
                {"icon": "Globe", "title": "Sustainable Glow", "desc": "Packaging designed with the earth in mind."},
                {"icon": "Shield", "title": "Dermal Integrity", "desc": "Dermatologically tested formulas."}
            ],
            "interludeImage": "/assets/about/values-botanical.png",
            "interludeTitle": "98% Natural Origins",
            "interludeSubtitle": "CRAFTED IN SMALL BATCHES FOR UNCOMPROMISED POTENCY",
            "curatorImage": "/assets/about/curator-portrait.png",
            "curatorBadge": "Our Founder",
            "curatorTitle": "A Vision of Subtle Luxury.",
            "curatorQuote": "I wanted to create a space where beauty wasn't about concealment, but about enhancement.",
            "curatorName": "Janvi Vasani, Founder & Curator",
            "commitments": ["100% Vegan", "Paraben Free", "Cruelty Free", "Recyclable"],
            "updatedAt": datetime.utcnow().isoformat()
        }
    return settings

@router.put("/settings", response_description="Update about us page settings", response_model=AboutSettingsModel)
async def update_about_settings(settings: AboutSettingsModel):
    db = await get_database()
    
    settings_dict = settings.model_dump(by_alias=True, exclude=["id"])
    settings_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    result = await db["about_settings"].find_one_and_update(
        {}, 
        {"$set": settings_dict}, 
        upsert=True, 
        return_document=True
    )
    return result
