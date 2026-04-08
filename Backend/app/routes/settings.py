from fastapi import APIRouter, HTTPException, status
from ..database import get_database
from ..models import GlobalSettingsModel, PaymentCredentialsModel
from datetime import datetime

router = APIRouter(prefix="/settings/global", tags=["Global Settings"])

@router.get("/", response_description="Get global platform settings", response_model=GlobalSettingsModel)
async def get_global_settings():
    db = await get_database()
    settings = await db["global_settings"].find_one({})
    if not settings:
        # Fallback to hardcoded default if no settings exist in DB
        return {
            "whatsappNumber": "919537150942",
            "storeName": "Luscent Glow",
            "supportEmail": "hello@luscentglow.com",
            "supportPhone": "+91 97126 63607",
            "freeShippingThreshold": 999,
            "promoText": "Use Code",
            "promoCode": "GLOW15",
            "copyrightText": "© 2026 Luscent Glow. All rights reserved.",
            "updatedAt": datetime.utcnow().isoformat()
        }
    return settings

@router.put("/", response_description="Update global platform settings", response_model=GlobalSettingsModel)
async def update_global_settings(settings: GlobalSettingsModel):
    db = await get_database()
    
    settings_dict = settings.model_dump(by_alias=True, exclude=["id"])
    settings_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    result = await db["global_settings"].find_one_and_update(
        {}, 
        {"$set": settings_dict}, 
        upsert=True, 
        return_document=True
    )
    return result


# ─── Payment Credentials CRUD ───────────────────────────────────────────────

_DEFAULT_PAYMENT_CREDENTIALS = {
    "activeGateway": "razorpay",
    "keyId": "",
    "keySecret": "",
    "mode": "sandbox",
    "cashfreeAppId": "",
    "cashfreeSecretKey": "",
    "cashfreeMode": "sandbox",
}

async def get_payment_credentials() -> dict:
    """
    Shared helper used by payments.py to fetch live credentials from DB.
    Falls back to hardcoded sandbox defaults if none are stored yet.
    """
    db = await get_database()
    creds = await db["payment_credentials"].find_one({})
    if not creds:
        return _DEFAULT_PAYMENT_CREDENTIALS
    return creds

@router.get("/payment-credentials", response_description="Get payment gateway credentials", response_model=PaymentCredentialsModel)
async def get_payment_creds():
    creds = await get_payment_credentials()
    return creds

@router.put("/payment-credentials", response_description="Update payment gateway credentials", response_model=PaymentCredentialsModel)
async def update_payment_creds(creds: PaymentCredentialsModel):
    db = await get_database()
    creds_dict = creds.model_dump(by_alias=True, exclude=["id"])
    creds_dict["updatedAt"] = datetime.utcnow().isoformat()

    result = await db["payment_credentials"].find_one_and_update(
        {},
        {"$set": creds_dict},
        upsert=True,
        return_document=True
    )
    return result

@router.delete("/payment-credentials", response_description="Reset payment credentials to defaults")
async def reset_payment_creds():
    """Deletes the stored credentials document, reverting to hardcoded sandbox defaults."""
    db = await get_database()
    await db["payment_credentials"].delete_many({})
    return {"status": "reset", "message": "Payment credentials reset to sandbox defaults."}
