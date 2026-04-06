import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

# MongoDB Connection Configuration
MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "luscent_glow_db"

async def seed_home_settings():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    collection = db["home_settings"]

    # Original Static Data Artifacts
    home_settings = {
        "heroSlides": [
            {
                "image": "/assets/hero/hero-1.png",
                "title": "Radiance Reimagined",
                "subtitle": "Experience the pinnacle of luxury skincare with our gold-infused collection designed to illuminate your unique glow.",
                "cta": "Discover the Collection",
                "link": "/products"
            },
            {
                "image": "/assets/hero/hero-2.png",
                "title": "The Science of Glow",
                "subtitle": "Bespoke beauty ritual curated for your skin's unique journey to perfection. Sophistication in every drop.",
                "cta": "Explore Our Rituals",
                "link": "/products"
            },
            {
                "image": "/assets/hero/hero-3.png",
                "title": "Timeless Elegance",
                "subtitle": "Where science meets pure elegance. Discover our Silk Foundation range that feels like a second skin.",
                "cta": "Shop The Look",
                "link": "/products?category=makeup"
            }
        ],
        "trendingTitle": "Trending Essence",
        "trendingSubtitle": "Curated by our beauty experts, these are the formulas everyone is talking about this season.",
        "categoriesTitle": "Shop by Category",
        "newArrivalsTitle": "Spring Newcomers",
        "newArrivalsSubtitle": "Introducing the latest breakthrough formulas, curated specifically for the modern aesthetic.",
        "brandStory": {
            "badge": "Our Philosophy",
            "title": "The Alchemy of Radiance",
            "description": "We believe skincare is more than a routine; it is a sacred ritual. By merging ancient botanical wisdom with cutting-edge molecular science, we create formulas that don't just sit on the surface — they transform from within.",
            "image": "/assets/hero/brand-story.png",
            "buttonText": "Read Our Full Story",
            "buttonLink": "/about"
        },
        "discountBanner": {
            "image": "/assets/home/discount-banner.png",
            "title": "Save 40% on All Essential Radiance.",
            "subtitle": "Exclusive Invitation",
            "discountText": "40% OFF",
            "buttonText": "Retrieve Offer",
            "buttonLink": "/offers"
        },
        "instagram": {
            "profileHandle": "@hk_digiverse",
            "widgetId": "YOUR_LIGHTWIDGET_ID_HERE",
            "description": "Explore our latest innovations and milestones. Follow @hk_digiverse for daily tech inspiration."
        },
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }

    print("--- ✦ Initiating Homepage Synchronization Ritual ✦ ---")
    
    # Check if settings already exist
    existing = await collection.find_one({})
    if existing:
        print(f"Artifact detected. Synchronizing existing Home Registry...")
        await collection.replace_one({"_id": existing["_id"]}, home_settings)
    else:
        print("No artifact found. Manifesting new Homepage Registry...")
        await collection.insert_one(home_settings)

    print("--- ✦ Homepage Sanctuary Seeding Successful! ✦ ---")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_home_settings())
