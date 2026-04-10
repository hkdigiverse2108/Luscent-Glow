import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add the parent directory to sys.path to import local modules if needed
sys.path.append(os.path.join(os.getcwd(), 'Backend'))

async def seed_credentials():
    # MongoDB Connection
    MONGODB_URL = "mongodb://localhost:27017" # Standard default for this project
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client["luscent_glow"] # Project DB name

    # 1. Update Payment/SMTP Credentials
    smtp_creds = {
        "smtpHost": "smtp.gmail.com",
        "smtpPort": 587,
        "smtpUser": "parthhkdigiverse@gmail.com",
        "smtpPassword": "tpng qqjk xsub qfav",
        "updatedAt": "2026-04-10T10:49:00Z"
    }
    
    await db["payment_credentials"].update_one(
        {}, 
        {"$set": smtp_creds}, 
        upsert=True
    )
    print("✓ SMTP Authentication credentials seeded in Database.")

    # 2. Update Newsletter Display Credentials
    newsletter_settings = {
        "fromEmail": "parthhkdigiverse@gmail.com",
        "fromName": "Luscent Glow",
        "updatedAt": "2026-04-10T10:49:00Z"
    }
    
    await db["newsletter_settings"].update_one(
        {}, 
        {"$set": newsletter_settings}, 
        upsert=True
    )
    print("✓ Newsletter Sender Identity seeded in Database.")

if __name__ == "__main__":
    asyncio.run(seed_credentials())
