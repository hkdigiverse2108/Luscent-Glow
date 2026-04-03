from fastapi import APIRouter, Body, HTTPException, status, Query
from typing import List, Optional
from ..models import OrderModel
from ..database import get_database
from datetime import datetime
import random
import string

router = APIRouter(prefix="/orders", tags=["orders"])

def generate_order_number():
    return "LG-" + "".join(random.choices(string.digits, k=8))

@router.post("/", response_description="Create a new order", response_model=OrderModel)
async def create_order(order_data: dict = Body(...)):
    db = await get_database()
    
    # In a real app, you'd calculate total and verify stock here
    # For now, we simulate order creation from the frontend request
    
    order_number = generate_order_number()
    created_at = datetime.utcnow().isoformat()
    
    new_order = {
        "userMobile": order_data.get("userMobile"),
        "items": order_data.get("items"),
        "totalAmount": order_data.get("totalAmount"),
        "status": "Processing",
        "paymentStatus": order_data.get("paymentStatus", "Pending"),
        "shippingAddress": order_data.get("shippingAddress"),
        "createdAt": created_at,
        "orderNumber": order_number
    }
    
    inserted_order = await db["orders"].insert_one(new_order)
    created_order = await db["orders"].find_one({"_id": inserted_order.inserted_id})
    
    # Process Redemption of Applied Gift Card if any
    applied_gc_code = order_data.get("appliedGiftCardCode")
    gc_discount = order_data.get("giftCardDiscount", 0)
    
    if applied_gc_code and gc_discount > 0:
        gc = await db["gift_cards"].find_one({"code": applied_gc_code.upper()})
        if gc:
            new_balance = max(0, gc.get("currentBalance", 0) - gc_discount)
            is_active = new_balance > 0
            
            await db["gift_cards"].update_one(
                {"_id": gc["_id"]},
                {"$set": {
                    "currentBalance": new_balance,
                    "isActive": is_active,
                    "lastUsedAt": created_at,
                    "lastOrderNumber": order_number
                }}
            )

    # Process Purchase of New Gift Cards if any
    for item in order_data.get("items", []):
        if item.get("productId", "").startswith("giftcard-") or item.get("category") == "Gift Cards":
            # Generate a unique gift card code
            gift_code = "LG-GIFT-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=4)) + "-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
            
            # Expiry: 1 year from now
            from datetime import timedelta
            expiry_date = (datetime.utcnow() + timedelta(days=365)).isoformat()
            
            metadata = item.get("metadata", {})
            
            gift_card = {
                "code": gift_code,
                "initialBalance": item.get("price", 0),
                "currentBalance": item.get("price", 0),
                "senderMobile": order_data.get("userMobile"),
                "recipientName": metadata.get("recipient", "Valued Customer"),
                "recipientMobile": metadata.get("recipientMobile"),
                "message": metadata.get("message"),
                "theme": metadata.get("theme", "Gold Radiance"),
                "image": metadata.get("image"),
                "isActive": True,
                "expiryDate": expiry_date,
                "createdAt": created_at,
                "orderNumber": order_number
            }
            
            await db["gift_cards"].insert_one(gift_card)
    
    return created_order

@router.get("/", response_description="List all systemic orders", response_model=List[OrderModel])
async def list_orders(userMobile: Optional[str] = Query(None), guestId: Optional[str] = Query(None)):
    db = await get_database()
    
    query = {}
    if userMobile or guestId:
        query = {"$or": []}
        if userMobile:
            query["$or"].append({"userMobile": userMobile})
        if guestId:
            query["$or"].append({"userMobile": guestId})
            
    orders = await db["orders"].find(query).sort("createdAt", -1).to_list(100)
    return orders

@router.get("/{id}", response_description="Get a single order", response_model=OrderModel)
async def get_order(id: str):
    db = await get_database()
    if (order := await db["orders"].find_one({"_id": id})) is not None:
        return order
    
    # Check if querying by orderNumber
    if (order := await db["orders"].find_one({"orderNumber": id})) is not None:
        return order
        
    raise HTTPException(status_code=404, detail=f"Order {id} not found")

@router.put("/{id}/status", response_description="Update order status")
async def update_order_status(id: str, status: str = Body(...)):
    db = await get_database()
    update_result = await db["orders"].update_one(
        {"_id": id}, {"$set": {"status": status}}
    )
    if update_result.modified_count == 1:
        return {"message": "Status updated successfully"}
    raise HTTPException(status_code=404, detail=f"Order {id} not found")
