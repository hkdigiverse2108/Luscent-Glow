from pymongo import MongoClient

def sync():
    client = MongoClient('mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0')
    db = client['luscent_glow_db']
    
    # Update the FREESHIP coupon to match the user's latest requirement
    db.coupons.update_one(
        {"code": "FREESHIP"},
        {
            "$set": {
                "value": 150.0,
                "minPurchase": 2000.0,
                "discountType": "shipping",
                "isActive": True
            }
        },
        upsert=True
    )
    print("Database Updated: FREESHIP coupon now has Value 150 and Min Purchase 2000.")

if __name__ == "__main__":
    sync()
