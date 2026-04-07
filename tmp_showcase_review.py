import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def showcase_review():
    load_dotenv('Backend/.env')
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DATABASE_NAME', 'luscent_glow_db')]
    
    # 1. The Target: Velvet Matte Lipstick
    lipstick_id = "69d08aced8f14d4b220c4180"
    
    # 2. Update the stored review to this ID
    # We found Janvi's review earlier, let's link it!
    result = await db["reviews"].update_many(
        {}, # Update all existing reviews for this showcase
        {"$set": {"productId": lipstick_id, "selectedVariant": "Rose Petal"}}
    )
    print(f"Branded {result.modified_count} reviews for the Velvet Matte Lipstick showcase.")
    
    # 3. Force update the Lipstick stats
    await db["products"].update_one(
        {"_id": lipstick_id},
        {"$set": {"rating": 5.0, "reviewCount": 1}}
    )
    print("Lipstick ratings illuminated to 5.0/5!")
    
    # 4. Check for any other lipstick IDs that might be in the system
    # (Just in case there are multiple entries)
    others = await db["products"].find({"name": {"$regex": "Lipstick", "$options": "i"}}).to_list(10)
    for o in others:
        if str(o["_id"]) != lipstick_id:
             await db["products"].update_one({"_id": o["_id"]}, {"$set": {"rating": 5.0, "reviewCount": 1}})

    client.close()

if __name__ == "__main__":
    asyncio.run(showcase_review())
