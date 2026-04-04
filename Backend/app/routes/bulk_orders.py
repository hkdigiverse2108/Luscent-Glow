from fastapi import APIRouter, HTTPException, status
from ..database import get_database
from ..models import BulkOrderSettingsModel
from datetime import datetime

router = APIRouter(prefix="/bulk-orders", tags=["Bulk Orders"])

@router.get("/settings", response_description="Get bulk orders page settings", response_model=BulkOrderSettingsModel)
async def get_bulk_order_settings():
    db = await get_database()
    settings = await db["bulk_order_settings"].find_one({})
    if not settings:
        # Fallback if no settings exist in DB
        return {
            "heroTitle": "Elevate Your Corporate Gifting.",
            "heroDescription": "Transform business relationships into lasting impressions with our bespoke curation service.",
            "heroImage": "/assets/corporate-gifting.png",
            "heroBadge": "Corporate Concierge",
            "features": [
                {"icon": "Layers", "title": "Bespoke Curation", "desc": "Tailored product selections."},
                {"icon": "Truck", "title": "Priority Logistics", "desc": "White-glove delivery service."},
                {"icon": "ShieldCheck", "title": "Quality Assurance", "desc": "Luxury-standard inspection."},
                {"icon": "Building2", "title": "Corporate Exclusive", "desc": "Access to tiered pricing."}
            ],
            "stats": [
                {"icon": "Users", "label": "1,200+ Global Partners"},
                {"icon": "Package", "label": "Bespoke Packaging"}
            ],
            "quantities": ["10-50", "50-100", "100-500", "500+"],
            "inquiryTitle": "The Inquiry Portal",
            "inquiryDescription": "Share your requirements and our team will reach out with a personalized catalog.",
            "updatedAt": datetime.utcnow().isoformat()
        }
    return settings

@router.put("/settings", response_description="Update bulk orders page settings", response_model=BulkOrderSettingsModel)
async def update_bulk_order_settings(settings: BulkOrderSettingsModel):
    db = await get_database()
    
    settings_dict = settings.model_dump(by_alias=True, exclude=["id"])
    settings_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    result = await db["bulk_order_settings"].find_one_and_update(
        {}, 
        {"$set": settings_dict}, 
        upsert=True, 
        return_document=True
    )
    return result
