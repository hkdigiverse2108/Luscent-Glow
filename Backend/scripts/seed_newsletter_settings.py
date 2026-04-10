import asyncio
from Backend.app.database import get_database
from Backend.app.config import settings as app_settings
from datetime import datetime

async def seed_settings():
    print("Connecting to database...")
    db = await get_database()
    
    # Check if settings already exist
    existing = await db["newsletter_settings"].find_one({})
    
    new_settings = {
        "fromName": app_settings.SMTP_FROM_NAME or "Luscent Glow",
        "fromEmail": app_settings.SMTP_FROM_EMAIL or "hello@luscentglow.com",
        "subject": "Your Invitation to Radiance",
        "headline": "The Ritual Begins",
        "body1": "We are honored to welcome you to the Luscent Glow sanctuary. You have entered a curated space where botanical alchemy meets modern science to unveil the authentic brilliance of your skin.",
        "body2": "As a cherished member of our inner circle, you will now receive priority access to our artisanal small-batch launches, intimate beauty philosophies, and exclusive invitations reserved for those who prioritize their glow.",
        "buttonText": "Begin Your Ritual",
        "quote": '"In the pursuit of light, we find our most authentic selves."',
        "smtpHost": app_settings.SMTP_HOST or "smtp.gmail.com",
        "smtpPort": int(app_settings.SMTP_PORT) if app_settings.SMTP_PORT else 587,
        "smtpUser": app_settings.SMTP_USER or "",
        "smtpPassword": app_settings.SMTP_PASSWORD or "",
        "updatedAt": datetime.utcnow().isoformat()
    }

    if existing:
        print("Settings document found. Updating with current .env values...")
        await db["newsletter_settings"].update_one({}, {"$set": new_settings})
    else:
        print("No settings found. Creating new document from .env values...")
        await db["newsletter_settings"].insert_one(new_settings)
        
    print("✓ Newsletter settings successfully synchronized with database.")

if __name__ == "__main__":
    asyncio.run(seed_settings())
