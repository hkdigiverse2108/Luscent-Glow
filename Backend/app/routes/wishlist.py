from fastapi import APIRouter, HTTPException, Body, status
from ..models import WishlistItem, WishlistToggleModel
from ..database import get_database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.get("/{userMobile}")
async def get_wishlist(userMobile: str):
    db = await get_database()
    # Find all wishlist items for the user
    wishlist_items = await db["wishlist"].find({"userMobile": userMobile}).to_list(1000)
    
    # Get the product IDs
    product_ids = [item["productId"] for item in wishlist_items]
    
    # Fetch full product details
    # We need to handle both string and ObjectId cases for _id
    products = []
    for pid in product_ids:
        try:
            # Try as ObjectId first
            product = await db["products"].find_one({"_id": ObjectId(pid)})
            if not product:
                # Then try as string ID
                product = await db["products"].find_one({"_id": pid})
        except:
            # If not a valid ObjectId, try as string ID
            product = await db["products"].find_one({"_id": pid})
            
        if product:
            product["_id"] = str(product["_id"])
            products.append(product)
            
    return products

@router.post("/toggle")
async def toggle_wishlist(data: WishlistToggleModel = Body(...)):
    db = await get_database()
    existing = await db["wishlist"].find_one({
        "userMobile": data.userMobile,
        "productId": data.productId
    })
    
    if existing:
        # Remove it
        await db["wishlist"].delete_one({"_id": existing["_id"]})
        return {"status": "removed", "message": "Product removed from wishlist"}
    else:
        # Add it
        new_item = {
            "userMobile": data.userMobile,
            "productId": data.productId,
            "createdAt": datetime.utcnow().isoformat()
        }
        await db["wishlist"].insert_one(new_item)
        return {"status": "added", "message": "Product added to wishlist"}

@router.post("/remove")
async def remove_from_wishlist(data: WishlistToggleModel = Body(...)):
    db = await get_database()
    await db["wishlist"].delete_one({
        "userMobile": data.userMobile,
        "productId": data.productId
    })
    return {"status": "removed", "message": "Product removed from wishlist"}

@router.delete("/clear/{userMobile}")
async def clear_wishlist(userMobile: str):
    db = await get_database()
    await db["wishlist"].delete_many({"userMobile": userMobile})
    return {"message": "Wishlist cleared successfully"}
