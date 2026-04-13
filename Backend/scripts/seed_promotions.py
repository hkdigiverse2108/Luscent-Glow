import asyncio
import sys
import os
from datetime import datetime, timezone, timedelta

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_database, connect_to_mongo

async def seed_promotions():
    await connect_to_mongo()
    db = await get_database()
    
    # Target banner data as seen in the image provided by user
    promos = [
        {
            "title": "Save 40% on All Essential Radiance.",
            "subtitle": "EXCLUSIVE INVITATION",
            "discountText": "40% OFF",
            "buttonText": "Retrieve Offer",
            "buttonLink": "/products",
            "image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&h=600&fit=crop",
            "endDate": (datetime.now(timezone.utc) + timedelta(days=3)).isoformat(),
            "isActive": True,
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db["promotions"].delete_many({})
    await db["promotions"].insert_many(promos)
    print("Homepage Promotion Library seeded with the requested banner style.")

if __name__ == "__main__":
    asyncio.run(seed_promotions())
