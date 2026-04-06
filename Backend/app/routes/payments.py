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

router = APIRouter(prefix="/payments", tags=["payments"])

def generate_order_number():
    return "LG-" + "".join(random.choices(string.digits, k=8))

@router.post("/initiate")
async def initiate_payment(order_data: dict = Body(...)):
    """
    1. Create a Pending Order in MongoDB.
    2. Prepare PhonePe Payload.
    3. Calculate Checksum.
    4. Call PhonePe /pg/v1/pay.
    5. Return the redirect URL to Frontend.
    """
    db = await get_database()
    # Load live credentials from DB (falls back to sandbox defaults)
    creds = await get_payment_credentials()
    phonepe_merchant_id = creds.get("merchantId", settings.PHONEPE_MERCHANT_ID)
    phonepe_salt_key = creds.get("saltKey", settings.PHONEPE_SALT_KEY)
    phonepe_salt_index = creds.get("saltIndex", settings.PHONEPE_SALT_INDEX)
    phonepe_base_url = creds.get("baseUrl", settings.PHONEPE_BASE_URL)

    existing_order = await db["orders"].find_one({"orderNumber": order_data.get("orderNumber")})
    
    if existing_order:
        # 1a. Safety Check: If already Paid, don't re-initiate
        if existing_order.get("paymentStatus") == "Paid":
             return {"success": False, "message": "This order has already been secured.", "orderNumber": existing_order["orderNumber"]}
        
        # 1b. Use existing data but potentially refresh the timestamp
        order_number = existing_order["orderNumber"]
        merchant_txn_id = existing_order["merchantTransactionId"]
        created_at = existing_order["createdAt"] # Keep original creation date
        print(f"Re-initiating payment for existing order: {order_number}")

    else:
        # 2a. Create new order identifiers
        merchant_txn_id = f"TXN_{uuid.uuid4().hex[:10].upper()}"
        order_number = order_data.get("orderNumber") or generate_order_number()
        created_at = datetime.utcnow().isoformat()
        
        # 2b. Initial Payment Audit Entry (STORES PENDING DATA)
        new_payment = {
            "merchantId": phonepe_merchant_id,
            "merchantTransactionId": merchant_txn_id,
            "orderNumber": order_number,
            "userMobile": order_data.get("userMobile") or "GUEST_USER",
            "amount": float(order_data.get("totalAmount")),
            "status": "INITIATED",
            "pendingOrderData": order_data, # STORE FULL DATA FOR DEFERRED PLACEMENT
            "response": None,
            "data": None,
            "createdAt": created_at,
            "updatedAt": created_at
        }
        await db["payments"].insert_one(new_payment)
        print(f"Payment initiated & data cached for transaction: {merchant_txn_id}")
    
    # Prepare PhonePe Payload
    # Amount is in Paisa
    amount_paisa = int(float(order_data.get("totalAmount")) * 100)
    
    # Use environment-aware URLs for the PhonePe checkout flow
    base_domain = settings.BACKEND_URL
    
    payload = {
        "merchantId": phonepe_merchant_id,
        "merchantTransactionId": merchant_txn_id,
        "merchantUserId": order_data.get("userMobile") or "GUEST_USER",
        "amount": amount_paisa,
        "redirectUrl": f"{base_domain}/api/payments/redirect?merchantTransactionId={merchant_txn_id}",
        "redirectMode": "REDIRECT", 
        "callbackUrl": f"{base_domain}/api/payments/callback",
        "mobileNumber": order_data.get("userMobile", "9999999999"),
        "paymentInstrument": {
            "type": "PAY_PAGE"
        }
    }
    
    # Encode Base64
    payload_json = json.dumps(payload)
    payload_base64 = base64.b64encode(payload_json.encode('utf-8')).decode('utf-8')
    
    # SHA256(Base64_Payload + "/pg/v1/pay" + Salt_Key) + "###" + Salt_Index
    endpoint = "/pg/v1/pay"
    data_to_hash = f"{payload_base64}{endpoint}{phonepe_salt_key}"
    checksum = hashlib.sha256(data_to_hash.encode('utf-8')).hexdigest()
    x_verify = f"{checksum}###{phonepe_salt_index}"
    
    # Call PhonePe
    headers = {
        "Content-Type": "application/json",
        "X-VERIFY": x_verify,
        "accept": "application/json"
    }
    
    try:
        response = requests.post(
            f"{phonepe_base_url}{endpoint}",
            json={"request": payload_base64},
            headers=headers
        )
        
        res_data = response.json()
        if res_data.get("success"):
            payment_url = res_data["data"]["instrumentResponse"]["redirectInfo"]["url"]
            return {"success": True, "paymentUrl": payment_url, "orderNumber": order_number}
        else:
            print("PhonePe Error:", res_data)
            raise HTTPException(status_code=400, detail="PhonePe could not initiate payment.")
            
    except Exception as e:
        print("Payment Initiation Error:", str(e))
        raise HTTPException(status_code=500, detail="Payment Gateway unavailable.")

