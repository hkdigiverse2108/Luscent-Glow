import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# Database Connection Info
MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse2108@cluster0.p0q7q.mongodb.net/glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "glow_db"

async def sync_all_products():
    print("--- Starting Global Ritual Synchronization ---")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    products = await db["products"].find().to_list(1000)
    print(f"Found {len(products)} products to sanitize.")
    
    for product in products:
        p_id = product["_id"]
        p_name = product.get("name")
        print(f"\nProcessing Product: {p_name} ({p_id})")
        
        # 1. Identify all possible product identifiers
        query_ids = [str(p_id)]
        if isinstance(p_id, ObjectId):
            query_ids.append(p_id)
            
        # 2. Find ALL reviews matching any of the product's identities
        all_reviews = await db["reviews"].find({
            "$or": [
                {"productId": {"$in": query_ids}},
                {"productId": p_name},
                {"productName": p_name}
            ]
        }).to_list(1000)
        
        # 3. Calculate stats
        count = len(all_reviews)
        total_rating = sum(r.get("rating", 0) for r in all_reviews)
        avg_rating = round(total_rating / count, 1) if count > 0 else 0
        
        print(f"  -> Found {count} collective reviews. Average Rating: {avg_rating}")
        
        # 4. Update the technical product record
        await db["products"].update_one(
            {"_id": p_id},
            {"$set": {"rating": avg_rating, "reviewCount": count}}
        )
        
        # 5. [IMPORTANT] Update the reviews themselves to have the correct technical productId
        # This fixes 'drift' permanently
        if count > 0:
            update_result = await db["reviews"].update_many(
                {
                    "$or": [
                        {"productId": p_name},
                        {"productId": {"$in": [str(p_id) for p_id in query_ids if isinstance(p_id, str)]}}
                    ]
                },
                {"$set": {"productId": str(p_id), "productName": p_name}}
            )
            print(f"  -> Retroactively linked {update_result.modified_count} heritage reviews.")

    print("\n--- Global Ritual Synchronization Complete ---")
    client.close()

if __name__ == "__main__":
    asyncio.run(sync_all_products())
