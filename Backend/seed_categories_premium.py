import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB Connection Configuration
MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "luscent_glow_db"

# Premium Category Taxonomy from Design Prototype
CATEGORIES = [
    { 
        "name": "Makeup", 
        "slug": "makeup", 
        "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop" 
    },
    { 
        "name": "Skincare", 
        "slug": "skincare", 
        "image": "https://images.unsplash.com/photo-1570194065650-d99fb4ee7b5a?w=800&h=800&fit=crop" 
    },
    { 
        "name": "Hair Care", 
        "slug": "haircare", 
        "image": "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&h=800&fit=crop" 
    },
    { 
        "name": "Fragrances", 
        "slug": "fragrances", 
        "image": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop" 
    },
    { 
        "name": "Bath & Body", 
        "slug": "bath-body", 
        "image": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=800&fit=crop" 
    },
    { 
        "name": "Nails", 
        "slug": "nails", 
        "image": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=800&fit=crop" 
    }
]

async def seed_categories_premium():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    collection = db["categories"]

    print("--- ✦ Initiating Premium Category Synchronization ✦ ---")
    
    # Clear current fragments to ensure absolute synchronization with design
    print("Clearing temporary category fragments...")
    await collection.delete_many({})
    
    # Insert premium artifacts
    print(f"Manifesting {len(CATEGORIES)} premium category artifacts...")
    await collection.insert_many(CATEGORIES)

    print("--- ✦ Category Taxonomy Synchronized Successfully! ✦ ---")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_categories_premium())
