import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys

# Define path to Backend for settings
sys.path.append(r"c:\Users\HP\Downloads\Lucsent_glow\Backend")
from app.config import settings

async def find_user_orders(target_mobile):
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    print(f"--- Searching for orders matching: {target_mobile} ---")
    
    # 1. Direct query
    orders = await db["orders"].find({"userMobile": target_mobile}).to_list(100)
    print(f"Direct match count: {len(orders)}")
    for o in orders:
        print(f"  - Order: {o.get('orderNumber')} | ID: {str(o.get('_id'))} | Status: {o.get('status')}")
        
    # 2. Check for other formats (like numbers instead of strings)
    try:
        numeric_mobile = int(target_mobile)
        numeric_orders = await db["orders"].find({"userMobile": numeric_mobile}).to_list(100)
        print(f"Numerical match count: {len(numeric_orders)}")
    except:
        pass
        
    # 3. Check for any orders at all
    total = await db["orders"].count_documents({})
    print(f"Total orders in DB: {total}")
    
    client.close()

if __name__ == "__main__":
    mobile = "82005498988"
    if len(sys.argv) > 1:
        mobile = sys.argv[1]
    asyncio.run(find_user_orders(mobile))
