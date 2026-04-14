from pymongo import MongoClient

def sync():
    client = MongoClient('mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0')
    db = client['luscent_glow_db']
    
    # Final sync to match user requirements shown in screenshot
    db.global_settings.update_one(
        {}, 
        {
            "$set": {
                "defaultShippingCharge": 150.0,
                "freeShippingThreshold": 2000.0
            }
        }, 
        upsert=True
    )
    print("Global settings synced: Free Shipping at 2000, Fee 150")

if __name__ == "__main__":
    sync()
