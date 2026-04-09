import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

# Database Connection Info
MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "luscent_glow_db"

async def seed_editorial():
    print(f"Connecting to {DATABASE_NAME}...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    # Define the initial editorial authority: Dr. Marcus Chen
    marcus_chen = {
        "name": "Dr. Marcus Chen",
        "badge": "EDITORIAL VOICE",
        "quote": "A voice of authority in modern radiance, Elena curates our Journal with a focus on where clinical excellence meets spiritual wellness. Her philosophy: Beauty is the outward reflection of a harmonious soul.",
        "image": "/assets/blog/author.png", # Fallback or specific path
        "isActive": True,
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    # Check if he already exists
    existing = await db["editorial_voices"].find_one({"name": "Dr. Marcus Chen"})
    
    if existing:
        print("Increasing the illumination of existing authority...")
        await db["editorial_voices"].update_one(
            {"_id": existing["_id"]},
            {"$set": marcus_chen}
        )
        print("Dr. Marcus Chen has been updated.")
    else:
        print("Manifesting a new editorial authority...")
        await db["editorial_voices"].insert_one(marcus_chen)
        print("Dr. Marcus Chen has been archived in the sanctum.")

    # Optional: Deactivate others if needed, but since he is the first, it's fine.
    await db["editorial_voices"].update_many(
        {"name": {"$ne": "Dr. Marcus Chen"}},
        {"$set": {"isActive": False}}
    )

    print("Editorial population complete.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_editorial())
