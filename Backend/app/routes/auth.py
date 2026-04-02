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
    user = await db["users"].find_one({"mobileNumber": auth.mobileNumber})
    
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
            "profilePicture": user.get("profilePicture"),
            "shippingAddress": user.get("shippingAddress")
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

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordModel = Body(...)):
    db = await get_database()
    user = await db["users"].find_one({"mobileNumber": data.mobileNumber})
    if not user:
        raise HTTPException(status_code=404, detail="Mobile number not found")
    
    # Generate new OTP
    otp = "123456" # Mock OTP
    await db["users"].update_one({"_id": user["_id"]}, {"$set": {"otp": otp}})
    
    return {"message": "Password reset token sent via SMS"}

@router.post("/reset-password")
async def reset_password(data: PasswordResetModel = Body(...)):
    db = await get_database()
    user = await db["users"].find_one({"mobileNumber": data.mobileNumber, "otp": data.otp})
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    hashed_password = hash_password(data.newPassword)
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"password": hashed_password, "otp": None}}
    )
    
    return {"message": "Password updated successfully"}

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
        "user": {
            "id": str(updated_user["_id"]),
            "fullName": updated_user["fullName"],
            "mobileNumber": updated_user["mobileNumber"],
            "email": updated_user["email"],
            "profilePicture": updated_user.get("profilePicture"),
            "shippingAddress": updated_user.get("shippingAddress")
        }
    }

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
    
    return {"status": "success", "message": "Password updated successfully"}
