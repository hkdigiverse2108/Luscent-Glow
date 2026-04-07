import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def check():
    load_dotenv('Backend/.env')
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DATABASE_NAME', 'luscent_glow_db')]
    
    print("--- REVIEWS ---")
    reviews = await db["reviews"].find({}).to_list(100)
    for r in reviews:
        print(f"Review ID: {r.get('_id')}")
        print(f"  ProductId: {r.get('productId')}")
        print(f"  Comment: {r.get('comment')}")
        
    print("\n--- ORDERS ---")
    orders = await db["orders"].find({}).to_list(100)
    for o in orders:
        print(f"Order: {o.get('orderNumber')}")
        for i in o.get('items', []):
           print(f"  Item: {i.get('name')}, ProductId: {i.get('productId')}")
           
    print("\n--- PRODUCTS ---")
    products = await db["products"].find({}).to_list(100)
    for p in products:
        print(f"Product: {p.get('name')}, ID: {p.get('_id')}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
