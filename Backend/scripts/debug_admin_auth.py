import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys

# Add the parent directory to sys.path to import app.config
sys.path.append(os.getcwd())

from Backend.app.config import settings
from dotenv import load_dotenv

# Load from Backend/.env specifically
load_dotenv("Backend/.env")

async def debug_admin():
    uri = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
    client = AsyncIOMotorClient(uri)
    db = client["luscent_glow_db"]
    
    print("--- Debugging Admin Users ---")
    admins = await db["users"].find({"isAdmin": True}).to_list(10)
    for admin in admins:
        print(f"ID: {admin['_id']}")
        print(f"Name: {admin['fullName']}")
        print(f"Mobile: '{admin['mobileNumber']}'")
        print(f"Email: {admin['email']}")
        print(f"OTP: '{admin.get('otp')}'")
        print("-" * 30)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(debug_admin())
