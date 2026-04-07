import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime

async def setup_test_data():
    load_dotenv('Backend/.env')
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DATABASE_NAME', 'luscent_glow_db')]
    
    legacy_id = "legacy-product-id"
    actual_name = "Velvet Matte Lipstick (Legacy)"
    
    # 1. Create a mock order to "link" this legacy ID to a name
    order = {
        "orderNumber": "LG-LEGACY-001",
        "userMobile": "919876543210",
        "items": [
            {
                "productId": legacy_id,
                "name": actual_name,
                "price": 899,
                "quantity": 1
            }
        ],
        "status": "Delivered",
        "createdAt": datetime.utcnow().isoformat() + "Z"
    }
    await db["orders"].insert_one(order)
    print(f"Mock order created to link '{legacy_id}' to '{actual_name}'")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(setup_test_data())
