import asyncio, os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv('Backend/.env')

async def check():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DATABASE_NAME', 'luscent_glow_db')]
    pid = '69d08aced8f14d4b220c4180'
    p = await db['products'].find_one({'_id': pid})
    if not p:
        p = await db['products'].find_one({'_id': ObjectId(pid)})
    
    if p:
        print(f"Product: {p.get('name')}")
        print(f"Rating: {p.get('rating')}")
        print(f"ReviewCount: {p.get('reviewCount')}")
    else:
        print("Product not found")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
