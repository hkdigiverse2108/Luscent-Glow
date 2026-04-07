import asyncio, os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('Backend/.env')

async def check():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DATABASE_NAME', 'luscent_glow_db')]
    pid = '69d08aced8f14d4b220c4180'
    reviews = await db['reviews'].find({}).to_list(100)
    print(f"Total reviews: {len(reviews)}")
    for r in reviews:
        p_id = r.get('productId')
        print(f"Review ID: {r.get('_id')}")
        print(f"  ProductId: {repr(p_id)} (Type: {type(p_id)})")
        print(f"  UserName: {r.get('userName')}")
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
