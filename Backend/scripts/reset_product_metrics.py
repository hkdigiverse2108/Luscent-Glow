import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add the parent directory to sys.path to import app modules if needed
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

async def reset_metrics():
    # Load environment variables
    load_dotenv()
    
    mongodb_url = os.getenv("MONGODB_URL")
    database_name = os.getenv("DATABASE_NAME", "luscent_glow_db")
    
    if not mongodb_url:
        print("Error: MONGODB_URL not found in environment variables.")
        return

    print(f"Connecting to MongoDB at {mongodb_url}...")
    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    
    try:
        # 1. Reset Product Metrics
        print("Resetting product ratings and review counts...")
        product_result = await db["products"].update_many(
            {}, 
            {"$set": {"rating": 0.0, "reviewCount": 0}}
        )
        print(f"Successfully updated {product_result.modified_count} products.")
        
        # 2. Clear Reviews Collection
        print("Clearing all records from the 'reviews' collection...")
        review_result = await db["reviews"].delete_many({})
        print(f"Successfully deleted {review_result.deleted_count} reviews.")
        
        print("\nDatabase reset complete. All products now have 0.0 rating and 0 reviews.")
        
    except Exception as e:
        print(f"An error occurred during the reset: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(reset_metrics())
