from fastapi import APIRouter, HTTPException, status
from ..database import get_database
from datetime import datetime

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
    
    query = {
        "recipientMobile": mobileNumber,
        "isActive": True
    }
    
    # Specific filter requested by the user:
    # If recipient is 7693485303, only show from 1234567890
    if mobileNumber == "7693485303":
        query["senderMobile"] = "1234567890"

    # Find active gift cards sent to this mobile number
    received_cards = await db["gift_cards"].find(query).to_list(100)
    
    # Format for frontend
    formatted_cards = []
    for card in received_cards:
        formatted_cards.append({
            "code": card["code"],
            "balance": card["currentBalance"],
            "recipientName": card.get("recipientName"),
            "message": card.get("message"),
            "theme": card.get("theme", "Gold Radiance"),
            "image": card.get("image")
        })
        
    return formatted_cards
