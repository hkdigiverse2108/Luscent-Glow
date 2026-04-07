import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime

async def verify_new_fields():
    load_dotenv('Backend/.env')
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db = client[os.getenv('DATABASE_NAME', 'luscent_glow_db')]
    
    # Simulate a new high-end review
    test_review = {
        "productId": "69d08aced8f14d4b220c4180",
        "userMobile": "9100000000",
        "userName": "Verification Test",
        "rating": 5,
        "comment": "Testing the new high-end UI fields!",
        "images": ["/uploads/test_v1.jpg", "/uploads/test_v2.jpg"],
        "selectedVariant": "Champagne Glow",
        "createdAt": datetime.utcnow().isoformat() + "Z"
    }
    
    result = await db["reviews"].insert_one(test_review)
    print(f"Test review inserted with ID: {result.inserted_id}")
    
    # Verify retrieval
    saved = await db["reviews"].find_one({"_id": result.inserted_id})
    print(f"Saved Images: {saved.get('images')}")
    print(f"Saved Variant: {saved.get('selectedVariant')}")
    
    # Cleanup
    await db["reviews"].delete_one({"_id": result.inserted_id})
    print("Test cleanup complete.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(verify_new_fields())
