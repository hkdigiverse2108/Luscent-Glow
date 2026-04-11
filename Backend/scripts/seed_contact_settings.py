import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(dotenv_path="Backend/.env")
mongo_url = os.getenv("MONGODB_URL")

async def seed_contact_settings():
    client = AsyncIOMotorClient(mongo_url)
    db = client['luscent_glow_db']
    
    settings = {
        "heroBadge": "Glow Support",
        "heroTitle": "Your Radiance, Our Priority.",
        "heroDescription": "Whether you seek personalized product curation or require immediate support, our artisan team is here to illuminate your journey.",
        "formTitle": "Initiate a Conversation",
        "formSubjects": [
            "Curation Advice",
            "Order Support",
            "Partnership Inquiry",
            "Press & Media",
            "General Exploration"
        ],
        "channels": [
            {"icon": "Phone", "badge": "Support Care", "value": "+91 97126 63607", "desc": "Available for one-on-one WhatsApp curation."},
            {"icon": "Mail", "badge": "Artisan Support", "value": "hello@luscentglow.com", "desc": "For deeper inquiries and shared visions."}
        ],
        "boutiqueImage": "/assets/contact/boutique-storefront.png",
        "faqTitle": "Seeking Instant Curation?",
        "faqSubtitle": "Most inquiries are illuminated in our FAQ registry.",
        "faqLinks": ["Shipping Registry", "Return Rituals", "Authenticity Seal"],
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    # We only ever want ONE settings document
    await db["contact_settings"].delete_many({})
    result = await db["contact_settings"].insert_one(settings)
    print(f"Seeded contact us settings with ID: {result.inserted_id}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_contact_settings())
