from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Optional
from datetime import datetime, timezone
from ..models import HomeDiscountBannerModel
from ..database import get_database
from bson import ObjectId
from pydantic import BaseModel, Field

router = APIRouter(prefix="/promotions", tags=["Home Promotions"])

class PromotionRecord(HomeDiscountBannerModel):
    id: str = Field(alias="_id")
    isActive: bool = Field(default=False)
    updatedAt: Optional[str] = None

@router.get("/", response_description="List all promotion banners", response_model=List[dict])
async def list_promotions():
    """
    Retrieve all banners in the library.
    """
    db = await get_database()
    cursor = db["promotions"].find()
    promos = await cursor.to_list(length=100)
    for p in promos:
        p["_id"] = str(p["_id"])
    return promos

@router.get("/active", response_description="Get the currently active home banner")
async def get_active_promotion():
    """
    Retrieve the single banner marked as active for the homepage.
    """
    db = await get_database()
    active = await db["promotions"].find_one({"isActive": True})
    if active:
        active["_id"] = str(active["_id"])
        return active
    return None

@router.post("/", response_description="Add a new banner to the library")
async def create_promotion(promo: dict = Body(...)):
    """
    Store a new banner design.
    """
    db = await get_database()
    promo["updatedAt"] = datetime.now(timezone.utc).isoformat()
    if promo.get("isActive"):
        # Ensure only one is active
        await db["promotions"].update_many({}, {"$set": {"isActive": False}})
    
    result = await db["promotions"].insert_one(promo)
    promo["_id"] = str(result.inserted_id)
    return promo

import re

@router.put("/{id}", response_description="Update a banner")
async def update_promotion(id: str, promo: dict = Body(...)):
    """
    Modify an existing banner design and propagate price changes to linked products.
    """
    db = await get_database()
    if promo.get("isActive"):
        # Ensure only one is active
        await db["promotions"].update_many({"_id": {"$ne": ObjectId(id)}}, {"$set": {"isActive": False}})
    
    promo.pop("_id", None)
    promo["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    # Save the updated promotion
    await db["promotions"].update_one({"_id": ObjectId(id)}, {"$set": promo})
    
    # Automated Price Propagation Logic
    discount_text = promo.get("discountText", "")
    match = re.search(r'(\d+)', discount_text)
    discount_percent = int(match.group(1)) if match else 0
    
    # Find all products linked to this promotion
    cursor = db["products"].find({"appliedPromotionId": id})
    linked_products = await cursor.to_list(length=1000)
    
    for product in linked_products:
        # Use existing originalPrice or fallback to current price as baseline
        original_price = product.get("originalPrice") or product.get("price")
        if original_price:
            new_price = round(original_price * (1 - discount_percent / 100))
            await db["products"].update_one(
                {"_id": product["_id"]},
                {"$set": {
                    "price": new_price,
                    "discount": discount_percent
                }}
            )
            
    promo["_id"] = id
    return promo

@router.delete("/{id}", response_description="Delete a banner")
async def delete_promotion(id: str):
    """
    Remove a banner from the library.
    """
    db = await get_database()
    await db["promotions"].delete_one({"_id": ObjectId(id)})
    return {"message": "Promotion dissolved."}

@router.post("/{id}/activate", response_description="Set banner as active")
async def activate_promotion(id: str):
    """
    Mark a specific banner as the one to show on the homepage.
    """
    db = await get_database()
    await db["promotions"].update_many({}, {"$set": {"isActive": False}})
    await db["promotions"].update_one({"_id": ObjectId(id)}, {"$set": {"isActive": True}})
    return {"message": "Banner manifested on homepage."}
