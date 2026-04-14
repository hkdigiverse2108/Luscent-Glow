import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def inspect_data():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
    db = client["luscent_glow_db"]
    
    print("--- PRODUCTS ---")
    cursor = db["products"].find({}, {"name": 1, "tags": 1})
    async for p in cursor:
        print(f"Product: {p.get('name')} | Tags: {p.get('tags', [])}")
    
    print("\n--- QUIZ STEPS ---")
    cursor = db["quiz_steps"].find().sort("order", 1)
    async for s in cursor:
        print(f"Step: {s.get('question')}")
        for opt in s.get("options", []):
            print(f"  - {opt.get('label')} -> Tag: {opt.get('recommendedTag')}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(inspect_data())
