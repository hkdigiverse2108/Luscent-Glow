from fastapi import APIRouter, HTTPException, Body, status
from ..models import CartItemModel, CartUpdateModel
from ..database import get_database
from datetime import datetime
from bson import ObjectId
from typing import List

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.get("/{userMobile}")
async def get_cart(userMobile: str):
    db = await get_database()
    # Find all cart items for the user
    cart_items = await db["cart"].find({"userMobile": userMobile}).to_list(1000)
    
    # Fetch full product details for each cart item
    full_cart = []
    for item in cart_items:
        product = await db["products"].find_one({"_id": ObjectId(item["productId"])})
        if not product:
            # Fallback if product ID was stored as string or not found
            product = await db["products"].find_one({"_id": item["productId"]})
            
        if product:
            # Merge product details with cart item details (quantity, shade, size)
            cart_entry = {
                "id": str(product["_id"]),
                "name": product["name"],
                "price": product["price"],
                "image": product["image"],
                "category": product["category"],
                "quantity": item["quantity"],
                "selectedShade": item.get("selectedShade"),
                "selectedSize": item.get("selectedSize"),
                "metadata": item.get("metadata")
            }
            full_cart.append(cart_entry)
            
    return full_cart

@router.post("/add")
async def add_to_cart(item: CartItemModel = Body(...)):
    db = await get_database()
    
    # Check if item with same ID, shade, and size already exists for this user
    query = {
        "userMobile": item.userMobile,
        "productId": item.productId,
        "selectedShade": item.selectedShade,
        "selectedSize": item.selectedSize,
        "metadata": item.metadata
    }
    
    existing = await db["cart"].find_one(query)
    
    if existing:
        # Increment quantity
        new_quantity = existing["quantity"] + item.quantity
        await db["cart"].update_one(
            {"_id": existing["_id"]},
            {"$set": {"quantity": new_quantity}}
        )
        return {"status": "updated", "message": "Cart quantity updated"}
    else:
        # Insert new item
        item_dict = item.model_dump(by_alias=True, exclude=["id"])
        item_dict["createdAt"] = datetime.utcnow().isoformat()
        await db["cart"].insert_one(item_dict)
        return {"status": "added", "message": "Product added to cart"}

@router.post("/update")
async def update_cart_quantity(data: CartUpdateModel = Body(...)):
    db = await get_database()
    
    query = {
        "userMobile": data.userMobile,
        "productId": data.productId,
        "selectedShade": data.selectedShade,
        "selectedSize": data.selectedSize
    }
    
    result = await db["cart"].update_one(
        query,
        {"$set": {"quantity": data.quantity}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    return {"message": "Quantity updated"}

@router.post("/remove")
async def remove_from_cart(data: CartUpdateModel = Body(...)):
    db = await get_database()
    
    query = {
        "userMobile": data.userMobile,
        "productId": data.productId,
        "selectedShade": data.selectedShade,
        "selectedSize": data.selectedSize
    }
    
    result = await db["cart"].delete_one(query)
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    return {"message": "Item removed from cart"}

@router.delete("/clear/{userMobile}")
async def clear_cart(userMobile: str):
    db = await get_database()
    await db["cart"].delete_many({"userMobile": userMobile})
    return {"message": "Cart cleared successfully"}
