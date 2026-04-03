import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import json

# Define MongoDB URL and DATABASE Name manually to avoid package path issues
MONGODB_URL = "mongodb://localhost:27017" # Replace with your URL if different
DATABASE_NAME = "lucsent_glow"

async def check_db():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    # 1. Total Orders
    count = await db["orders"].count_documents({})
    print(f"Total Orders: {count}")
    
    # 2. Sample 3 Orders
    latest_orders = await db["orders"].find({}).sort("createdAt", -1).limit(3).to_list(3)
    for order in latest_orders:
        print(f"\nOrder: {order.get('orderNumber')}")
        print(f"  ID: {str(order.get('_id'))}")
        print(f"  Mobile: '{order.get('userMobile')}'")
        print(f"  Status: {order.get('status')}")
        print(f"  Items Count: {len(order.get('items', []))}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check_db())
