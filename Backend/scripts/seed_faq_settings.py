import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(dotenv_path="Backend/.env")
mongo_url = os.getenv("MONGODB_URL")

async def seed_faq_settings():
    client = AsyncIOMotorClient(mongo_url)
    db = client['luscent_glow_db']
    
    settings = {
        "heroBadge": "Support Services",
        "heroTitle": "How can we assist you?",
        "heroDescription": "Explore our curated guide to the most frequent inquiries regarding your journey to radiant skin.",
        "categories": [
            {
                "id": "cat1",
                "category": "General",
                "icon": "HelpCircle",
                "questions": [
                    {
                        "id": "g1",
                        "question": "What makes Luscent Glow unique?",
                        "answer": "Luscent Glow bridges the gap between scientific precision and botanical poetry. Our formulas are crafted in small batches using rare botanical extracts and dermatologically-tested active ingredients to ensure maximum potency and safety."
                    },
                    {
                        "id": "g2",
                        "question": "Are your products suitable for sensitive skin?",
                        "answer": "Yes, most of our products are formulated with dermal integrity in mind. However, we always recommend performing a patch test on a small area of skin before full application, or consulting with a dermatologist if you have specific concerns."
                    }
                ]
            },
            {
                "id": "cat2",
                "category": "Orders & Shipping",
                "icon": "Truck",
                "questions": [
                    {
                        "id": "s1",
                        "question": "How long does shipping take?",
                        "answer": "Standard shipping typically takes 3-5 business days. For our 'Glow Priority' members, we offer expedited 1-2 day delivery. You will receive a tracking number via email as soon as your order is dispatched."
                    },
                    {
                        "id": "s2",
                        "question": "Do you ship internationally?",
                        "answer": "Currently, we ship within the continental United States and select international locations. Please check our shipping calculator at checkout for specific availability and rates for your region."
                    }
                ]
            },
            {
                "id": "cat3",
                "category": "Products",
                "icon": "Package",
                "questions": [
                    {
                        "id": "p1",
                        "question": "Are your products vegan and cruelty-free?",
                        "answer": "Absolutely. We are committed to ethical beauty. 100% of our products are vegan and we never test on animals at any stage of product development."
                    },
                    {
                        "id": "p2",
                        "question": "How should I store my skincare products?",
                        "answer": "To maintain the integrity of our botanical extracts, store your products in a cool, dry place away from direct sunlight. Some users prefer refrigeration for our serums to enhance their soothing effect."
                    }
                ]
            },
            {
                "id": "cat4",
                "category": "Returns & Exchanges",
                "icon": "RefreshCcw",
                "questions": [
                    {
                        "id": "r1",
                        "question": "What is your return policy?",
                        "answer": "We offer a 30-day satisfaction guarantee. If you are not completely satisfied with your purchase, you may return it for a full refund or exchange. The product must be at least 50% full to be eligible."
                    },
                    {
                        "id": "r2",
                        "question": "How do I start a return?",
                        "answer": "Simply contact our 'Support Team' via the Contact page or email us at support@luscentglow.com with your order number, and we will guide you through the process."
                    }
                ]
            }
        ],
        "supportTitle": "Still have questions?",
        "supportDescription": "Our Support team is here to assist you with any personalized requests.",
        "supportButtonText": "Contact Support",
        "supportButtonLink": "/contact",
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    # We only ever want ONE settings document
    await db["faq_settings"].delete_many({})
    result = await db["faq_settings"].insert_one(settings)
    print(f"Seeded FAQ settings with ID: {result.inserted_id}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_faq_settings())
