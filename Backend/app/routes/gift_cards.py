from fastapi import APIRouter, HTTPException, status
from ..database import get_database
from ..models import GiftCardModel, UpdateGiftCardModel, GiftCardSettingsModel
from datetime import datetime, timedelta
from bson import ObjectId
import random
import string

router = APIRouter(prefix="/gift-cards", tags=["Gift Cards"])

@router.get("/validate/{code}")
async def validate_gift_card(code: str):
    db = await get_database()
    
    # Standardize code format (uppercase, trimmed)
    code = code.strip().upper()
    
    gift_card = await db["gift_cards"].find_one({"code": code})
    
    if not gift_card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Valid gift card with this code was not found."
        )
    
    if not gift_card.get("isActive"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="This gift card has already been fully redeemed or is inactive."
        )
    
    # Check expiry
    expiry_str = gift_card.get("expiryDate")
    if expiry_str:
        expiry_date = datetime.fromisoformat(expiry_str)
        if expiry_date < datetime.utcnow():
            await db["gift_cards"].update_one(
                {"_id": gift_card["_id"]}, 
                {"$set": {"isActive": False}}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="This gift card has expired."
            )
            
    if gift_card.get("currentBalance", 0) <= 0:
        await db["gift_cards"].update_one(
            {"_id": gift_card["_id"]}, 
            {"$set": {"isActive": False}}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="This gift card has no remaining balance."
        )
        
    return {
        "code": gift_card["code"],
        "balance": gift_card["currentBalance"],
        "recipientName": gift_card.get("recipientName"),
        "message": gift_card.get("message"),
        "theme": gift_card.get("theme", "Gold Radiance"),
        "image": gift_card.get("image")
    }

@router.get("/received/{mobileNumber}")
async def get_received_gift_cards(mobileNumber: str):
    db = await get_database()
    
    # Normalize input: digits only
    clean_num = "".join(filter(str.isdigit, mobileNumber))
    
    # IND 91 prefix handle
    if clean_num.startswith("91") and len(clean_num) == 12:
        core_num = clean_num[2:]
    else:
        core_num = clean_num
        
    # Match ONLY by recipientMobile — the card belongs to whoever is the recipient.
    # If a user bought a card for themselves, recipientMobile = their own number → matches.
    # If they bought for someone else, only that recipient sees it.
    # Regex handles format differences: "+91 9876543210" vs "9876543210"
    query = {
        "isActive": True,
        "currentBalance": {"$gt": 0},
        "$or": [
            {"recipientMobile": {"$regex": f".*{core_num}.*"}},
            {"recipientMobile": mobileNumber},
        ]
    }

    # Find active gift cards the user can use (as recipient)
    received_cards = await db["gift_cards"].find(query).to_list(100)
    
    # Deduplicate by code in case a card matches both sender and recipient
    seen_codes = set()
    formatted_cards = []
    for card in received_cards:
        code = card["code"]
        if code in seen_codes:
            continue
        seen_codes.add(code)
        formatted_cards.append({
            "code": code,
            "balance": card["currentBalance"],
            "recipientName": card.get("recipientName"),
            "message": card.get("message"),
            "theme": card.get("theme", "Gold Radiance"),
            "image": card.get("image")
        })
        
    return formatted_cards

@router.get("/by-user", response_description="List all gift cards grouped by user (Admin only)")
async def list_gift_cards_by_user():
    db = await get_database()
    cards = await db["gift_cards"].find({}).sort("createdAt", -1).to_list(1000)
    
    # Group by senderMobile (normalize: strip spaces/+91)
    groups: dict = {}
    for card in cards:
        raw_mobile = card.get("senderMobile") or "ADMIN"
        # Normalize key: last 10 digits, or "ADMIN"
        if raw_mobile == "ADMIN":
            key = "ADMIN"
        else:
            digits = "".join(filter(str.isdigit, raw_mobile))
            key = digits[-10:] if len(digits) >= 10 else digits or "UNKNOWN"

        if key not in groups:
            groups[key] = {
                "senderMobile": raw_mobile,
                "senderName": card.get("senderName") or ("Admin Panel" if key == "ADMIN" else None),
                "normalizedMobile": key,
                "totalCards": 0,
                "activeCards": 0,
                "totalBalance": 0,
                "cards": []
            }
        
        card_data = {
            "id": str(card.get("_id", "")),
            "code": card.get("code"),
            "initialBalance": card.get("initialBalance", 0),
            "currentBalance": card.get("currentBalance", 0),
            "recipientName": card.get("recipientName"),
            "recipientMobile": card.get("recipientMobile"),
            "message": card.get("message"),
            "theme": card.get("theme", "Gold Radiance"),
            "isActive": card.get("isActive", False),
            "expiryDate": card.get("expiryDate"),
            "createdAt": card.get("createdAt"),
            "orderNumber": card.get("orderNumber"),
        }
        groups[key]["cards"].append(card_data)
        groups[key]["totalCards"] += 1
        if card.get("isActive"):
            groups[key]["activeCards"] += 1
        groups[key]["totalBalance"] += card.get("currentBalance", 0)

    # Sort groups: ADMIN last, then by total cards desc
    result = sorted(groups.values(), key=lambda g: (g["normalizedMobile"] == "ADMIN", -g["totalCards"]))
    return result

