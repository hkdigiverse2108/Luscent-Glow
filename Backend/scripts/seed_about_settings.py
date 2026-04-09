import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(dotenv_path="Backend/.env")
mongo_url = os.getenv("MONGODB_URL")

async def seed_about_settings():
    client = AsyncIOMotorClient(mongo_url)
    db = client['luscent_glow_db']
    
    settings = {
        "heroImage": "/assets/about/hero-about.png",
        "heroBadge": "The Luscent Chronicle",
        "heroTitle": "Curating Radiance, Defying Convention.",
        "narrativeTitle": "Beauty is not a trend. It is a Quiet Revolution.",
        "narrativeParagraphs": [
            "Luscent Glow was born from a singular obsession: to bridge the gap between scientific precision and botanical poetry. We believe that skincare should not just be a routine, but a daily ritual of self-appreciation.",
            "Founded in 2024, we set out to eliminate the noise of the beauty industry. No fillers, no empty promises—just pure, high-performance formulations designed to reveal the luminous skin you already possess."
        ],
        "values": [
            {
                "icon": "Leaf",
                "title": "Botanical Excellence",
                "desc": "We source the rarest, most potent botanical extracts to ensure your skin receives nature's finest curation."
            },
            {
                "icon": "Heart",
                "title": "Cruelty-Free Ethics",
                "desc": "Beauty should never come at a cost to others. We are 100% vegan and strictly against animal testing."
            },
            {
                "icon": "Globe",
                "title": "Sustainable Glow",
                "desc": "Our packaging is designed with the earth in mind—recyclable glass and minimal plastic footprint."
            },
            {
                "icon": "Shield",
                "title": "Dermal Integrity",
                "desc": "Every formula is dermatologically tested to respect the natural barrier of your skin."
            }
        ],
        "interludeImage": "/assets/about/values-botanical.png",
        "interludeTitle": "98% Natural Origins",
        "interludeSubtitle": "CRAFTED IN SMALL BATCHES FOR UNCOMPROMISED POTENCY",
        "curatorImage": "/assets/about/curator-portrait.png",
        "curatorBadge": "Our Founder",
        "curatorTitle": "A Vision of Subtle Luxury.",
        "curatorQuote": "I wanted to create a space where beauty wasn't about concealment, but about enhancement. Luscent Glow is my love letter to skin that breathes, shines, and tells its own unique story.",
        "curatorName": "Janvi Vasani, Founder & Curator",
        "commitments": ["100% Vegan", "Paraben Free", "Cruelty Free", "Recyclable"],
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    # We only ever want ONE settings document
    await db["about_settings"].delete_many({})
    result = await db["about_settings"].insert_one(settings)
    print(f"Seeded about us settings with ID: {result.inserted_id}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_about_settings())
