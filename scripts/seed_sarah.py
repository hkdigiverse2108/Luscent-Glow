import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

# Database Connection Info
MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "luscent_glow_db"

async def seed_sarah():
    print(f"Connecting to {DATABASE_NAME}...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    # Define the sustainability authority: Sarah Jenkins
    sarah_jenkins = {
        "name": "Sarah Jenkins",
        "badge": "SUSTAINABILITY DIRECTOR",
        "quote": "True beauty is found in the harmony between our self-care rituals and the preservation of our planet's natural wonders. My mission is to ensure that every essence we curate leaves only a radiant legacy.",
        "image": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=800&fit=crop", # High-end portrait
        "isActive": False, # Marcus Chen is currently the active featured voice
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    # Check if she already exists
    existing = await db["editorial_voices"].find_one({"name": "Sarah Jenkins"})
    
    if existing:
        print("Renewing the sustainability authority...")
        await db["editorial_voices"].update_one(
            {"_id": existing["_id"]},
            {"$set": sarah_jenkins}
        )
        print("Sarah Jenkins has been updated in the sanctum.")
    else:
        print("Archiving Sarah Jenkins...")
        await db["editorial_voices"].insert_one(sarah_jenkins)
        print("Sarah Jenkins is now officially recognized as an Editorial Voice.")

    print("Editorial population complete.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_sarah())
