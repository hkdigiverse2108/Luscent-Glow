import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="Backend/.env")

async def check_settings():
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_uri)
    db = client["luscent_glow"]
    
    settings = await db["gift_card_settings"].find_one({})
    if settings:
        print("Settings found:")
        print(settings)
    else:
        print("No settings found in gift_card_settings collection.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_settings())
