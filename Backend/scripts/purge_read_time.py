import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add the parent directory to sys.path to ensure we can load environment variables properly
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

async def purge_read_time():
    # Load environment variables from .env
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
        # Purge 'readTime' from 'blog_posts' collection
        print("Scrubbing 'readTime' field from all blog posts...")
        result = await db["blog_posts"].update_many(
            {}, 
            {"$unset": {"readTime": ""}}
        )
        print(f"Successfully processed {result.matched_count} stories.")
        print(f"Fields unset in {result.modified_count} documents.")
        
        # Double check if any remain
        remaining = await db["blog_posts"].count_documents({"readTime": {"$exists": True}})
        if remaining == 0:
            print("\nDatabase sanitization complete. No stories contain the 'readTime' field.")
        else:
            print(f"\nWarning: {remaining} stories still contain the 'readTime' field.")
            
    except Exception as e:
        print(f"An error occurred during database sanitization: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(purge_read_time())
