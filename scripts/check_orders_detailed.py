import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys

# Define path to Backend for settings
sys.path.append(r"c:\Users\HP\Downloads\Lucsent_glow\Backend")
from app.config import settings

async def audit_order_data():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    print(f"--- Order Collection Audit ---")
    
    # 1. Get total orders
    total_orders = await db["orders"].count_documents({})
    print(f"Total Orders: {total_orders}")
    
    # 2. Inspect the last 10 orders
    latest_orders = await db["orders"].find({}).sort("createdAt", -1).limit(10).to_list(10)
    for order in latest_orders:
        print(f"\nOrder No: {order.get('orderNumber')}")
        print(f"  ID: {str(order.get('_id'))}")
        print(f"  Status: {order.get('status')}")
        print(f"  Payment: {order.get('paymentStatus')}")
        print(f"  Mobile: '{order.get('userMobile')}' (Type: {type(order.get('userMobile'))})")
        print(f"  Created: {order.get('createdAt')}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(audit_order_data())
