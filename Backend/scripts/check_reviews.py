import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def check_reviews():
    mongodb_uri = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
    client = AsyncIOMotorClient(mongodb_uri)
    db = client["luscent_glow_db"]
    
    reviews = await db["reviews"].find().to_list(100)
    print(f"Found {len(reviews)} reviews.")
    for r in reviews:
        print(f"Review ID: {r.get('_id')}")
        print(f"Product ID: {r.get('productId')}")
        print(f"User: {r.get('userName')}")
        print(f"Images: {r.get('images')}")
        print("-" * 20)

if __name__ == "__main__":
    asyncio.run(check_reviews())
