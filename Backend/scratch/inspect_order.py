import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

async def run():
    # Production MongoDB URL
    url = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
    client = AsyncIOMotorClient(url)
    db = client['luscent_glow_db']
    
    # Get the 3 most recent orders
    cursor = db['orders'].find().sort('createdAt', -1).limit(3)
    orders = await cursor.to_list(length=3)
    
    if orders:
        print(json.dumps(orders, cls=JSONEncoder, indent=2))
    else:
        print("No orders found in 'orders' collection.")
    client.close()

if __name__ == "__main__":
    asyncio.run(run())
