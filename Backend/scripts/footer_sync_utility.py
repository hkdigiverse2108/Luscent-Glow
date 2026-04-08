import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Global Sanctuary Configuration
MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "luscent_glow_db"

async def sync_footer_registry():
    """
    Surgically removes retired 'Offers' and 'Special Offers' links from the global footer registry.
    Ensures the live interface is free of decommissioned anchors.
    """
    try:
        client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=10000)
        db = client[DATABASE_NAME]
        
        # 1. Fetch current footer
        footer = await db.footer.find_one({})
        if not footer:
            print("[SKIPPED] Footer registry not found in the live vault.")
            return

        # 2. Decommission Offers Links
        modified = False
        target_labels = ["Offers", "Special Offers", "Exclusive Offers"]
        
        if "columns" in footer:
            for column in footer["columns"]:
                initial_count = len(column.get("links", []))
                # Filter out decommissioned links
                column["links"] = [
                    link for link in column.get("links", []) 
                    if link.get("label") not in target_labels and link.get("path") != "/offers"
                ]
                if len(column["links"]) != initial_count:
                    modified = True
                    print(f"[CLEANUP] Removed {initial_count - len(column['links'])} retired anchors from column: {column.get('title')}")

        # 3. Commit Sanctuary Synchronization
        if modified:
            await db.footer.update_one({"_id": footer["_id"]}, {"$set": {"columns": footer["columns"]}})
            print("[SUCCESS] Live footer registry synchronized and retired anchors purged.")
        else:
            print("[CLEAN] Live footer registry is already free of 'Offers' anchors.")

    except Exception as e:
        print(f"[CRITICAL] Synchronization Failure: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(sync_footer_registry())
