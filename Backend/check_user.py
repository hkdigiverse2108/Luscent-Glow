import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def check():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    user = await db["users"].find_one({"mobileNumber": "8200549898"})
    print(f"User OTP: {user.get('otp')}")
    print(f"User isVerified: {user.get('isVerified')}")
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
