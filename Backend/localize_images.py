import os
import asyncio
import requests
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
from urllib.parse import urlparse

# Configure this to match your environment
MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "luscent_glow_db"
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

async def download_image(url):
    if not url or not url.startswith("http"):
        return url
        
    try:
        # Standardize filename
        parsed_url = urlparse(url)
        ext = os.path.splitext(parsed_url.path)[1]
        if not ext: ext = ".png"
        
        filename = f"migrated_{uuid.uuid4().hex[:10]}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        print(f"Downloading {url} -> {filename}")
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            with open(filepath, "wb") as f:
                f.write(response.content)
            return f"/uploads/{filename}"
        else:
            print(f"Failed to download {url}: Status {response.status_code}")
            return url
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return url

async def main():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    # 1. Localize Product Images
    print("\n--- Localizing Product Images ---")
    products = await db["products"].find({}).to_list(None)
    for product in products:
        old_url = product.get("image")
        if old_url and "http" in old_url and "/uploads/" not in old_url:
            new_path = await download_image(old_url)
            if new_path != old_url:
                await db["products"].update_one({"_id": product["_id"]}, {"$set": {"image": new_path}})
                print(f"Updated product {product.get('name')}")

    # 2. Localize User Profile Pictures
    print("\n--- Localizing User Profile Pictures ---")
    users = await db["users"].find({}).to_list(None)
    for user in users:
        old_url = user.get("profilePicture")
        if old_url and "http" in old_url and "/uploads/" not in old_url:
            new_path = await download_image(old_url)
            if new_path != old_url:
                await db["users"].update_one({"_id": user["_id"]}, {"$set": {"profilePicture": new_path}})
                print(f"Updated user {user.get('fullName')}")

    # 3. Localize Gift Cards
    print("\n--- Localizing Gift Card Images ---")
    gift_cards = await db["gift_cards"].find({}).to_list(None)
    for gc in gift_cards:
        old_url = gc.get("image")
        if old_url and "http" in old_url and "/uploads/" not in old_url:
            new_path = await download_image(old_url)
            if new_path != old_url:
                await db["gift_cards"].update_one({"_id": gc["_id"]}, {"$set": {"image": new_path}})
                print(f"Updated gift card {gc.get('code')}")

    print("\nMigration Complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
