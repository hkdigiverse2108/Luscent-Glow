from fastapi import APIRouter, Body, HTTPException, status
from ..models import UserModel, UserAuthModel, OTPVerifyModel, PasswordResetModel, ForgotPasswordModel
from ..database import get_database
from datetime import datetime
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
            "fullName": user["fullName"],
            "mobileNumber": user["mobileNumber"],
            "email": user["email"]
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
