import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "luscent_glow_db"

async def check_images():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    products = await db["products"].find({}).to_list(100)
    print(f"Found {len(products)} products")
    for p in products[:5]:
        print(f"Product: {p.get('name')}, Image: {p.get('image')}")
    client.close()

if __name__ == "__main__":
    asyncio.run(check_images())
