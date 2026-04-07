import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from bson import ObjectId

async def bridge_reviews():
    load_dotenv('Backend/.env')
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DATABASE_NAME', 'luscent_glow_db')]
    
    # 1. Get all reviews
    reviews = await db["reviews"].find({}).to_list(1000)
    print(f"Analyzing {len(reviews)} chronicles...")
    
    bridged_count = 0
    
    for r in reviews:
        review_id = r.get('_id')
        p_id = r.get('productId')
        
        # Check if the product exists currently
        p_query = {"$or": [{"_id": p_id}, {"_id": ObjectId(p_id)}]} if ObjectId.is_valid(p_id) else {"_id": p_id}
        product = await db["products"].find_one(p_query)
        
        if product:
            print(f" - Review {review_id} is already correctly linked to {product.get('name')}")
            continue
            
        # If not, it's a legacy or mock ID. Try to recover the name from Orders.
        order_match = await db["orders"].find_one({"items.productId": p_id}, {"items.$": 1})
        if order_match and "items" in order_match:
            product_name = order_match["items"][0].get("name")
            print(f" - Found legacy review! Original Name: '{product_name}' (ID: {p_id})")
            
            # Now find the NEW product record with this name
            new_product = await db["products"].find_one({"name": product_name})
            if new_product:
                new_p_id = str(new_product.get('_id'))
                print(f"   >>> Bridging to NEW ID: {new_p_id}")
                
                # Update the review
                await db["reviews"].update_one(
                    {"_id": review_id},
                    {"$set": {"productId": new_p_id}}
                )
                bridged_count += 1
            else:
                print(f"   !!! No valid product found for name '{product_name}'")
        else:
            print(f" - Review {review_id} (ID: {p_id}) is orphaned (no order history found).")

    # 2. Update ALL product stats (ratings/counts) for accuracy
    print("\nRefreshing product statistics...")
    all_current_products = await db["products"].find({}).to_list(1000)
    for p in all_current_products:
        p_id = str(p.get('_id'))
        p_reviews = await db["reviews"].find({"productId": p_id}).to_list(1000)
        
        count = len(p_reviews)
        total_rating = sum(pr.get("rating", 0) for pr in p_reviews)
        avg_rating = round(total_rating / count, 1) if count > 0 else 0
        
        await db["products"].update_one(
            {"_id": p.get('_id')},
            {"$set": {"rating": avg_rating, "reviewCount": count}}
        )
        print(f" - {p.get('name')}: {count} reviews, {avg_rating} stars")

    print(f"\nMigration complete. {bridged_count} reviews bridged to current products.")
    client.close()

if __name__ == "__main__":
    asyncio.run(bridge_reviews())
