import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def fix():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    admin_mobile = "82005498988" # Actual mobile from user's current environment
    admin_password_mock = "Admin@123"
    
    # Update the existing admin or create a new one with the correct number
    # For speed, I'll just upsert this exact number
    import bcrypt
    hashed_pw = bcrypt.hashpw(admin_password_mock.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    from datetime import datetime
    admin_data = {
        "fullName": "Sanctuary Administrator",
        "mobileNumber": admin_mobile,
        "email": "admin@luscentglow.com",
        "password": hashed_pw,
        "isAdmin": True,
        "isVerified": True,
        "otp": "123456",
        "createdAt": datetime.utcnow().isoformat(),
        "profilePicture": None,
        "shippingAddress": None
    }
    
    # Upsert logic
    await db["users"].update_one(
        {"mobileNumber": admin_mobile},
        {"$set": admin_data},
        upsert=True
    )
    
    print(f"Admin Identity Ritual Synchronized for {admin_mobile}.")
    print(f"Credentials: Mobile: {admin_mobile} | Password: {admin_password_mock} | OTP: 123456")
    client.close()

if __name__ == "__main__":
    asyncio.run(fix())
