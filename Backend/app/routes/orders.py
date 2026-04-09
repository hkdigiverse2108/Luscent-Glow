from fastapi import APIRouter, Body, HTTPException, status, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
from ..models import OrderModel
from ..database import get_database
from datetime import datetime
from bson import ObjectId
import random
import string
from ..shiprocket import shiprocket_client
from .settings import get_payment_credentials

def serialize_order(o: dict) -> dict:
    """Convert a MongoDB order document to a JSON-serializable dict."""
    o["id"] = str(o.get("_id", ""))
    o["_id"] = str(o.get("_id", ""))
    # Ensure required fields have fallbacks
    o.setdefault("orderNumber", "LG-UNKNOWN")
    o.setdefault("userMobile", "Unknown")
    o.setdefault("totalAmount", 0)
    o.setdefault("status", "Processing")
    o.setdefault("paymentStatus", "Pending")
    o.setdefault("items", [])
    o.setdefault("createdAt", datetime.utcnow().isoformat())
    
    # Tracking Fields Fallback
    o.setdefault("trackingNumber", o.get("trackingNumber", ""))
    o.setdefault("courierPartner", o.get("courierPartner", ""))
    
    # Generate direct Shiprocket URL if tracking number exists
    if o.get("trackingNumber"):
        o.setdefault("trackingUrl", f"https://shiprocket.co/tracking/{o['trackingNumber']}")
    else:
        o.setdefault("trackingUrl", "")
        
    return o

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

@router.get("/", response_description="List all systemic orders")
async def list_orders(userMobile: Optional[str] = Query(None), guestId: Optional[str] = Query(None)):
    db = await get_database()
    
    query = {}
    if userMobile or guestId:
        query = {"$or": []}
        if userMobile:
            query["$or"].append({"userMobile": userMobile})
        if guestId:
            query["$or"].append({"userMobile": guestId})
            
    orders = await db["orders"].find(query).sort("createdAt", -1).to_list(500)
    return [serialize_order(o) for o in orders]

@router.get("/{id}", response_description="Get a single order")
async def get_order(id: str):
    db = await get_database()
    
    # Try by ObjectId first, then string _id, then orderNumber
    order = None
    if ObjectId.is_valid(id):
        order = await db["orders"].find_one({"_id": ObjectId(id)})
    if not order:
        order = await db["orders"].find_one({"_id": id})
    if not order:
        order = await db["orders"].find_one({"orderNumber": id})
    if order:
        return serialize_order(order)
        
    raise HTTPException(status_code=404, detail=f"Order {id} not found")

async def fulfill_order_via_shiprocket(db, order, creds):
    """
    Helper function to handle the full Shiprocket fulfillment ritual.
    Returns (success_bool, data_or_error_dict)
    """
    # Prepare Shiprocket Items
    shiprocket_items = []
    for item in order.get("items", []):
        shiprocket_items.append({
            "name": item.get("name"),
            "sku": item.get("productId") or item.get("name"),
            "units": item.get("quantity", 1),
            "selling_price": item.get("price", 0)
        })

    # Map Address
    address = order.get("shippingAddress", {})
    
    # Determine Payment Method
    payment_method = "Prepaid" if order.get("paymentStatus") == "Paid" else "Postpaid"
    
    # Format Date (YYYY-MM-DD HH:MM)
    try:
        from datetime import datetime
        order_date = datetime.fromisoformat(order.get("createdAt").replace("Z", "+00:00")).strftime("%Y-%m-%d %H:%M")
    except:
        order_date = datetime.utcnow().strftime("%Y-%m-%d %H:%M")

    payload = {
        "order_id": order.get("orderNumber"),
        "order_date": order_date,
        "pickup_location": creds.get("shiprocketPickupLocation", "Primary"),
        "billing_customer_name": order.get("userName") or "Valued Customer",
        "billing_last_name": "",
        "billing_address": address.get("street") or "Address Not Provided",
        "billing_city": address.get("city") or "City",
        "billing_pincode": address.get("zipCode") or "000000",
        "billing_state": address.get("state") or "State",
        "billing_country": "India",
        "billing_email": "customer@example.com", # Fallback
        "billing_phone": order.get("userMobile") or "9999999999",
        "shipping_is_billing": True,
        "order_items": shiprocket_items,
        "payment_method": payment_method,
        "sub_total": order.get("totalAmount", 0),
        "length": 10,
        "breadth": 10,
        "height": 5,
        "weight": 0.5
    }

    # 1. Create Order
    sr_order = await shiprocket_client.create_custom_order(payload, creds)
    
    if "order_id" not in sr_order:
        error_msg = sr_order.get("error") or sr_order.get("message") or "Shiprocket order creation failed."
        if "details" in sr_order:
            error_msg += f" Details: {sr_order['details']}"
        return False, {"error": error_msg}

    shiprocket_order_id = sr_order.get("order_id")
    shipment_id = sr_order.get("shipment_id")
    
    tracking_update = {
        "shiprocketOrderId": str(shiprocket_order_id),
        "shiprocketShipmentId": str(shipment_id)
    }

    # 2. Generate AWB
    sr_awb = await shiprocket_client.generate_awb(shipment_id, creds)
    if "response" in sr_awb and "awb_code" in sr_awb["response"]:
        awb_code = sr_awb["response"]["awb_code"]
        tracking_update.update({
            "trackingNumber": awb_code,
            "courierPartner": sr_awb["response"].get("courier_name", "Shiprocket Partner"),
            "trackingUrl": f"https://shiprocket.co/tracking/{awb_code}"
        })
        return True, tracking_update
    else:
        error_msg = sr_awb.get("error") or "Order created, but AWB generation failed."
        return True, {**tracking_update, "warning": error_msg}

