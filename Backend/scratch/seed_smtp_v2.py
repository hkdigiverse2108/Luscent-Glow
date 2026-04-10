import asyncio
from Backend.app.database import get_database
from datetime import datetime

async def seed_credentials():
    print("Connecting to database...")
    db = await get_database()
    
    # 1. Update Payment/SMTP Credentials
    smtp_creds = {
        "smtpHost": "smtp.gmail.com",
        "smtpPort": 587,
        "smtpUser": "parthhkdigiverse@gmail.com",
        "smtpPassword": "tpng qqjk xsub qfav",
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    # We use the collection name mentioned in the routes/models
    # Previous code showed "payment_credentials" and "newsletter_settings"
    
    await db["payment_credentials"].find_one_and_update(
        {}, 
        {"$set": smtp_creds}, 
        upsert=True
    )
    print("✓ SMTP Authentication credentials (account) seeded in Database.")

    # 2. Update Newsletter Display Credentials (Sender Identity)
    newsletter_settings = {
        "fromEmail": "parthhkdigiverse@gmail.com",
        "fromName": "Luscent Glow",
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    await db["newsletter_settings"].find_one_and_update(
        {}, 
        {"$set": newsletter_settings}, 
        upsert=True
    )
    print("✓ Newsletter Sender Identity (From Address) seeded in Database.")

if __name__ == "__main__":
    asyncio.run(seed_credentials())
