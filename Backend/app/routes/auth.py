from fastapi import APIRouter, Body, HTTPException, status
from ..models import UserModel, UserAuthModel, OTPVerifyModel, PasswordResetModel, ForgotPasswordModel
from ..database import get_database
from datetime import datetime
from bson import ObjectId
import bcrypt
import random

router = APIRouter(prefix="/auth", tags=["Auth"])

# Helper to hash password
def hash_password(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Helper to verify password
def verify_password(password: str, hashed_password: str):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def serialize_user(user):
    user_data = dict(user)
    user_data["id"] = str(user_data["_id"])
    del user_data["_id"]
    if "password" in user_data: del user_data["password"]
    if "otp" in user_data: del user_data["otp"]
    return user_data

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserModel = Body(...)):
    db = await get_database()
    # Check if user already exists
    existing_user = await db["users"].find_one({"mobileNumber": user.mobileNumber})
    if existing_user:
        raise HTTPException(status_code=400, detail="Mobile number already registered")
    
    # Hash password and setup user
    user_dict = user.model_dump(by_alias=True, exclude=["id"])
    user_dict["password"] = hash_password(user.password)
    user_dict["otp"] = "123456"  # Mock OTP for development
    user_dict["isVerified"] = False
    user_dict["createdAt"] = datetime.utcnow().isoformat()
    
    new_user = await db["users"].insert_one(user_dict)
    return {"message": "Success! Verification code sent.", "userId": str(new_user.inserted_id)}

@router.post("/signin")
async def signin(auth: UserAuthModel = Body(...)):
    db = await get_database()
    
    clean_mobile = sanitize_mobile(auth.mobileNumber)
    user = await db["users"].find_one({"mobileNumber": {"$regex": f"{clean_mobile}$"}})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid mobile number or password")
    
    if not verify_password(auth.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid mobile number or password")
    
    if not user.get("isVerified", False):
        return {"status": "unverified", "message": "Account not verified. Please verify OTP."}
    
    return {
        "status": "success",
        "user": {
            "id": str(user["_id"]),
            "fullName": user["fullName"],
            "mobileNumber": user["mobileNumber"],
            "email": user["email"],
            "isAdmin": user.get("isAdmin", False),
            "profilePicture": user.get("profilePicture"),
            "shippingAddress": user.get("shippingAddress"),
            "addresses": user.get("addresses", [])
        }
    }

@router.post("/verify-otp")
async def verify_otp(data: OTPVerifyModel = Body(...)):
    db = await get_database()
    user = await db["users"].find_one({"mobileNumber": data.mobileNumber, "otp": data.otp})
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"isVerified": True, "otp": None}}
    )
    
    return {"message": "Identity verified successfully"}

import secrets
from ..utils.email_service import send_password_reset_otp_email

import re

def sanitize_mobile(mobile: str) -> str:
    """Strips All non-numeric characters for absolute ritual alignment."""
    if not mobile: return ""
    clean = re.sub(r'\D', '', mobile)
    # If it has more than 10 digits (e.g. 91 prefix), take last 10
    return clean[-10:] if len(clean) > 10 else clean

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordModel = Body(...)):
    db = await get_database()
    clean_mobile = sanitize_mobile(data.mobileNumber)
    user = await db["users"].find_one({"mobileNumber": {"$regex": f"{clean_mobile}$"}})
    
    if not user:
        raise HTTPException(status_code=404, detail="Identity not found in the sanctuary registry.")
    
    # Generate cryptographically secure 6-digit OTP
    otp = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    await db["users"].update_one({"_id": user["_id"]}, {"$set": {"otp": otp}})
    
    # If Admin, send direct Email Ritual
    if user.get("isAdmin", False) and user.get("email"):
        await send_password_reset_otp_email(user["email"], otp)
        return {
            "message": "Success! A secure reset code has been sent to your administrative email.",
            "userId": str(user["_id"])
        }
    
    return {
        "message": "Password reset ritual initiated. Check your secure channels.",
        "userId": str(user["_id"])
    }

