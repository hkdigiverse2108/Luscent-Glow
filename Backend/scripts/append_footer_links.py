import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Sanctuary Configuration
MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "luscent_glow_db"

async def append_required_footer_links():
    """
    Appends 'Track Order' and 'Blogs' to the 'Information' column in the footer registry.
    Ensures the live interface aligns with the latest navigation requirements.
    """
    try:
        client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=10000)
        db = client[DATABASE_NAME]
        
        # 1. Fetch current footer
        footer = await db.footer.find_one({})
        if not footer:
            print("[SKIPPED] Footer registry not found in the vault.")
            return

        modified = False
        target_column_title = "Information"
        
        new_links = [
            {"label": "Track Order", "path": "/track-order"},
            {"label": "Blogs", "path": "/blogs"}
        ]
        
        if "columns" in footer:
            for column in footer["columns"]:
                if column.get("title") == target_column_title:
                    existing_labels = [link.get("label") for link in column.get("links", [])]
                    for nl in new_links:
                        if nl["label"] not in existing_labels:
                            column["links"].append(nl)
                            modified = True
                            print(f"[APPEND] Added '{nl['label']}' to '{target_column_title}' collection.")

        # 2. Commit Update
        if modified:
            await db.footer.update_one({"_id": footer["_id"]}, {"$set": {"columns": footer["columns"]}})
            print("[SUCCESS] Live footer synchronized with new navigation pathing.")
        else:
            print("[CLEAN] Footer already contains target links.")

    except Exception as e:
        print(f"[CRITICAL] Operational Failure: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(append_required_footer_links())
