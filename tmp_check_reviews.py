import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import json

async def check_reviews():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["luscent_glow_db"]
    reviews = await db["reviews"].find().to_list(100)
    for r in reviews:
        r["_id"] = str(r["_id"])
        if "productId" in r:
            r["productId"] = str(r["productId"])
    print(json.dumps(reviews, indent=2))

if __name__ == "__main__":
    asyncio.run(check_reviews())