@router.post("/reset-password")
async def reset_password(data: PasswordResetModel = Body(...)):
    db = await get_database()
    user = None
    
    # --- Multi-Vector Identity Ritual ---
    # Vector 1: Unique Database Identifier
    if data.userId:
        try:
            user = await db["users"].find_one({"_id": ObjectId(data.userId)})
        except:
             pass # Fall through to next vector

    # Vector 2: Mobile Number Ritual Alignment
    if not user and data.mobileNumber:
        clean_mobile = sanitize_mobile(data.mobileNumber)
        user = await db["users"].find_one({"mobileNumber": {"$regex": f"{clean_mobile}$"}})

    # Vector 3: Secondary email lookup (Strictly for Admins)
    if not user:
        pass

    if not user:
         raise HTTPException(status_code=400, detail="Identity could not be anchored in the sanctuary.")

    # --- String-Strict OTP Comparison ---
    stored_otp = str(user.get("otp", "")).strip()
    received_otp = str(data.otp).strip().replace(" ", "")

    if stored_otp != received_otp or not stored_otp:
         # Internal Diagnostic Registry
         print(f"DEBUG: Ritual Mismatch. Expected: '{stored_otp}', Received: '{received_otp}'")
         raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    
    hashed_password = hash_password(data.newPassword)
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"password": hashed_password, "otp": None}}
    )
    
    updated_user = await db["users"].find_one({"_id": user["_id"]})
    return {"message": "Safehold restored. Password updated successfully.", "user": serialize_user(updated_user)}

