import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta

async def seed_gift_cards():
    client = AsyncIOMotorClient('mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0')
    db = client['luscent_glow_db']
    
    cards = [
        {
            "code": "LG-GIFT-GOLD-1000",
            "initialBalance": 1000.0,
            "currentBalance": 1000.0,
            "senderMobile": "ADMIN",
            "recipientName": "Aura Radiant",
            "recipientMobile": "9876543210",
            "message": "Step into the sanctuary of light.",
            "theme": "Gold Radiance",
            "isActive": True,
            "expiryDate": (datetime.utcnow() + timedelta(days=365)).isoformat(),
            "createdAt": datetime.utcnow().isoformat()
        },
        {
            "code": "LG-GIFT-SILK-2000",
            "initialBalance": 2000.0,
            "currentBalance": 1500.0,
            "senderMobile": "ADMIN",
            "recipientName": "Velvet Touch",
            "recipientMobile": "7693485303",
            "message": "May your radiance never fade.",
            "theme": "Midnight Silk",
            "isActive": True,
            "expiryDate": (datetime.utcnow() + timedelta(days=180)).isoformat(),
            "createdAt": datetime.utcnow().isoformat()
        }
    ]
    
    # Clear existing if any
    await db["gift_cards"].delete_many({})
    
    # Insert new
    result = await db["gift_cards"].insert_many(cards)
    print(f"Seeded {len(result.inserted_ids)} gift cards.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_gift_cards())
