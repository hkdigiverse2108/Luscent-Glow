import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables from Backend/.env
load_dotenv(os.path.join(os.getcwd(), 'Backend', '.env'))

async def check_orders():
    mongodb_url = os.getenv("MONGODB_URL")
    database_name = os.getenv("DATABASE_NAME")
    
    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    
    count = await db["orders"].count_documents({})
    print(f"TOTAL_ORDERS: {count}")
    
    orders = await db["orders"].find().sort("createdAt", -1).limit(5).to_list(5)
    for i, o in enumerate(orders):
        order_num = o.get('orderNumber')
        total = o.get('totalAmount')
        mobile = o.get('userMobile')
        status = o.get('status')
        created = o.get('createdAt')
        print(f"ORDER_{i+1}: {order_num} | TOTAL: {total} | MOBILE: '{mobile}' | STATUS: {status} | CREATED: {created}")
            
    client.close()

if __name__ == "__main__":
    asyncio.run(check_orders())
