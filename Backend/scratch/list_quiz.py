import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import json
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

async def run():
    load_dotenv('Backend/.env')
    uri = os.getenv('MONGODB_URL')
    db_name = os.getenv('DATABASE_NAME', 'luscent_glow_db')
    if not uri:
        print("Error: MONGODB_URL not found in environment")
        return
        
    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    
    # List Quiz Steps (specifically order 3)
    steps = await db.quiz_steps.find({"order": 3}).to_list(10)
    print("--- RITUAL STEP ---")
    print(json.dumps(steps, indent=2, cls=JSONEncoder))
    
    # List Products for context
    products = await db.products.find({}, {"name": 1, "category": 1, "tags": 1}).limit(20).to_list(20)
    print("\n--- SAMPLE PRODUCTS ---")
    print(json.dumps(products, indent=2, cls=JSONEncoder))

if __name__ == "__main__":
    asyncio.run(run())
