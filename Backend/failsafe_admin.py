import asyncio
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from datetime import datetime

async def seed_failsafe():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    # All likely variations of the administrator's mobile identity
    variations = [
        "8200548988",    # 10 digits (Variation A)
        "8200549898",    # 10 digits (Variation B)
        "82005498988",   # 11 digits (User current environment)
        "82005489888"    # 11 digits (Variation C)
    ]
    
    password = "Admin@123"
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    for mobile in variations:
        admin_data = {
            "fullName": f"Admin ({mobile})",
            "mobileNumber": mobile,
            "email": f"admin_{mobile}@luscentglow.com",
            "password": hashed_pw,
            "isAdmin": True,
            "isVerified": True,
            "otp": "123456",
            "createdAt": datetime.utcnow().isoformat(),
        }
        
        # Upsert: Update if exists, insert if not
        result = await db["users"].update_one(
            {"mobileNumber": mobile},
            {"$set": admin_data},
            upsert=True
        )
        if result.upserted_id:
            print(f"Created new identity: {mobile}")
        else:
            print(f"Synchronized existing identity: {mobile}")

    print("\nSanctuary Failsafe Ritual Complete.")
    print(f"Standard Credentials: Mobile: [Any Above] | Password: {password} | OTP: 123456")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_failsafe())
