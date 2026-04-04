import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Import initial data to seed
CATEGORIES = [
    {"name": "Skincare", "slug": "skincare", "image": "skincare_thumb.jpg"},
    {"name": "Makeup", "slug": "makeup", "image": "makeup_thumb.jpg"},
    {"name": "Haircare", "slug": "haircare", "image": "haircare_thumb.jpg"},
    {"name": "Fragrances", "slug": "fragrances", "image": "fragrances_thumb.jpg"},
    {"name": "Bath & Body", "slug": "bath-body", "image": "bathbody_thumb.jpg"},
    {"name": "Nails", "slug": "nails", "image": "nails_thumb.jpg"},
]

BRANDING = {
    "type": "branding",
    "logoText": "Luscent Glow",
    "logoImage": None,
    "useImage": False,
    "updatedAt": str(datetime.now())
}

async def seed_data():
    # Use environment URL or fallback
    mongodb_url = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
    db_name = "luscent_glow_db"
    
    print(f"Connecting to database: {db_name}...")
    client = AsyncIOMotorClient(mongodb_url)
    db = client[db_name]

    # 1. Seed Branding
    print("Clearing and seeding branding identity...")
    await db["settings"].delete_many({"type": "branding"})
    await db["settings"].insert_one(BRANDING)

    # 2. Seed Categories
    print("Seeding category taxonomy...")
    # Get existing categories to avoid duplicates by slug
    existing_slugs = await db["categories"].distinct("slug")
    
    for cat in CATEGORIES:
        if cat["slug"] not in existing_slugs:
            await db["categories"].insert_one(cat)
            print(f"  + Added category: {cat['name']}")
        else:
            print(f"  - Category '{cat['name']}' already exists, skipping.")

    print("\n--- SEEDING COMPLETED ---")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