@router.put("/{id}/status", response_description="Update order status")
async def update_order_status(id: str, body: dict = Body(...)):
    db = await get_database()
    new_status = body.get("status") if isinstance(body, dict) else body
    
    # Locate order first for tracking context
    order = None
    if ObjectId.is_valid(id):
        order = await db["orders"].find_one({"_id": ObjectId(id)})
    if not order:
        order = await db["orders"].find_one({"_id": id})
    if not order:
        order = await db["orders"].find_one({"orderNumber": id})
        
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {id} not found")

    # Automated Shiprocket Trigger
    tracking_update = {}
    fulfillment_error = None
    
    if new_status == "Shipped" and not order.get("trackingNumber"):
        creds = await get_payment_credentials()
        success, result = await fulfill_order_via_shiprocket(db, order, creds)
        if success:
            tracking_update = result
        else:
            fulfillment_error = result.get("error")

    # Execute Update
    update_data = {"status": new_status}
    if tracking_update:
        # Filter out warnings for DB storage
        db_tracking = {k: v for k, v in tracking_update.items() if k != "warning"}
        update_data.update(db_tracking)

    update_result = await db["orders"].update_one(
        {"_id": order["_id"]}, {"$set": update_data}
    )

    if update_result.modified_count >= 1 or update_result.matched_count == 1:
        return {
            "message": "Status updated", 
            "tracking": tracking_update,
            "fulfillment_error": fulfillment_error
        }
    
    raise HTTPException(status_code=500, detail="Failed to update order status")

@router.post("/{id}/fulfill", response_description="Manually trigger Shiprocket fulfillment")
async def trigger_fulfillment(id: str):
    db = await get_database()
    
    # Locate order
    order = await db["orders"].find_one({"_id": ObjectId(id)}) if ObjectId.is_valid(id) else None
    if not order:
        order = await db["orders"].find_one({"_id": id})
    if not order:
        order = await db["orders"].find_one({"orderNumber": id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    creds = await get_payment_credentials()
    success, result = await fulfill_order_via_shiprocket(db, order, creds)
    
    if success:
        # Store in DB
        db_update = {k: v for k, v in result.items() if k != "warning"}
        await db["orders"].update_one({"_id": order["_id"]}, {"$set": db_update})
        return {"success": True, "tracking": result}
    else:
        raise HTTPException(status_code=400, detail=result.get("error") or "Fulfillment failed")

@router.get("/{id}/track", response_description="Fetch live tracking data")
async def track_order_live(id: str):
    db = await get_database()
    
    # Locate order
    order = None
    if ObjectId.is_valid(id):
        order = await db["orders"].find_one({"_id": ObjectId(id)})
    if not order:
        order = await db["orders"].find_one({"_id": id})
    if not order:
        order = await db["orders"].find_one({"orderNumber": id})
        
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {id} not found")
        
    creds = await get_payment_credentials()
    tracking_data = {}
    
    tracking_number = order.get("trackingNumber")
    shiprocket_order_id = order.get("shiprocketOrderId")
    
    if tracking_number:
        tracking_data = await shiprocket_client.track_by_awb(tracking_number, creds)
    elif shiprocket_order_id:
        tracking_data = await shiprocket_client.track_by_order_id(shiprocket_order_id, creds)
    
    return {
        "order": serialize_order(order),
        "tracking": tracking_data
    }

@router.put("/{id}/tracking", response_description="Update order tracking info")
async def update_order_tracking(id: str, body: dict = Body(...)):
    db = await get_database()
    
    tracking_fields = {
        "trackingNumber": body.get("trackingNumber"),
        "courierPartner": body.get("courierPartner"),
        "trackingUrl": body.get("trackingUrl"),
        "shiprocketOrderId": body.get("shiprocketOrderId"),
        "shiprocketShipmentId": body.get("shiprocketShipmentId")
    }
    
    # Remove None values
    tracking_fields = {k: v for k, v in tracking_fields.items() if v is not None}
    
    if not tracking_fields:
        raise HTTPException(status_code=400, detail="No tracking fields provided")
        
    # Try ObjectId first, then string
    update_result = None
    if ObjectId.is_valid(id):
        update_result = await db["orders"].update_one(
            {"_id": ObjectId(id)}, {"$set": tracking_fields}
        )
    if not update_result or update_result.modified_count == 0:
        update_result = await db["orders"].update_one(
            {"_id": id}, {"$set": tracking_fields}
        )
        
    if update_result and update_result.modified_count == 1:
        return {"message": "Tracking info updated successfully"}
        
    # If not found or not modified, check if it was already set
    return {"message": "Order updated or already has this tracking info"}

@router.post("/{id}/cancel", response_description="Cancel order ritual")
async def cancel_order(id: str):
    db = await get_database()
    
    # Locate order
    order = None
    if ObjectId.is_valid(id):
        order = await db["orders"].find_one({"_id": ObjectId(id)})
    if not order:
        order = await db["orders"].find_one({"_id": id})
    if not order:
        order = await db["orders"].find_one({"orderNumber": id})
        
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Verification: Only allow cancellation if order is NOT shipped
    current_status = order.get("status", "Processing")
    if current_status in ["Shipped", "Delivered", "Cancelled"]:
        raise HTTPException(status_code=400, detail=f"Ritual cannot be cancelled once it is {current_status}")

    # Update status to Cancelled
    update_result = await db["orders"].update_one(
        {"_id": order["_id"]},
        {"$set": {"status": "Cancelled"}}
    )

    if update_result.modified_count == 1:
        return {"message": "Ritual cancelled successfully", "orderNumber": order.get("orderNumber")}
    
    return {"message": "Ritual was already cancelled or updated"}
