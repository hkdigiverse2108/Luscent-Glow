import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def check():
    load_dotenv('Backend/.env')
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DATABASE_NAME', 'luscent_glow_db')]
    
    # 1. Check all products to find c4181
    all_products = await db["products"].find({}).to_list(1000)
    print(f"Total products in DB: {len(all_products)}")
    target_id = "69d08aced8f14d4b220c4181"
    found = False
    for p in all_products:
        p_id = str(p.get('_id'))
        if p_id == target_id:
            print(f"Found Target Product: {p.get('name')} ({p_id})")
            found = True
        elif p.get('name') == "Velvet Matte Lipstick":
            print(f"Found Lipstick: {p.get('name')} ({p_id})")
            
    if not found:
        print(f"Product {target_id} NOT FOUND in database.")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
