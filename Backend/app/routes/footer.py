from fastapi import APIRouter, HTTPException, Body, status
from ..models import FooterModel
from ..database import get_database
from datetime import datetime
from typing import Dict, Any

router = APIRouter(prefix="/footer", tags=["Footer"])

# Initial state matches the current hardcoded Footer.tsx
DEFAULT_FOOTER = {
    "brandDescription": "Elevate your beauty routine with our premium, cruelty-free cosmetics. Crafted with love, powered by nature.",
    "socials": [
        {"platform": "Instagram", "url": "https://instagram.com/hk_digiverse", "icon": "Instagram"},
        {"platform": "Facebook", "url": "https://facebook.com/luscentglow", "icon": "Facebook"},
        {"platform": "Youtube", "url": "https://youtube.com/luscentglow", "icon": "Youtube"},
        {"platform": "Twitter", "url": "https://twitter.com/luscentglow", "icon": "Twitter"}
    ],
    "email": "hello@luscentglow.com",
    "phone": "+91 97126 63607",
    "columns": [
        {
            "title": "Information",
            "links": [
                {"label": "About Us", "path": "/about"},
                {"label": "Contact Us", "path": "/contact"},
                {"label": "FAQ's", "path": "/faq"},
                {"label": "Blogs", "path": "/blogs"},
                {"label": "Track Order", "path": "https://shiprocket.co/tracking"}
            ]
        },
        {
            "title": "Policies",
            "links": [
                {"label": "Return & Refund", "path": "/return-policy"},
                {"label": "Privacy Policy", "path": "/privacy-policy"},
                {"label": "Terms & Conditions", "path": "/terms-and-conditions"},
                {"label": "Shipping Policy", "path": "/shipping-policy"},
                {"label": "Cancellation Policy", "path": "/cancellation-policy"}
            ]
        }
    ],
    "newsletterTitle": "Beauty Line",
    "newsletterSubtitle": "Curated aesthetics & beauty tips straight to your inbox.",
    "copyrightText": f"© {datetime.now().year} Luscent Glow. All rights reserved."
}

@router.get("/", response_model=Dict[str, Any])
async def get_footer():
    try:
        db = await get_database()
        footer = await db["footer"].find_one({})
        if not footer:
            return DEFAULT_FOOTER
        
        # Manual ID mapping and removal of raw ObjectId for serialization
        footer["id"] = str(footer["_id"])
        del footer["_id"]
        
        # Self-healing validation check: if any mandatory field is missing, return DEFAULT
        mandatory_fields = ["brandDescription", "socials", "columns", "newsletterTitle", "copyrightText"]
        if any(field not in footer for field in mandatory_fields):
            print("[!] Registry Mismatch: Falling back to Default Sanctuary...")
            return DEFAULT_FOOTER
            
        return footer
    except Exception as e:
        print(f"[!] Sanctuary Handshake Error: {e}")
        return DEFAULT_FOOTER

@router.put("/", response_model=Dict[str, Any])
async def update_footer(footer_data: FooterModel = Body(...)):
    db = await get_database()
    footer_dict = footer_data.dict(by_alias=True, exclude_unset=True)
    if "_id" in footer_dict:
        del footer_dict["_id"]
    
    footer_dict["updatedAt"] = datetime.now().isoformat()
    
    # We only ever have ONE footer doc
    existing = await db["footer"].find_one({})
    if existing:
        await db["footer"].update_one(
            {"_id": existing["_id"]},
            {"$set": footer_dict}
        )
        updated = await db["footer"].find_one({"_id": existing["_id"]})
    else:
        result = await db["footer"].insert_one(footer_dict)
        updated = await db["footer"].find_one({"_id": result.inserted_id})
    
    updated["id"] = str(updated["_id"])
    del updated["_id"]
    return updated
