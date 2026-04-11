import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
from datetime import datetime, timedelta

# Extraction from environment context
MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "luscent_glow_db"

async def seed_coupons():
    """
    Seeds the MongoDB 'coupons' collection with high-potency promotional data.
    """
    print(f"[*] Connecting to database: {DATABASE_NAME}...")
    client = AsyncIOMotorClient(MONGODB_URL, tlsCAFile=certifi.where())
    db = client[DATABASE_NAME]
    
    coupons = [
        {
            "code": "GLOW20",
            "discountType": "percentage",
            "value": 20.0,
            "minPurchase": 0.0,
            "expiryDate": (datetime.utcnow() + timedelta(days=365)).isoformat(),
            "description": "20% Radiance on your entire ritual",
            "isActive": True,
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        },
        {
            "code": "FESTIVE15",
            "discountType": "percentage",
            "value": 15.0,
            "minPurchase": 500.0,
            "expiryDate": (datetime.utcnow() + timedelta(days=60)).isoformat(),
            "description": "15% Celebration for festive season",
            "isActive": True,
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        },
        {
            "code": "FREESHIP",
            "discountType": "shipping",
            "value": 0.0,
            "minPurchase": 1000.0,
            "expiryDate": (datetime.utcnow() + timedelta(days=730)).isoformat(),
            "description": "Free Logistics on orders above ₹1000",
            "isActive": True,
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        },
        {
            "code": "GLOWUP",
            "discountType": "fixed",
            "value": 500.0,
            "minPurchase": 2000.0,
            "expiryDate": (datetime.utcnow() + timedelta(days=365)).isoformat(),
            "description": "₹500 Ritual Offset on premium orders",
            "isActive": True,
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
    ]
    
    # Execute seeding with high-fidelity accuracy
    print("[*] Clearing existing coupons...")
    await db["coupons"].delete_many({})
    
    print("[*] Planting new coupon rituals...")
    result = await db["coupons"].insert_many(coupons)
    
    print(f"[+] Successfully seeded {len(result.inserted_ids)} coupons into database.")
    client.close()

if __name__ == "__main__":
    try:
        asyncio.run(seed_coupons())
    except Exception as e:
        print(f"[!] Migration Error: {e}")