@router.get("/", response_description="List all gift cards (Admin only)", response_model=list[GiftCardModel])
async def list_gift_cards():
    db = await get_database()
    cards = await db["gift_cards"].find({}).to_list(1000)
    return cards

@router.post("/", response_description="Generate new gift card", response_model=GiftCardModel)
async def create_gift_card(card: GiftCardModel):
    db = await get_database()
    
    # Ensure code is unique
    if await db["gift_cards"].find_one({"code": card.code}):
        raise HTTPException(status_code=400, detail="Gift card code already exists.")
        
    new_card = await db["gift_cards"].insert_one(card.model_dump(by_alias=True, exclude=["id"]))
    created_card = await db["gift_cards"].find_one({"_id": new_card.inserted_id})
    return created_card

@router.get("/settings", response_description="Get gift cards page settings", response_model=GiftCardSettingsModel)
async def get_gift_card_settings():
    db = await get_database()
    settings = await db["gift_card_settings"].find_one({})
    if not settings:
        # Fallback if no settings exist in DB
        return {
            "heroTitle": "Gift Radiance",
            "heroDescription": "Empower someone you love to choose their own ritual with our digital originals.",
            "heroImage": "/assets/gift-cards/hero.png",
            "themes": [
                {"id": "1", "name": "Gold Radiance", "image": "/assets/gift-cards/gold.png", "color": "#D4AF37"},
                {"id": "2", "name": "Rose Blush", "image": "/assets/gift-cards/rose.png", "color": "#E5BABA"},
                {"id": "3", "name": "Midnight Glow", "image": "/assets/gift-cards/midnight.png", "color": "#2D2424"}
            ],
            "amounts": [1000, 2500, 5000, 10000],
            "features": [
                {"icon": "Zap", "title": "Instant Delivery", "desc": "Tokens arrive in seconds."},
                {"icon": "ShieldCheck", "title": "Secure Checkout", "desc": "Fully encrypted sanctuary."},
                {"icon": "Sparkles", "title": "Never Expires", "desc": "Valid for a full ritual year."}
            ],
            "benefitsTitle": "Because Beauty is a Personal Choice.",
            "benefitsDescription": "Choosing the perfect skincare ritual for someone else can be challenging. Our digital gift certificates ensure they receive exactly what their skin desires.",
            "benefitsList": [
                "Curated luxury selection",
                "Personalized digital messages",
                "Instant balance updates",
                "Exquisite card themes"
            ],
            "faqs": [
                {"q": "How do I redeem my card?", "a": "Enter your unique code in the checkout sanctuary."},
                {"q": "Can I use it partially?", "a": "Yes, balances are automatically tracked."}
            ],
            "updatedAt": datetime.utcnow().isoformat()
        }
    return settings

@router.put("/settings", response_description="Update gift cards page settings", response_model=GiftCardSettingsModel)
async def update_gift_card_settings(settings: GiftCardSettingsModel):
    db = await get_database()
    
    # Standardize update time
    settings_dict = settings.model_dump(by_alias=True, exclude=["id"])
    settings_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    # We only ever want ONE settings document
    result = await db["gift_card_settings"].find_one_and_update(
        {}, 
        {"$set": settings_dict}, 
        upsert=True, 
        return_document=True
    )
    return result

@router.put("/{id}", response_description="Update a gift card", response_model=GiftCardModel)
async def update_gift_card(id: str, card_update: UpdateGiftCardModel):
    db = await get_database()
    query = {"_id": id}
    try:
        if ObjectId.is_valid(id):
            query = {"_id": ObjectId(id)}
    except:
        pass

    update_data = {k: v for k, v in card_update.model_dump().items() if v is not None}
    
    if len(update_data) >= 1:
        update_result = await db["gift_cards"].find_one_and_update(
            query, {"$set": update_data}, return_document=True
        )
        if update_result:
            return update_result
            
    if (existing := await db["gift_cards"].find_one(query)) is not None:
        return existing
        
    raise HTTPException(status_code=404, detail=f"Gift card {id} not found")

@router.delete("/{id}", response_description="Delete a gift card")
async def delete_gift_card(id: str):
    db = await get_database()
    query = {"_id": id}
    try:
        if ObjectId.is_valid(id):
            query = {"_id": ObjectId(id)}
    except:
        pass
        
    delete_result = await db["gift_cards"].delete_one(query)
    if delete_result.deleted_count == 1:
        return {"detail": "Gift card successfully deleted"}
        
    raise HTTPException(status_code=404, detail=f"Gift card {id} not found")

