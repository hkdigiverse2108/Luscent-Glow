import base64
import hashlib
import json
import uuid
import requests
from fastapi import APIRouter, Body, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from ..config import settings
from ..database import get_database
from .settings import get_payment_credentials
from datetime import datetime
import random
import string
import razorpay

router = APIRouter(prefix="/payments", tags=["payments"])

def generate_order_number():
    return "LG-" + "".join(random.choices(string.digits, k=8))

@router.post("/initiate")
async def initiate_payment(order_data: dict = Body(...)):
    """
    1. Create a Pending Payment Record in MongoDB.
    2. Create an Order in active gateway (Razorpay or Cashfree).
    3. Return gateway payload to Frontend.
    """
    db = await get_database()
    creds = await get_payment_credentials()
    active_gateway = creds.get("activeGateway", "razorpay")

    # Explicit Guest Lead Capture
    # If this is a guest checkout (userMobile provided but no auth token usually), 
    # we upsert a 'Guest' record in the users collection to ensure persistence.
    user_mobile = order_data.get("user_mobile") or order_data.get("userMobile")
    user_email = order_data.get("email") or (order_data.get("shippingAddress") or {}).get("email")
    user_name = order_data.get("userName") or order_data.get("fullName") or (order_data.get("shippingAddress") or {}).get("name")
    
    if user_mobile:
        user_record = await db["users"].find_one({"mobileNumber": user_mobile})
        if not user_record:
            # Create a Guest Profile
            new_guest = {
                "fullName": user_name or "Guest User",
                "email": user_email or f"guest_{user_mobile}@luscentglow.com",
                "mobileNumber": user_mobile,
                "password": "", # No password for guests
                "isGuest": True,
                "isAdmin": False,
                "isVerified": False,
                "shippingAddress": order_data.get("shippingAddress"),
                "createdAt": datetime.utcnow().isoformat()
            }
            await db["users"].insert_one(new_guest)
        elif user_record.get("isGuest"):
            # Update existing guest address/details
            update_fields = {}
            if user_name: update_fields["fullName"] = user_name
            if user_email: update_fields["email"] = user_email
            if order_data.get("shippingAddress"): update_fields["shippingAddress"] = order_data.get("shippingAddress")
            
            if update_fields:
                await db["users"].update_one({"_id": user_record["_id"]}, {"$set": update_fields})

        # Sync to Newsletter Subscribers
        if user_email:
            existing_sub = await db["newsletter_subs"].find_one({"email": user_email})
            if not existing_sub:
                await db["newsletter_subs"].insert_one({
                    "email": user_email,
                    "subscribedAt": datetime.utcnow().isoformat(),
                    "source": "Guest Checkout"
                })

    existing_order = await db["orders"].find_one({"orderNumber": order_data.get("orderNumber")})
    
    if existing_order:
        if existing_order.get("paymentStatus") == "Paid":
             return {"success": False, "message": "This order has already been secured.", "orderNumber": existing_order["orderNumber"]}
        
        order_number = existing_order["orderNumber"]
        merchant_txn_id = existing_order["merchantTransactionId"]
        created_at = existing_order["createdAt"]
    else:
        merchant_txn_id = f"TXN_{uuid.uuid4().hex[:10].upper()}"
        order_number = order_data.get("orderNumber") or generate_order_number()
        created_at = datetime.utcnow().isoformat()
        
        # Initial Payment Audit Entry
        new_payment = {
            "merchantId": active_gateway.upper(),
            "merchantTransactionId": merchant_txn_id,
            "orderNumber": order_number,
            "userMobile": order_data.get("userMobile") or "GUEST_USER",
            "amount": float(order_data.get("totalAmount")),
            "status": "INITIATED",
            "pendingOrderData": order_data,
            "createdAt": created_at,
            "updatedAt": created_at
        }
        await db["payments"].insert_one(new_payment)
    
    # Handle COD (Cash on Delivery)
    if order_data.get("paymentMethod") == "COD":
        new_order = {
            "userMobile": order_data.get("userMobile"),
            "items": order_data.get("items"),
            "totalAmount": order_data.get("totalAmount"),
            "status": "Processing",
            "paymentStatus": "Pending",
            "paymentMethod": "COD",
            "shippingAddress": order_data.get("shippingAddress"),
            "createdAt": datetime.utcnow().isoformat(),
            "orderNumber": order_number,
            "merchantTransactionId": merchant_txn_id if 'merchant_txn_id' in locals() else f"COD_{uuid.uuid4().hex[:10].upper()}"
        }
        await db["orders"].insert_one(new_order)
        
        # Cleanup cart
        identifier = order_data.get("userMobile")
        if identifier:
            await db["cart"].delete_many({"$or": [{"userMobile": identifier}, {"guestId": identifier}]})
            
        return {
            "success": True,
            "gateway": "cod",
            "orderNumber": order_number,
            "message": "Order placed successfully with Cash on Delivery"
        }

    amount_float = float(order_data.get("totalAmount"))

    if active_gateway == "razorpay":
        key_id = creds.get("keyId", settings.RAZORPAY_KEY_ID)
        key_secret = creds.get("keySecret", settings.RAZORPAY_KEY_SECRET)
        client = razorpay.Client(auth=(key_id, key_secret))
        amount_paisa = int(amount_float * 100)
        
        try:
            razorpay_order = client.order.create({
                "amount": amount_paisa,
                "currency": "INR",
                "receipt": order_number,
                "notes": {
                    "merchantTransactionId": merchant_txn_id,
                    "orderNumber": order_number
                }
            })
            
            await db["payments"].update_one(
                {"merchantTransactionId": merchant_txn_id},
                {"$set": {"razorpayOrderId": razorpay_order["id"], "merchantId": "RAZORPAY"}}
            )

            return {
                "success": True, 
                "gateway": "razorpay",
                "razorpayOrderId": razorpay_order["id"],
                "amount": amount_paisa,
                "keyId": key_id,
                "orderNumber": order_number,
                "merchantTransactionId": merchant_txn_id
            }
                
        except Exception as e:
            print("Razorpay Order Creation Error:", str(e))
            raise HTTPException(status_code=500, detail="Razorpay Gateway unavailable.")

    elif active_gateway == "cashfree":
        cf_mode = creds.get("cashfreeMode", "sandbox")
        cf_app_id = creds.get("cashfreeAppId")
        cf_secret = creds.get("cashfreeSecretKey")
        
        url = "https://sandbox.cashfree.com/pg/orders" if cf_mode == "sandbox" else "https://api.cashfree.com/pg/orders"
        
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "x-api-version": "2023-08-01",
            "x-client-id": cf_app_id,
            "x-client-secret": cf_secret
        }
        
        customer_id = order_data.get("userMobile", "guest")
        customer_id = ''.join(e for e in customer_id if e.isalnum()) or "guest"
        if len(customer_id) > 40: customer_id = customer_id[:40]

        payload = {
            "order_id": merchant_txn_id,
            "order_amount": amount_float,
            "order_currency": "INR",
            "customer_details": {
                "customer_id": customer_id,
                "customer_phone": order_data.get("userMobile", "9999999999")[:10],
                "customer_name": order_data.get("userName", "Guest User")
            }
        }
        
        try:
            cf_res = requests.post(url, json=payload, headers=headers)
            cf_data = cf_res.json()
            
            if cf_res.status_code == 200 and "payment_session_id" in cf_data:
                await db["payments"].update_one(
                    {"merchantTransactionId": merchant_txn_id},
                    {"$set": {"cashfreeOrderId": merchant_txn_id, "merchantId": "CASHFREE"}}
                )
                
                return {
                    "success": True,
                    "gateway": "cashfree",
                    "paymentSessionId": cf_data["payment_session_id"],
                    "orderId": merchant_txn_id,
                    "orderNumber": order_number,
                    "merchantTransactionId": merchant_txn_id
                }
            else:
                print("Cashfree Error:", cf_data)
                raise Exception("Failed to initiate Cashfree order")
        except Exception as e:
            print("Cashfree Order Creation Error:", str(e))
            raise HTTPException(status_code=500, detail="Cashfree Gateway unavailable.")

    raise HTTPException(status_code=400, detail="Invalid Gateway configuration")