@router.post("/callback")
async def payment_callback(request: Request):
    """
    PhonePe Server-to-Server callback.
    Verifies status and updates Order.
    """
    db = await get_database()
    body = await request.body()
    try:
        res_data = json.loads(body)
        # In actual prod, verify the X-VERIFY header from PhonePe here!
        
        # Base64 decode response
        response_base64 = res_data.get("response")
        decoded_response = json.loads(base64.b64decode(response_base64).decode('utf-8'))
        
        merchant_txn_id = decoded_response.get("data", {}).get("merchantTransactionId")
        success = decoded_response.get("success")
        code = decoded_response.get("code")
        
        if success and code == "PAYMENT_SUCCESS":
            # 1. Check if order already exists (prevent duplicates)
            existing_order = await db["orders"].find_one({"merchantTransactionId": merchant_txn_id})
            
            if not existing_order:
                # 2. Retrieve cached order data from the payment log
                payment_record = await db["payments"].find_one({"merchantTransactionId": merchant_txn_id})
                if payment_record and "pendingOrderData" in payment_record:
                    order_data = payment_record["pendingOrderData"]
                    
                    # 3. Create the official Successful Order
                    new_order = {
                        "userMobile": order_data.get("userMobile"),
                        "items": order_data.get("items"),
                        "totalAmount": order_data.get("totalAmount"),
                        "status": "Processing",
                        "paymentStatus": "Paid",
                        "shippingAddress": order_data.get("shippingAddress"),
                        "createdAt": payment_record["createdAt"],
                        "orderNumber": payment_record["orderNumber"],
                        "merchantTransactionId": merchant_txn_id
                    }
                    await db["orders"].insert_one(new_order)
                    
                    # 4. Process Gift Card Rituals (NEW LOGIC Integration)
                    # A. Redemption of Applied Gift Card
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

                    # B. Purchase of New Gift Cards
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

                    # 5. Clear the user's cart
                    identifier = order_data.get("userMobile")
                    if identifier:
                        await db["cart"].delete_many({"$or": [{"userMobile": identifier}, {"guestId": identifier}]})
                    
                    print(f"Deferred Order & Gift Cards PROCESSED successfully for {merchant_txn_id}")

            # 5. Update payment record
            await db["payments"].update_one(
                {"merchantTransactionId": merchant_txn_id},
                {"$set": {
                    "status": "SUCCESS", 
                    "providerReferenceId": decoded_response.get("data", {}).get("transactionId"),
                    "paymentMode": decoded_response.get("data", {}).get("paymentInstrument", {}).get("type"),
                    "response": response_base64,
                    "data": decoded_response.get("data"),
                    "rawResponse": decoded_response,
                    "updatedAt": datetime.utcnow().isoformat()
                }}
            )
        else:
            # Payment failed, we do NOT create an order record
            # We only update the payment record status
            await db["payments"].update_one(
                {"merchantTransactionId": merchant_txn_id},
                {"$set": {
                    "status": "FAILED", 
                    "response": response_base64,
                    "data": decoded_response.get("data"),
                    "rawResponse": decoded_response,
                    "updatedAt": datetime.utcnow().isoformat()
                }}
            )
            print(f"Payment FAILED for {merchant_txn_id}, no order was created.")
            
        return {"status": "OK"}
    except Exception as e:
        print("Callback error:", str(e))
        return {"status": "Error", "message": str(e)}

