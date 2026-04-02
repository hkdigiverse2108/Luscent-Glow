import asyncio
import os
import sys

# Add project root to sys.path for Backend imports
sys.path.append(os.getcwd())

from Backend.app.database import get_database

async def check_orders():
    try:
        db = await get_database()
        count = await db['orders'].count_documents({})
        print(f"Total orders in DB: {count}")
        
        orders = await db['orders'].find().sort("createdAt", -1).to_list(5)
        for i, o in enumerate(orders):
            print(f"Order {i+1}: {o.get('orderNumber')} | {o.get('totalAmount')} | User: {o.get('userMobile')}")
            # Check items
            items = o.get("items", [])
            print(f"  Items: {len(items)}")
            for item in items:
                print(f"    - {item.get('name')} | {item.get('price')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_orders())
