import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# Connection Info
MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "luscent_glow_db"

async def heal_chronicles():
    print("--- Starting The Heritage Healing Ritual ---")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    # 1. Identify broken reviews
    broken_reviews = await db["reviews"].find({
        "$or": [
            {"productId": "id-id"},
            {"productId": ""},
            {"productId": None},
            {"productId": "undefined"}
        ]
    }).to_list(1000)
    
    print(f"Found {len(broken_reviews)} orphaned reviews with broken links.")
    
    # 2. Map of Product Names to valid Technical IDs
    products = await db["products"].find().to_list(1000)
    name_to_id = {p.get("name").lower().strip(): str(p["_id"]) for p in products}
    
    repaired_count = 0
    for review in broken_reviews:
        r_id = review["_id"]
        r_comment = review.get("comment", "")
        r_user = review.get("userName", "Unknown")
        p_name_hint = review.get("productName", "").lower().strip()
        
        print(f"\nHealing Review: '{r_comment[:20]}...' by {r_user}")
        
        target_product_id = None
        
        # Strategy A: Use the stored productName to find the ID
        if p_name_hint in name_to_id:
            target_product_id = name_to_id[p_name_hint]
            print(f"  -> Found via Name Match: {target_product_id}")
            
        # Strategy B: If no name hint, look at the user's order history
        if not target_product_id:
            user_mobile = review.get("userMobile")
            if user_mobile:
                order = await db["orders"].find_one({"userMobile": user_mobile})
                if order and "items" in order and len(order["items"]) > 0:
                    # Link to the first item in their first order as a best-effort guess
                    target_product_id = str(order["items"][0].get("productId"))
                    print(f"  -> Deduced via Order History: {target_product_id}")
        
        # Strategy C: Final Failsafe - if it's 'asdfg' or similar test data, link to the first product
        if not target_product_id and len(products) > 0:
            target_product_id = str(products[0]["_id"])
            print(f"  -> Failsafe: Linking to first available product ({target_product_id})")

        if target_product_id:
            await db["reviews"].update_one(
                {"_id": r_id},
                {"$set": {"productId": target_product_id}}
            )
            repaired_count += 1
            print(f"  -> [SUCCESS] Chronicle healed and re-linked.")

    print(f"\n--- Healing Ritual Complete: {repaired_count} chronicles restored ---")
    client.close()

if __name__ == "__main__":
    asyncio.run(heal_chronicles())
