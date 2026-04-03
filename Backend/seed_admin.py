import asyncio
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from datetime import datetime

async def seed_admin():
    # Connection details from app config
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    # Credentials to seed
    admin_mobile = "8200549898"
    admin_password = "Admin@123"
    
    # Check if admin already exists
    existing_admin = await db["users"].find_one({"mobileNumber": admin_mobile})
    if existing_admin:
        print(f"Update: Admin with mobile {admin_mobile} already exists. Synchronizing OTP ritual...")
        await db["users"].update_one(
            {"mobileNumber": admin_mobile},
            {"$set": {"isAdmin": True, "isVerified": True, "otp": "123456"}}
        )
        print("OTP Ritual Synchronized.")
    else:
        # Hash the password
        hashed_pw = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
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
        
        await db["users"].insert_one(admin_data)
        print(f"Success: Admin account created with mobile {admin_mobile} and password {admin_password}")

    client.close()

if __name__ == "__main__":
    asyncio.run(seed_admin())
