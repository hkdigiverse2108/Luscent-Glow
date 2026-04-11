import asyncio
import os
import sys
from datetime import datetime

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_database

async def migrate():
    print("Starting Credentials Segregation Migration...")
    from app.database import connect_to_mongo, close_mongo_connection
    await connect_to_mongo()
    db = await get_database()
    
    # 1. Fetch current payment credentials
    creds = await db["payment_credentials"].find_one({})
    if not creds:
        print("No payment credentials found in DB. Nothing to migrate.")
        return

    print(f"Found credentials document: {creds.get('_id')}")
    
    # 2. Extract Shiprocket Settings
    shiprocket_fields = ["shiprocketEmail", "shiprocketPassword", "shiprocketPickupLocation"]
    shiprocket_creds = {k: creds[k] for k in shiprocket_fields if k in creds}
    
    if shiprocket_creds:
        print(f"Migrating Shiprocket credentials: {list(shiprocket_creds.keys())}")
        shiprocket_creds["updatedAt"] = datetime.utcnow().isoformat()
        await db["shiprocket_credentials"].update_one(
            {}, 
            {"$set": shiprocket_creds}, 
            upsert=True
        )
    else:
        print("No Shiprocket fields found in payment_credentials.")

    # 3. Extract SMTP Settings
    smtp_fields = ["smtpHost", "smtpPort", "smtpUser", "smtpPassword", "smtpFromEmail"]
    smtp_creds = {k: creds[k] for k in smtp_fields if k in creds}
    
    if smtp_creds:
        print(f"Migrating SMTP credentials: {list(smtp_creds.keys())}")
        smtp_creds["updatedAt"] = datetime.utcnow().isoformat()
        await db["smtp_credentials"].update_one(
            {}, 
            {"$set": smtp_creds}, 
            upsert=True
        )
    else:
        print("No SMTP fields found in payment_credentials.")

    # 4. Cleanup payment_credentials
    # We keep only payment-related fields
    payment_keep_fields = [
        "_id", "activeGateway", 
        "keyId", "keySecret", "mode", 
        "cashfreeAppId", "cashfreeSecretKey", "cashfreeMode",
        "updatedAt"
    ]
    
    fields_to_remove = []
    for key in list(creds.keys()):
        if key not in payment_keep_fields:
            fields_to_remove.append(key)
    
    if fields_to_remove:
        print(f"Removing non-payment fields from payment_credentials: {fields_to_remove}")
        unset_query = {field: "" for field in fields_to_remove}
        await db["payment_credentials"].update_one(
            {"_id": creds["_id"]},
            {"$unset": unset_query}
        )
    else:
        print("No fields to remove from payment_credentials.")

    print("Migration Completed Successfully.")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(migrate())
