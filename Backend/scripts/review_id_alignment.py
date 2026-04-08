import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# Global Data Sanctuary Configuration
MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "luscent_glow_db"

async def align_review_data():
    """
    Surgically aligns orphaned review chronicles with their verified product identities.
    Restores missing metadata to legacy records to ensure consistent platform visibility.
    """
    try:
        client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=10000)
        db = client[DATABASE_NAME]
        
        # 1. Target Identity: Hydra Glow Serum
        identity_name = "Hydra Glow Serum"
        technical_id = "69d08aced8f14d4b220c4181"
        
        # 2. Align Legacy User Chronicles
        # Context: Previous migration left some records with 'legacy-product-id' or missing names
        result = await db.reviews.update_many(
            {
                "productId": "legacy-product-id"
            },
            {
                "$set": {
                    "productName": identity_name,
                    "productId": technical_id
                }
            }
        )
        print(f"[RECOVERY] Legacy review chronicles aligned: {result.modified_count}")
        
        # 3. Synchronize Partial Identities
        # Ensure all reviews matching the product name are linked to the verified Technical ID
        count_sync = await db.reviews.update_many(
            {"productName": identity_name, "productId": {"$ne": technical_id}},
            {"$set": {"productId": technical_id}}
        )
        print(f"[SYNC] Partial identities synchronized: {count_sync.modified_count}")

    except Exception as e:
        print(f"[CRITICAL] Alignment failure: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(align_review_data())
