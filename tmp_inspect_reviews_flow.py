import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def check_reviews():
    load_dotenv('Backend/.env')
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DATABASE_NAME', 'luscent_glow_db')]
    
    # Check for the specific product mentioned in the user's curl (usually Velvet Matte Lipstick)
    p_id = "69d08aced8f14d4b220c4180" 
    
    # 1. Check Product Stats
    product = await db["products"].find_one({"_id": p_id})
    if not product:
        # Try finding by string ID
        product = await db["products"].find_one({"_id": p_id})
        
    print(f"--- Product Check ({p_id}) ---")
    if product:
        print(f"Name: {product.get('name')}")
        print(f"Rating: {product.get('rating')}")
        print(f"ReviewCount: {product.get('reviewCount')}")
    else:
        print("Product not found by hex ID.")

    # 2. Check ALL reviews and their productIds
    print("\n--- Reviews Collection ---")
    reviews = await db["reviews"].find({}).to_list(100)
    for r in reviews:
        print(f"Review: {r.get('comment')[:30]}...")
        print(f"  ProductId: {r.get('productId')}")
        print(f"  UserName: {r.get('userName')}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check_reviews())
