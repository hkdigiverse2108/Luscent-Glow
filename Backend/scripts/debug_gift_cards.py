import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import json

async def check_gift_card():
    client = AsyncIOMotorClient('mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0')
    db = client['luscent_glow_db']
    
    mobile = "9876543210"
    cards = await db["gift_cards"].find({"recipientMobile": mobile}).to_list(100)
    print(f"Cards found for {mobile}: {len(cards)}")
    for c in cards:
        # Print keys and values to check for hidden chars
        c['_id'] = str(c['_id'])
        print(json.dumps(c, indent=2))
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_gift_card())
