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
    # Find items by userMobile or guestId if it looks like one
    query = {"$or": [{"userMobile": userMobile}, {"guestId": userMobile}]}
    cart_items = await db["cart"].find(query).to_list(1000)
    
    # Fetch full product details for each cart item
    full_cart = []
    for item in cart_items:
        productId = item["productId"]
        
        # Special handling for Gift Cards (they have a specific prefix and aren't in the products DB)
        if productId.startswith("giftcard-"):
            cart_entry = {
                "id": productId,
                "name": item.get("name") or f"Digital Gift Card — {item.get('metadata', {}).get('theme', 'Classic')}",
                "price": item.get("price") or item.get("metadata", {}).get("price", 0),
                "image": item.get("image") or item.get("metadata", {}).get("image", ""),
                "category": "Gift Cards",
                "quantity": item["quantity"],
                "metadata": item.get("metadata")
            }
            full_cart.append(cart_entry)
            continue

        product = await db["products"].find_one({"_id": ObjectId(productId)})
        if not product:
            product = await db["products"].find_one({"_id": productId})
            
        if product:
            # Resolve variation-specific price if variations exist
            resolved_price = product.get("price", 0)
            selected_shade = item.get("selectedShade")
            selected_size = item.get("selectedSize")
            
            variants = product.get("variants", [])
            if variants:
                for v in variants:
                    # Match variation by color and size
                    color_match = not selected_shade or v.get("color") == selected_shade
                    size_match = not selected_size or v.get("size") == selected_size
                    if color_match and size_match:
                        resolved_price = v.get("price", resolved_price)
                        break
            
            cart_entry = {
                "id": str(product["_id"]),
                "name": product["name"],
                "price": resolved_price,
                "image": product["image"],
                "category": product["category"],
                "quantity": item["quantity"],
                "selectedShade": selected_shade,
                "selectedSize": selected_size,
                "metadata": item.get("metadata")
            }
            full_cart.append(cart_entry)
            
    return full_cart

@router.post("/add")
async def add_to_cart(item: CartItemModel = Body(...)):
    db = await get_database()
    
    # Check by user OR guest
    query = {
        "productId": item.productId,
        "selectedShade": item.selectedShade,
        "selectedSize": item.selectedSize,
        "metadata": item.metadata
    }
    if item.userMobile:
        query["userMobile"] = item.userMobile
    else:
        query["guestId"] = item.guestId
    
    existing = await db["cart"].find_one(query)
    
    if existing:
        new_quantity = existing["quantity"] + item.quantity
        await db["cart"].update_one(
            {"_id": existing["_id"]},
            {"$set": {"quantity": new_quantity}}
        )
        return {"status": "updated", "message": "Cart quantity updated"}
    else:
        item_dict = item.model_dump(by_alias=True, exclude=["id"])
        item_dict["createdAt"] = datetime.utcnow().isoformat()
        await db["cart"].insert_one(item_dict)
        return {"status": "added", "message": "Product added to cart"}

@router.post("/update")
async def update_cart_quantity(data: CartUpdateModel = Body(...)):
    db = await get_database()
    
    query = {
        "productId": data.productId,
        "selectedShade": data.selectedShade,
        "selectedSize": data.selectedSize,
        "metadata": data.metadata
    }
    if data.userMobile:
        query["userMobile"] = data.userMobile
    else:
        query["guestId"] = data.guestId
    
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
        "productId": data.productId,
        "selectedShade": data.selectedShade,
        "selectedSize": data.selectedSize,
        "metadata": data.metadata
    }
    if data.userMobile:
        query["userMobile"] = data.userMobile
    else:
        query["guestId"] = data.guestId
    
    result = await db["cart"].delete_one(query)
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    return {"message": "Item removed from cart"}

@router.delete("/clear/{identifier}")
async def clear_cart(identifier: str):
    db = await get_database()
    # Identifier could be userMobile or guestId
    query = {"$or": [{"userMobile": identifier}, {"guestId": identifier}]}
    await db["cart"].delete_many(query)
    return {"message": "Cart cleared successfully"}
