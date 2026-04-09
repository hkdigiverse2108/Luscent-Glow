import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="Backend/.env")
mongo_url = os.getenv("MONGODB_URL")

async def check_settings():
    client = AsyncIOMotorClient(mongo_url)
    db = client["luscent_glow_db"]
    
    settings = await db["gift_card_settings"].find_one({})
    if settings:
        print(f"--- Settings Found (Updated: {settings.get('updatedAt')}) ---")
        print("\n--- Card Themes ---")
        for theme in settings.get("themes", []):
            print(f"- {theme.get('name')}: {theme.get('image')}")
    else:
        print("No settings found.")
    client.close()

if __name__ == "__main__":
    asyncio.run(check_settings())