@router.post("/verify")
async def verify_payment(payload: dict = Body(...)):
    """
    Verifies Gateway Signature and finalizes the order.
    """
    db = await get_database()
    creds = await get_payment_credentials()
    gateway = payload.get("gateway", "razorpay")
    merchant_txn_id = payload.get("merchantTransactionId")

    provider_reference_id = None
    is_verified = False

    try:
        if gateway == "razorpay":
            key_id = creds.get("keyId", settings.RAZORPAY_KEY_ID)
            key_secret = creds.get("keySecret", settings.RAZORPAY_KEY_SECRET)
            client = razorpay.Client(auth=(key_id, key_secret))

            razorpay_payment_id = payload.get("razorpay_payment_id")
            razorpay_order_id = payload.get("razorpay_order_id")
            razorpay_signature = payload.get("razorpay_signature")

            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            client.utility.verify_payment_signature(params_dict)
            provider_reference_id = razorpay_payment_id
            is_verified = True

        elif gateway == "cashfree":
            cf_mode = creds.get("cashfreeMode", "sandbox")
            cf_app_id = creds.get("cashfreeAppId")
            cf_secret = creds.get("cashfreeSecretKey")
            
            url = f"https://sandbox.cashfree.com/pg/orders/{merchant_txn_id}" if cf_mode == "sandbox" else f"https://api.cashfree.com/pg/orders/{merchant_txn_id}"
            headers = {
                "accept": "application/json",
                "x-api-version": "2023-08-01",
                "x-client-id": cf_app_id,
                "x-client-secret": cf_secret
            }
            res = requests.get(url, headers=headers)
            data = res.json()
            
            if data.get("order_status") == "PAID":
                is_verified = True
                provider_reference_id = data.get("cf_order_id", merchant_txn_id)
            else:
                raise Exception("Cashfree order status not PAID")

        if is_verified:
            existing_order = await db["orders"].find_one({"merchantTransactionId": merchant_txn_id})
            
            if not existing_order:
                payment_record = await db["payments"].find_one({"merchantTransactionId": merchant_txn_id})
                if payment_record and "pendingOrderData" in payment_record:
                    order_data = payment_record["pendingOrderData"]
                    
                    new_order = {
                        "userMobile": order_data.get("userMobile"),
                        "items": order_data.get("items"),
                        "totalAmount": order_data.get("totalAmount"),
                        "status": "Processing",
                        "paymentStatus": "Paid",
                        "shippingAddress": order_data.get("shippingAddress"),
                        "createdAt": payment_record["createdAt"],
                        "orderNumber": payment_record["orderNumber"],
                        "merchantTransactionId": merchant_txn_id,
                        "providerReferenceId": provider_reference_id
                    }
                    await db["orders"].insert_one(new_order)
                    
                    applied_gc_code = order_data.get("appliedGiftCardCode")
                    gc_discount = order_data.get("giftCardDiscount", 0)
                    if applied_gc_code and gc_discount > 0:
                        gc = await db["gift_cards"].find_one({"code": applied_gc_code.upper()})
                        if gc:
                            new_balance = max(0, gc.get("currentBalance", 0) - gc_discount)
                            await db["gift_cards"].update_one(
                                {"_id": gc["_id"]},
                                {"$set": {
                                    "currentBalance": new_balance,
                                    "isActive": new_balance > 0,
                                    "lastUsedAt": datetime.utcnow().isoformat(),
                                    "lastOrderNumber": payment_record["orderNumber"]
                                }}
                            )

                    for item in order_data.get("items", []):
                        if item.get("productId", "").startswith("giftcard-") or item.get("category") == "Gift Cards":
                            gift_code = "LG-GIFT-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=4)) + "-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
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
                                "isActive": True,
                                "expiryDate": expiry_date,
                                "createdAt": datetime.utcnow().isoformat(),
                                "orderNumber": payment_record["orderNumber"]
                            }
                            await db["gift_cards"].insert_one(gift_card)

                    identifier = order_data.get("userMobile")
                    if identifier:
                        await db["cart"].delete_many({"$or": [{"userMobile": identifier}, {"guestId": identifier}]})
            
            await db["payments"].update_one(
                {"merchantTransactionId": merchant_txn_id},
                {"$set": {
                    "status": "SUCCESS", 
                    "providerReferenceId": provider_reference_id,
                    "updatedAt": datetime.utcnow().isoformat()
                }}
            )
            
            return {"success": True, "message": "Payment verified and order placed."}

    except Exception as e:
        print("Signature Verification Error:", str(e))
        await db["payments"].update_one(
            {"merchantTransactionId": merchant_txn_id},
            {"$set": {
                "status": "FAILED", 
                "updatedAt": datetime.utcnow().isoformat()
            }}
        )
        raise HTTPException(status_code=400, detail="Invalid payment signature.")


@router.get("/", response_description="List all platform transaction attempts")
async def list_payments(limit: int = 500):
    """
    Administrative endpoint to fetch all transaction audit logs.
    """
    db = await get_database()
    payments = await db["payments"].find({}).sort("createdAt", -1).to_list(limit)
    
    # Simple serialization for frontend
    for p in payments:
        p["id"] = str(p.get("_id", ""))
        p["_id"] = str(p.get("_id", ""))
        p.setdefault("status", "UNKNOWN")
        p.setdefault("amount", 0.0)
        p.setdefault("orderNumber", "N/A")
        p.setdefault("merchantId", "N/A")
        p.setdefault("createdAt", datetime.utcnow().isoformat())
        
    return payments

# Gone are the PhonePe callback/redirect rituals
