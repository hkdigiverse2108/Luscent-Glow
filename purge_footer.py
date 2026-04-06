from pymongo import MongoClient
import os

def purge_footer():
    # Standard local Mongo connection string
    mongo_uri = "mongodb://localhost:27017" 
    client = MongoClient(mongo_uri)
    db = client["glow_haven"]
    
    print("[*] Initiating Registry Purge via Pymongo...")
    try:
        # Purge all footer documents to allow for a clean re-initialization
        result = db["footer"].delete_many({})
        print(f"[✔] Purge Complete. Removed {result.deleted_count} stale artifacts.")
        
        # Verify
        count = db["footer"].count_documents({})
        if count == 0:
            print("[✔] Sanctuary is now a clean state.")
        else:
            print("[!] ALERT: Sanctuary still contains data.")
            
    except Exception as e:
        print(f"[!] Critical Error during Purge: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    purge_footer()
