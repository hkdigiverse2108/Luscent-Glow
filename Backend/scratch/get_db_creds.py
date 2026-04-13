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
    url = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
    client = AsyncIOMotorClient(url)
    db = client['luscent_glow_db']
    creds = await db["shiprocket_credentials"].find_one({})
    if creds:
        with open("scratch/db_creds.json", "w") as f:
            json.dump(creds, f, cls=JSONEncoder, indent=2)
        print("Creds saved to scratch/db_creds.json")
    else:
        print("No creds found")
    client.close()

if __name__ == "__main__":
    asyncio.run(run())