@router.get("/redirect")
async def payment_redirect(merchantTransactionId: str = None):
    """
    Redirects the user back to the Frontend Success Page.
    Crucial: Directly queries PhonePe Status API to handle cases where 
    the callback was missed (common on localhost).
    """
    db = await get_database()
    # Load live credentials from DB
    creds = await get_payment_credentials()
    phonepe_merchant_id = creds.get("merchantId", settings.PHONEPE_MERCHANT_ID)
    phonepe_salt_key = creds.get("saltKey", settings.PHONEPE_SALT_KEY)
    phonepe_salt_index = creds.get("saltIndex", settings.PHONEPE_SALT_INDEX)
    phonepe_base_url = creds.get("baseUrl", settings.PHONEPE_BASE_URL)

    # 1. Manually Check Status with PhonePe
    merchant_id = phonepe_merchant_id
    endpoint = f"/pg/v1/status/{merchant_id}/{merchantTransactionId}"
    data_to_hash = f"{endpoint}{phonepe_salt_key}"
    checksum = hashlib.sha256(data_to_hash.encode('utf-8')).hexdigest()
    x_verify = f"{checksum}###{phonepe_salt_index}"
    
    headers = {
        "Content-Type": "application/json",
        "X-VERIFY": x_verify,
        "X-MERCHANT-ID": merchant_id,
        "accept": "application/json"
    }
    
    try:
        response = requests.get(
            f"{phonepe_base_url}{endpoint}",
            headers=headers
        )
        res_data = response.json()
        
        if res_data.get("success") and res_data.get("code") == "PAYMENT_SUCCESS":
            # 1. Check if order already exists (prevent duplicates)
            existing_order = await db["orders"].find_one({"merchantTransactionId": merchantTransactionId})
            
            if not existing_order:
                # 2. Retrieve cached order data from the payment log
                payment_record = await db["payments"].find_one({"merchantTransactionId": merchantTransactionId})
                if payment_record and "pendingOrderData" in payment_record:
                    order_data = payment_record["pendingOrderData"]
                    
                    # 3. Create the official Successful Order
                    new_order = {
                        "userMobile": order_data.get("userMobile"),
                        "items": order_data.get("items"),
                        "totalAmount": order_data.get("totalAmount"),
                        "status": "Processing",
                        "paymentStatus": "Paid",
                        "shippingAddress": order_data.get("shippingAddress"),
                        "createdAt": payment_record["createdAt"],
                        "orderNumber": payment_record["orderNumber"],
                        "merchantTransactionId": merchantTransactionId
                    }
                    await db["orders"].insert_one(new_order)
                    
                    # 4. Process Gift Card Rituals (Status Check Fallback Integration)
                    # A. Redemption of Applied Gift Card
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

                    # B. Purchase of New Gift Cards
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

                    # 5. Clear the user's cart (fallback path)
                    identifier = order_data.get("userMobile")
                    if identifier:
                        await db["cart"].delete_many({"$or": [{"userMobile": identifier}, {"guestId": identifier}]})
                    
                    print(f"Status Verified: Deferred Order & Gift Cards PROCESSED successfully for {merchant_txn_id}")

            # 5. Update payment record (Status Check update)
            await db["payments"].update_one(
                {"merchantTransactionId": merchantTransactionId},
                {"$set": {
                    "status": "SUCCESS", 
                    "providerReferenceId": res_data.get("data", {}).get("transactionId"),
                    "paymentMode": res_data.get("data", {}).get("paymentInstrument", {}).get("type"),
                    "data": res_data.get("data"),
                    "rawResponse": res_data,
                    "updatedAt": datetime.utcnow().isoformat()
                }}
            )
        else:
             # Handle any non-success case (FAILED, PENDING, or ERRORS)
             # We only update the payment record, we do NOT create an order
             await db["payments"].update_one(
                {"merchantTransactionId": merchantTransactionId},
                {"$set": {
                    "status": "FAILED", 
                    "data": res_data.get("data"),
                    "rawResponse": res_data,
                    "updatedAt": datetime.utcnow().isoformat()
                }}
            )
             print(f"Status Verified: Payment FAILED/PENDING for {merchantTransactionId}, no order created.")
            
    except Exception as e:
        print("Status Check Error:", str(e))

    # 2. Find the order or payment record to get the proper orderNumber for the UI
    resource = await db["orders"].find_one({"merchantTransactionId": merchantTransactionId})
    if not resource:
        resource = await db["payments"].find_one({"merchantTransactionId": merchantTransactionId})
        
    order_number = resource.get("orderNumber") if resource else "LG-SANCTUARY"
    
    # 3. Redirect back to frontend
    frontend_url = f"{settings.FRONTEND_URL}/order-success?orderNumber={order_number}"
    return RedirectResponse(url=frontend_url)
