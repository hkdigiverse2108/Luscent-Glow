import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def check_full_sanctuary():
    load_dotenv('Backend/.env')
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DATABASE_NAME', 'luscent_glow_db')]
    
    print("--- REVIEWS SANCTUARY ---")
    reviews = await db["reviews"].find({}).to_list(100)
    print(f"Total reviews found: {len(reviews)}")
    for r in reviews:
        print(f" - [{r.get('_id')}] ProductId: {r.get('productId')}, User: {r.get('userName')}, Comment: {r.get('comment')[:30]}...")
        
    print("\n--- PRODUCTS CATALOGUE ---")
    products = await db["products"].find({}).to_list(100)
    for p in products:
        print(f" - [{p.get('_id')}] Name: {p.get('name')}, Rating: {p.get('rating')}, Reviews: {p.get('reviewCount')}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check_full_sanctuary())
