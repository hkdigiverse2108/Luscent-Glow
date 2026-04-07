import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime

async def add_test_review():
    load_dotenv('Backend/.env')
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DATABASE_NAME', 'luscent_glow_db')]
    
    # Target Product: Velvet Matte Lipstick
    product_id = "69d08aced8f14d4b220c4180"
    
    # 1. Add the review
    review = {
        "productId": product_id,
        "userMobile": "919876543210",
        "userName": "Jane Doe",
        "rating": 5,
        "comment": "Absolutely love the texture and longevity of this lipstick! Verified by Debugger.",
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "orderNumber": "LG-VERIFY-001"
    }
    
    result = await db["reviews"].insert_one(review)
    print(f"Review inserted with ID: {result.inserted_id}")
    
    # 2. Recalculate product stats
    reviews = await db["reviews"].find({"productId": product_id}).to_list(1000)
    count = len(reviews)
    total_rating = sum(r.get("rating", 0) for r in reviews)
    avg_rating = round(total_rating / count, 1) if count > 0 else 0
    
    await db["products"].update_one(
        {"_id": product_id}, # Try as string
        {"$set": {"rating": avg_rating, "reviewCount": count}}
    )
    # Also try as ObjectId
    from bson import ObjectId
    try:
        await db["products"].update_one(
            {"_id": ObjectId(product_id)},
            {"$set": {"rating": avg_rating, "reviewCount": count}}
        )
    except:
        pass
        
    print(f"Product stats updated: Rating={avg_rating}, Count={count}")
    client.close()

if __name__ == "__main__":
    asyncio.run(add_test_review())
