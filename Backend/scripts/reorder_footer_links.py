import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Sanctuary Configuration
MONGODB_URL = "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "luscent_glow_db"

async def reorder_footer_links():
    """
    Ensures a consistent and professional order for the Information column links.
    """
    try:
        client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=10000)
        db = client[DATABASE_NAME]
        
        # 1. Fetch current footer
        footer = await db.footer.find_one({})
        if not footer:
            print("[SKIPPED] Footer registry not found.")
            return

        modified = False
        target_column_title = "Information"
        desired_order = ["About Us", "Contact Us", "Track Order", "Blogs", "FAQ's"]
        
        if "columns" in footer:
            for column in footer["columns"]:
                if column.get("title") == target_column_title:
                    current_links = column.get("links", [])
                    # Map labels to their objects
                    link_map = {l["label"]: l for l in current_links}
                    
                    # Construct new links list based on desired order
                    new_links = []
                    for label in desired_order:
                        if label in link_map:
                            new_links.append(link_map[label])
                    
                    # Add any links that weren't in our desired_order but were there
                    for l in current_links:
                        if l["label"] not in desired_order:
                            new_links.append(l)
                    
                    if [l["label"] for l in current_links] != [l["label"] for l in new_links]:
                        column["links"] = new_links
                        modified = True
                        print(f"[REORDER] Perfected the navigation hierarchy for '{target_column_title}'.")

        # 2. Commit Update
        if modified:
            await db.footer.update_one({"_id": footer["_id"]}, {"$set": {"columns": footer["columns"]}})
            print("[SUCCESS] Live footer registry re-ordered and synchronized.")
        else:
            print("[CLEAN] Footer order is already optimal.")

    except Exception as e:
        print(f"[CRITICAL] Operational Failure: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(reorder_footer_links())
