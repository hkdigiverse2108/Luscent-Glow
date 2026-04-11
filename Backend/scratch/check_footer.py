import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "luscent_glow_db"

async def check():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    f = await db.footer.find_one({})
    if f:
        for col in f.get('columns', []):
            if col.get('title') == 'Information':
                print(f"Links in Information: {[l['label'] for l in col.get('links', [])]}")
    else:
        print("No footer found")
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
