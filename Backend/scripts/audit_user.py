import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def audit():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    mobile = "82005498988"
    user = await db["users"].find_one({"mobileNumber": mobile})
    
    if user:
        print(f"Found Identity: {mobile}")
        print(f"  isAdmin: {user.get('isAdmin')} ({type(user.get('isAdmin'))})")
        print(f"  isVerified: {user.get('isVerified')} ({type(user.get('isVerified'))})")
        print(f"  otp: {user.get('otp')} ({type(user.get('otp'))})")
    else:
        print(f"Identity NOT found: {mobile}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(audit())