@router.put("/profile/update")
async def update_profile(data: dict = Body(...)):
    db = await get_database()
    userId = data.get("userId")
    newMobileNumber = data.get("mobileNumber")
    
    if not userId:
        # Fallback to mobileNumber if userId is not provided (legacy support)
        # Note: This won't support mobile number changes if userId is missing.
        user = await db["users"].find_one({"mobileNumber": newMobileNumber})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        userId = str(user["_id"])

    try:
        user_id_obj = ObjectId(userId)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    # Get current user state
    current_user = await db["users"].find_one({"_id": user_id_obj})
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    oldMobileNumber = current_user["mobileNumber"]
    
    # Check if mobile number is being changed
    if newMobileNumber and newMobileNumber != oldMobileNumber:
        # Check if new number is already taken
        existing_user = await db["users"].find_one({"mobileNumber": newMobileNumber})
        if existing_user:
            raise HTTPException(status_code=400, detail="New mobile number is already registered")
        
        # We will update everything later once the main update is successful
        should_update_relations = True
    else:
        should_update_relations = False

    update_data = {
        "fullName": data.get("fullName"),
        "email": data.get("email"),
        "mobileNumber": newMobileNumber,
        "profilePicture": data.get("profilePicture"),
        "shippingAddress": data.get("shippingAddress")
    }
    
    # Filter out None values
    update_data = {k: v for k, v in update_data.items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided to update")

    result = await db["users"].update_one(
        {"_id": user_id_obj},
        {"$set": update_data}
    )
    
    if should_update_relations:
        # Update references across all collections
        # 1. Cart
        await db["cart"].update_many(
            {"userMobile": oldMobileNumber},
            {"$set": {"userMobile": newMobileNumber}}
        )
        
        # 2. Wishlist
        await db["wishlist"].update_many(
            {"userMobile": oldMobileNumber},
            {"$set": {"userMobile": newMobileNumber}}
        )
        
        # 3. Orders
        await db["orders"].update_many(
            {"userMobile": oldMobileNumber},
            {"$set": {"userMobile": newMobileNumber}}
        )

        # 4. Gift Cards (both sender and recipient)
        await db["gift_cards"].update_many(
            {"senderMobile": oldMobileNumber},
            {"$set": {"senderMobile": newMobileNumber}}
        )
        await db["gift_cards"].update_many(
            {"recipientMobile": oldMobileNumber},
            {"$set": {"recipientMobile": newMobileNumber}}
        )

    # Get updated user
    updated_user = await db["users"].find_one({"_id": user_id_obj})
    
    return {
        "status": "success",
        "user": serialize_user(updated_user)
    }

@router.post("/verify-password")
async def verify_user_password(data: dict = Body(...)):
    db = await get_database()
    mobileNumber = data.get("mobileNumber")
    password = data.get("password")
    
    if not mobileNumber or not password:
        raise HTTPException(status_code=400, detail="Mobile number and password are required")
        
    user = await db["users"].find_one({"mobileNumber": mobileNumber})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
        
    return {"status": "success", "message": "Password verified", "isValid": True}

@router.put("/change-password")
async def change_password(data: dict = Body(...)):
    db = await get_database()
    mobileNumber = data.get("mobileNumber")
    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")
    
    if not all([mobileNumber, old_password, new_password]):
        raise HTTPException(status_code=400, detail="Mobile number and both passwords are required")
        
    user = await db["users"].find_one({"mobileNumber": mobileNumber})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not verify_password(old_password, user["password"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
        
    hashed_password = hash_password(new_password)
    await db["users"].update_one(
        {"mobileNumber": mobileNumber},
        {"$set": {"password": hashed_password}}
    )
    
    updated_user = await db["users"].find_one({"mobileNumber": mobileNumber})
    return {"status": "success", "message": "Password updated successfully", "user": serialize_user(updated_user)}

# --- Multiple Address Management ---

@router.post("/addresses")
async def add_address(data: dict = Body(...)):
    db = await get_database()
    userId = data.get("userId")
    address = data.get("address")
    
    if not userId or not address:
        raise HTTPException(status_code=400, detail="User ID and address data are required")
    
    # Generate an ID for the address if not present
    if "id" not in address:
        address["id"] = str(ObjectId())
    
    # If this is the first address or marked as default, handle default logic
    db_user = await db["users"].find_one({"_id": ObjectId(userId)})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_addresses = db_user.get("addresses", [])
    
    if not current_addresses or address.get("isDefault"):
        # Set all others to false
        for addr in current_addresses:
            addr["isDefault"] = False
        address["isDefault"] = True
        # Also update the legacy shippingAddress for compatibility
        await db["users"].update_one(
            {"_id": ObjectId(userId)},
            {"$set": {"shippingAddress": address}}
        )

    await db["users"].update_one(
        {"_id": ObjectId(userId)},
        {"$set": {"addresses": current_addresses + [address]}} 
    )
    
    updated_user = await db["users"].find_one({"_id": ObjectId(userId)})
    return {"status": "success", "user": serialize_user(updated_user), "addresses": updated_user.get("addresses", [])}

@router.put("/addresses/{address_id}")
async def update_address(address_id: str, data: dict = Body(...)):
    db = await get_database()
    userId = data.get("userId")
    updated_address = data.get("address")
    
    if not userId or not updated_address:
        raise HTTPException(status_code=400, detail="User ID and address data are required")
    
    db_user = await db["users"].find_one({"_id": ObjectId(userId)})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_addresses = db_user.get("addresses", [])
    new_addresses = []
    
    for addr in current_addresses:
        if addr.get("id") == address_id:
            # Preserve ID
            updated_address["id"] = address_id
            new_addresses.append(updated_address)
        else:
            if updated_address.get("isDefault"):
                addr["isDefault"] = False
            new_addresses.append(addr)
            
    if updated_address.get("isDefault"):
         await db["users"].update_one(
            {"_id": ObjectId(userId)},
            {"$set": {"shippingAddress": updated_address}}
        )

    await db["users"].update_one(
        {"_id": ObjectId(userId)},
        {"$set": {"addresses": new_addresses}}
    )
    
    updated_user = await db["users"].find_one({"_id": ObjectId(userId)})
    return {"status": "success", "user": serialize_user(updated_user), "addresses": new_addresses}

@router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, userId: str):
    db = await get_database()
    
    db_user = await db["users"].find_one({"_id": ObjectId(userId)})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_addresses = db_user.get("addresses", [])
    new_addresses = [addr for addr in current_addresses if addr.get("id") != address_id]
    
    # If we deleted the default address, set the first remaining one as default
    if any(addr.get("id") == address_id and addr.get("isDefault") for addr in current_addresses):
        if new_addresses:
            new_addresses[0]["isDefault"] = True
            await db["users"].update_one(
                {"_id": ObjectId(userId)},
                {"$set": {"shippingAddress": new_addresses[0]}}
            )
        else:
            await db["users"].update_one(
                {"_id": ObjectId(userId)},
                {"$unset": {"shippingAddress": ""}}
            )

    await db["users"].update_one(
        {"_id": ObjectId(userId)},
        {"$set": {"addresses": new_addresses}}
    )
    
    updated_user = await db["users"].find_one({"_id": ObjectId(userId)})
    return {"status": "success", "user": serialize_user(updated_user), "addresses": new_addresses}

@router.put("/addresses/{address_id}/default")
async def set_default_address(address_id: str, userId: str = Body(..., embed=True)):
    db = await get_database()
    
    db_user = await db["users"].find_one({"_id": ObjectId(userId)})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_addresses = db_user.get("addresses", [])
    default_addr = None
    new_addresses = []
    
    for addr in current_addresses:
        if addr.get("id") == address_id:
            addr["isDefault"] = True
            default_addr = addr
        else:
            addr["isDefault"] = False
        new_addresses.append(addr)
        
    if not default_addr:
        raise HTTPException(status_code=404, detail="Address not found")
        
    await db["users"].update_one(
        {"_id": ObjectId(userId)},
        {"$set": {"addresses": new_addresses, "shippingAddress": default_addr}}
    )
    
    updated_user = await db["users"].find_one({"_id": ObjectId(userId)})
    return {"status": "success", "user": serialize_user(updated_user), "addresses": new_addresses}
