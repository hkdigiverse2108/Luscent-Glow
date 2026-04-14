from pymongo import MongoClient

def fix():
    client = MongoClient('mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0')
    db = client['luscent_glow_db']
    
    # Ensure both fields are set
    db.global_settings.update_one(
        {}, 
        {
            "$set": {
                "defaultShippingCharge": 100.0,
                "freeShippingThreshold": 999
            }
        }, 
        upsert=True
    )
    print("Settings synchronized: Fee ₹100, Free Ship at ₹999")

if __name__ == "__main__":
    fix()
