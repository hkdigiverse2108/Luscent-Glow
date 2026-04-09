import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(dotenv_path="Backend/.env")
mongo_url = os.getenv("MONGODB_URL")

async def seed_bulk_order_settings():
    client = AsyncIOMotorClient(mongo_url)
    db = client['luscent_glow_db']
    
    settings = {
        "heroTitle": "Elevate Your Corporate Gifting.",
        "heroDescription": "Transform business relationships into lasting impressions with our bespoke curation service for events, employees, and executive partners.",
        "heroImage": "/assets/corporate-gifting.png",
        "heroBadge": "Corporate Concierge",
        "features": [
            {
                "icon": "Layers",
                "title": "Bespoke Curation",
                "desc": "Tailored product selections that align perfectly with your brand identity and event theme."
            },
            {
                "icon": "Truck",
                "title": "Priority Logistics",
                "desc": "White-glove delivery service with real-time tracking for large-scale domestic and global shipments."
            },
            {
                "icon": "ShieldCheck",
                "title": "Quality Assurance",
                "desc": "Every item undergoes rigorous luxury-standard inspection before being elegantly hand-packed."
            },
            {
                "icon": "Building2",
                "title": "Corporate Exclusive",
                "desc": "Access to tiered pricing structures and exclusive limited-edition collections for our partners."
            }
        ],
        "stats": [
            {"icon": "Users", "label": "1,200+ Global Partners"},
            {"icon": "Package", "label": "Bespoke Packaging"}
        ],
        "quantities": ["10-50", "50-100", "100-500", "500+"],
        "inquiryTitle": "The Inquiry Portal",
        "inquiryDescription": "Share your requirements and our dedicated account manager will reach out with a personalized catalog and tiered pricing dashboard within 2 hours.",
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    # We only ever want ONE settings document
    await db["bulk_order_settings"].delete_many({})
    result = await db["bulk_order_settings"].insert_one(settings)
    print(f"Seeded bulk order settings with ID: {result.inserted_id}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_bulk_order_settings())
