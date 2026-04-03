import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Define MongoDB URL directly for a quick audit
MONGODB_URL = "mongodb://localhost:27017" # Standard default
DATABASE_NAME = "lucsent_glow" # Based on project name

async def audit_order_data():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print(f"--- Order Collection Audit ({DATABASE_NAME}) ---")
    
    # 1. Total Count
    total_orders = await db["orders"].count_documents({})
    print(f"Total Orders: {total_orders}")
    
    # 2. Inspect Sample Data
    latest_orders = await db["orders"].find({}).sort("createdAt", -1).limit(20).to_list(20)
    for order in latest_orders:
        print(f"\nOrder No: {order.get('orderNumber')}")
        print(f"  Mobile: '{order.get('userMobile')}'")
        print(f"  Status: {order.get('status')} (Payment: {order.get('paymentStatus')})")
        print(f"  CreatedAt: {order.get('createdAt')}")
        
    client.close()

if __name__ == "__main__":
    try:
        asyncio.run(audit_order_data())
    except Exception as e:
        print(f"Error: {e}")
