import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def anchor_reviews():
    load_dotenv('Backend/.env')
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DATABASE_NAME', 'luscent_glow_db')]
    
    # 1. Scantron - Get Current Products
    all_products = await db["products"].find({}).to_list(1000)
    name_to_id = {p["name"].strip(): str(p["_id"]) for p in all_products}
    id_to_name = {str(p["_id"]): p["name"].strip() for p in all_products}
    
    print(f"Loaded {len(all_products)} products into memory.")

    # 2. Scantron - Get All Reviews
    all_reviews = await db["reviews"].find({}).to_list(1000)
    print(f"Scanning {len(all_reviews)} reviews for orphaned IDs...")

    anchored_count = 0
    for r in all_reviews:
        review_id = r["_id"]
        p_id = str(r.get("productId", ""))
        
        # Check if the ID already exists in our products
        if p_id in id_to_name:
            print(f" - Review {review_id} correctly anchored to {id_to_name[p_id]}")
            continue
            
        # If not, try to recover the name from Orders first
        order_match = await db["orders"].find_one({"items.productId": p_id}, {"items.$": 1})
        if order_match and "items" in order_match:
            original_name = order_match["items"][0].get("name", "").strip()
            print(f" - Found legacy review! Context: '{original_name}' (ID: {p_id})")
            
            # Find the new ID for this name
            new_id = name_to_id.get(original_name)
            if new_id:
                print(f"   >>> Re-anchoring to current ID: {new_id}")
                await db["reviews"].update_one(
                    {"_id": review_id},
                    {"$set": {"productId": new_id}}
                )
                anchored_count += 1
            else:
                print(f"   !!! No active product found for '{original_name}'")
        else:
            print(f" - Review {review_id} (ID: {p_id}) is orphaned (no order context).")

    # 3. Statistical Reset - Full Rating/Count Recalculation
    print("\nRefreshing product statistics...")
    for p in all_products:
        p_id_str = str(p["_id"])
        
        # Consistent fetching logic - handles string and potential hex mismatches
        reviews = await db["reviews"].find({
            "$or": [
                {"productId": p_id_str},
                {"productId": p_id_str.strip()}
            ]
        }).to_list(1000)
        
        count = len(reviews)
        total_rating = sum(rev.get("rating", 0) for rev in reviews)
        avg_rating = round(total_rating / count, 1) if count > 0 else 0
        
        await db["products"].update_one(
            {"_id": p["_id"]},
            {"$set": {"rating": avg_rating, "reviewCount": count}}
        )
        print(f" - {p['name']}: {count} reviews, {avg_rating} stars")

    print(f"\nAnchoring complete. {anchored_count} reviews successfully bridged.")
    client.close()

if __name__ == "__main__":
    asyncio.run(anchor_reviews())
