import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Sanctuary Configuration
MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "luscent_glow_db"

async def inspect_newsletter_registry():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    collections = await db.list_collection_names()
    print(f"Collections: {collections}")
    
    # Check 'newsletter_subs'
    if 'newsletter_subs' in collections:
        data = await db["newsletter_subs"].find().to_list(10)
        print(f"newsletter_subs counts: {len(data)}")
        if data: print(f"Sample: {data[0]}")
    
    # Check 'newsletter'
    if 'newsletter' in collections:
        data = await db["newsletter"].find().to_list(10)
        print(f"newsletter counts: {len(data)}")
        if data: print(f"Sample: {data[0]}")

    # Check 'subscribers'
    if 'subscribers' in collections:
        data = await db["subscribers"].find().to_list(10)
        print(f"subscribers counts: {len(data)}")
        if data: print(f"Sample: {data[0]}")

    client.close()

if __name__ == "__main__":
    asyncio.run(inspect_newsletter_registry())
