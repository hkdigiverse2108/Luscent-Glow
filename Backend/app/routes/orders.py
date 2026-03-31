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
    
    new_order = {
        "userMobile": order_data.get("userMobile"),
        "items": order_data.get("items"),
        "totalAmount": order_data.get("totalAmount"),
        "status": "Processing",
        "paymentStatus": order_data.get("paymentStatus", "Pending"),
        "shippingAddress": order_data.get("shippingAddress"),
        "createdAt": datetime.utcnow().isoformat(),
        "orderNumber": generate_order_number()
    }
    
    inserted_order = await db["orders"].insert_one(new_order)
    created_order = await db["orders"].find_one({"_id": inserted_order.inserted_id})
    return created_order

@router.get("/", response_description="List all orders for a user", response_model=List[OrderModel])
async def list_orders(userMobile: str = Query(...)):
    db = await get_database()
    orders = await db["orders"].find({"userMobile": userMobile}).sort("createdAt", -1).to_list(100)
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
