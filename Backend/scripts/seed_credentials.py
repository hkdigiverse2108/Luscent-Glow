import asyncio
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Ensure .env is loaded before importing app settings
# Assuming script is in Backend/scripts and .env is in Backend/
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.database import get_database, connect_to_mongo
from app.config import settings as app_settings

async def seed_credentials():
    print("Initiating Credential Seeding Ritual...")
    await connect_to_mongo()
    db = await get_database()
    
    # 1. Payment Credentials
    payment_creds = {
        "activeGateway": "razorpay",
        "keyId": app_settings.RAZORPAY_KEY_ID,
        "keySecret": app_settings.RAZORPAY_KEY_SECRET,
        "mode": "sandbox",
        "cashfreeAppId": os.getenv("CASHFREE_APP_ID", ""),
        "cashfreeSecretKey": os.getenv("CASHFREE_SECRET_KEY", ""),
        "cashfreeMode": "sandbox",
        "updatedAt": datetime.utcnow().isoformat()
    }
    await db["payment_credentials"].update_one({}, {"$set": payment_creds}, upsert=True)
    print("Payment credentials persisted from .env")

    # 2. Shiprocket Credentials
    shiprocket_creds = {
        "shiprocketEmail": app_settings.SHIPROCKET_EMAIL,
        "shiprocketPassword": app_settings.SHIPROCKET_PASSWORD,
        "shiprocketPickupLocation": "Primary",
        "updatedAt": datetime.utcnow().isoformat()
    }
    await db["shiprocket_credentials"].update_one({}, {"$set": shiprocket_creds}, upsert=True)
    print("Shiprocket logistics credentials persisted from .env")

    # 3. SMTP Credentials
    smtp_creds = {
        "smtpHost": app_settings.SMTP_HOST,
        "smtpPort": app_settings.SMTP_PORT,
        "smtpUser": app_settings.SMTP_USER,
        "smtpPassword": app_settings.SMTP_PASSWORD,
        "smtpFromEmail": app_settings.SMTP_FROM_EMAIL,
        "updatedAt": datetime.utcnow().isoformat()
    }
    await db["smtp_credentials"].update_one({}, {"$set": smtp_creds}, upsert=True)
    print("SMTP communication credentials persisted from .env")

    print("\nCredential Seeding Ritual Complete.")

if __name__ == "__main__":
    asyncio.run(seed_credentials())
