import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime

# Mimic the backend's database connection
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "luscent_glow_db"

async def seed_payment_credentials():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    collection = db["payment_credentials"]

    # Basic default credentials for seeding
    # NOTE: Actual keys should be replaced by the user in the Admin Panel
    creds = {
        "activeGateway": "razorpay",
        "keyId": "rzp_test_placeholderID",
        "keySecret": "placeholderSecret",
        "mode": "sandbox",
        "cashfreeAppId": "TEST_CASHFREE_ID",
        "cashfreeSecretKey": "TEST_CASHFREE_SECRET",
        "cashfreeMode": "sandbox",
        "shiprocketEmail": "hello@luscentglow.com",
        "shiprocketPassword": "password123",
        "shiprocketPickupLocation": "Primary",
        "smtpHost": "smtp.gmail.com",
        "smtpPort": 587,
        "smtpUser": "hello@luscentglow.com",
        "smtpPassword": "password123",
        "smtpFromEmail": "hello@luscentglow.com",
        "updatedAt": datetime.utcnow().isoformat()
    }

    # Upsert the settings
    await collection.find_one_and_update(
        {},
        {"$set": creds},
        upsert=True
    )
    
    print("Successfully seeded payment credentials in the database.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_payment_credentials())
