import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def seed_gift_card_settings():
    client = AsyncIOMotorClient('mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0')
    db = client['luscent_glow_db']
    
    settings = {
        "heroTitle": "Gift Radiance",
        "heroDescription": "Empower someone you love to choose their own ritual. A digital gateway to bespoke beauty and timeless elegance.",
        "heroImage": "/assets/gift-cards/hero.png",
        "themes": [
            { "id": "gold", "name": "Gold Radiance", "image": "/assets/gift-cards/gold.png", "color": "#D4AF37" },
            { "id": "rose", "name": "Rose Bloom", "image": "/assets/gift-cards/rose.png", "color": "#E09DA0" },
            { "id": "charcoal", "name": "Midnight Glow", "image": "/assets/gift-cards/charcoal.png", "color": "#1A1A1A" }
        ],
        "amounts": [1000, 2500, 5000, 10000],
        "features": [
            { "icon": "Send", "title": "Instant Delivery", "desc": "Tokens arrive in seconds." },
            { "icon": "CreditCard", "title": "Fully Secure", "desc": "Encoded for safety." },
            { "icon": "Sparkles", "title": "Any Ritual", "desc": "Redeemable sitewide." }
        ],
        "benefitsTitle": "Because Beauty is a Personal Choice.",
        "benefitsDescription": "Choosing the perfect skincare ritual for someone else can be challenging. Our digital gift cards bridge the gap between thoughtfulness and perfection, allowing your loved ones to curate their own path to radiance.",
        "benefitsList": [
            "No expiration for 12 months from purchase.",
            "Applicable on all collections including Limited Editions.",
            "Transferrable to any registered Luscent Glow account.",
            "Balance can be used across multiple purchases."
        ],
        "faqs": [
            { "q": "How will the recipient receive the card?", "a": "Instantly upon checkout, we will generate a secure unique code and send a beautiful digital certificate to the email address provided in the recipient field." },
            { "q": "Can I use multiple gift cards on one order?", "a": "Absolutely. At checkout, you can stack multiple gift codes to cover your ritual's total value." },
            { "q": "Does the gift card cover shipping fees?", "a": "Yes, the balance on a Luscent Glow gift card can be applied to the entire order total, including taxes and delivery charges." },
            { "q": "What happens if I lose my gift card email?", "a": "Do not worry. You can reach out to our Glow Concierge with your order ID, and we will resend the secure certificate to the original sender." }
        ],
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    # We only ever want ONE settings document
    await db["gift_card_settings"].delete_many({})
    result = await db["gift_card_settings"].insert_one(settings)
    print(f"Seeded gift card settings with ID: {result.inserted_id}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_gift_card_settings())
