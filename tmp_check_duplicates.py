import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def check():
    load_dotenv('Backend/.env')
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DATABASE_NAME', 'luscent_glow_db')]
    
    name = "Velvet Matte Lipstick"
    products = await db["products"].find({"name": name}).to_list(100)
    
    print(f"Total products found with name '{name}': {len(products)}")
    for p in products:
        print(f" - ID: {p.get('_id')}, Rating: {p.get('rating')}, Count: {p.get('reviewCount')}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
