import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

async def seed_from_email():
    # Credentials from User
    user = "parthhkdigiverse@gmail.com"
    
    url = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
    db_name = "luscent_glow_db"
    
    print(f"Connecting to {db_name}...")
    client = AsyncIOMotorClient(url)
    db = client[db_name]

    # Update Payment/SMTP Credentials with smtpFromEmail
    await db["payment_credentials"].update_one(
        {}, 
        {"$set": {"smtpFromEmail": user}}, 
        upsert=True
    )
    print("SMTP From Email (Sender) seeded.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_from_email())
