import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def find_lipstick():
    load_dotenv('Backend/.env')
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DATABASE_NAME', 'luscent_glow_db')]
    
    print("--- Searching for Velvet Matte Lipstick ---")
    p = await db["products"].find_one({"name": {"$regex": "Velvet Matte Lipstick", "$options": "i"}})
    if p:
        print(f"Found! Name: {p.get('name')}, ID: {p.get('_id')}")
    else:
        print("Lipstick not found by name.")
        
    print("\n--- All Products in DB ---")
    products = await db["products"].find({}).to_list(100)
    for prod in products:
        print(f" - {prod.get('name')}, ID: {prod.get('_id')}")

    client.close()

if __name__ == "__main__":
    asyncio.run(find_lipstick())
