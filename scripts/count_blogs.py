import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def count_blogs():
    load_dotenv(dotenv_path="Backend/.env")
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client['luscent_glow_db']
    count = await db['blog_posts'].count_documents({})
    print(f"Total blog posts: {count}")
    client.close()

if __name__ == "__main__":
    asyncio.run(count_blogs())
