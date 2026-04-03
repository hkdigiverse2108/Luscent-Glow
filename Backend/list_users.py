import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def list_users():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    cursor = db["users"].find({})
    users = await cursor.to_list(length=100)
    for user in users:
        print(f"Mobile: '{user.get('mobileNumber')}' | isAdmin: {user.get('isAdmin')} | isVerified: {user.get('isVerified')} | OTP: '{user.get('otp')}'")
    client.close()

if __name__ == "__main__":
    asyncio.run(list_users())
