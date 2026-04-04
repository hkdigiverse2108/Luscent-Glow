import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="Backend/.env")
mongo_url = os.getenv("MONGODB_URL") # corrected env var name from .env

async def check_settings():
    client = AsyncIOMotorClient(mongo_url)
    db = client["luscent_glow_db"]
    
    settings = await db["gift_card_settings"].find_one({})
    if settings:
        print("--- Existing Settings Found ---")
        for k, v in settings.items():
            if k != "_id":
                print(f"{k}: {v}")
    else:
        print("No settings found in gift_card_settings collection.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_settings())
