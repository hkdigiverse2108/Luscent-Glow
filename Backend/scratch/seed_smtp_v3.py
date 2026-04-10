import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

async def seed_credentials():
    # Credentials from User
    host = "smtp.gmail.com"
    port = 587
    user = "parthhkdigiverse@gmail.com"
    password = "tpng qqjk xsub qfav"
    
    # DB URL from .env
    # MONGODB_URL=mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0
    # DATABASE_NAME=luscent_glow_db
    
    url = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
    db_name = "luscent_glow_db"
    
    print(f"Connecting to {db_name}...")
    client = AsyncIOMotorClient(url)
    db = client[db_name]

    # 1. Update Payment/SMTP Credentials
    smtp_creds = {
        "smtpHost": host,
        "smtpPort": port,
        "smtpUser": user,
        "smtpPassword": password,
        "updatedAt": "2026-04-10T10:49:00Z"
    }
    
    await db["payment_credentials"].update_one(
        {}, 
        {"$set": smtp_creds}, 
        upsert=True
    )
    print("✓ SMTP Authentication (Account) seeded.")

    # 2. Update Newsletter Display Settings
    newsletter_settings = {
        "fromEmail": user,
        "fromName": "Luscent Glow",
        "updatedAt": "2026-04-10T10:49:00Z"
    }
    
    await db["newsletter_settings"].update_one(
        {}, 
        {"$set": newsletter_settings}, 
        upsert=True
    )
    print("✓ Newsletter Sender Identity (From Name/Email) seeded.")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_credentials())
