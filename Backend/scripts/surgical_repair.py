import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# Correct MongoDB URL from .env
MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "luscent_glow_db"

async def perform_surgery():
    print("--- Starting Surgical Heritage Re-linking ---")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    # Target: The review we found in audit
    legacy_id = "legacy-product-id"
    target_id = "69d08aced8f14d4b220c4181" # Hydra Glow product technical ID
    
    # 1. Update the 'legacy-product-id' chronicles
    result = await db["reviews"].update_many(
        {"productId": legacy_id},
        {"$set": {"productId": target_id, "productName": "Hydra Glow Serum"}}
    )
    
    print(f"Surgery Result: Successfully re-linked {result.modified_count} heritage reviews.")
    
    # 2. Force Recalculate Stats for Hydra Glow
    # Count all reviews matching the target ID
    all_reviews = await db["reviews"].find({"productId": target_id}).to_list(1000)
    count = len(all_reviews)
    total_rating = sum(r.get("rating", 0) for r in all_reviews)
    avg_rating = round(total_rating / count, 1) if count > 0 else 5.0
    
    await db["products"].update_one(
        {"_id": ObjectId(target_id)},
        {"$set": {"rating": avg_rating, "reviewCount": count}}
    )
    
    print(f"Stats Updated: Hydra Glow now has {count} chronicles and a {avg_rating} rating.")

    print("\n--- Surgery Complete: Heritage Restored ---")
    client.close()

if __name__ == "__main__":
    asyncio.run(perform_surgery())
