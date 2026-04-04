import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Path to the .env file in the Backend directory
env_path = os.path.join("c:/Users/HP/Downloads/Lucsent_glow/Backend", ".env")
load_dotenv(env_path)

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "luscent_glow_db")

async def check_products():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    count = await db["products"].count_documents({})
    print(f"Total products in DB: {count}")
    
    if count > 0:
        product = await db["products"].find_one({})
        import json
        from bson import json_util
        print(json.dumps(product, default=json_util.default, indent=2))
    else:
        print("No products found in DB.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_products())
