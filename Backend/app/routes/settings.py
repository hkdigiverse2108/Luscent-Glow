from fastapi import APIRouter, HTTPException, status
from ..database import get_database
from ..models import GlobalSettingsModel, PaymentCredentialsModel
from datetime import datetime
from ..config import settings as app_settings

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

def get_default_creds():
    """Helper to generate defaults from .env (via config.py) at runtime."""
    return {
        "activeGateway": "razorpay",
        "keyId": app_settings.RAZORPAY_KEY_ID,
        "keySecret": app_settings.RAZORPAY_KEY_SECRET,
        "mode": "sandbox",
        "cashfreeAppId": "",
        "cashfreeSecretKey": "",
        "cashfreeMode": "sandbox",
        "shiprocketEmail": app_settings.SHIPROCKET_EMAIL,
        "shiprocketPassword": app_settings.SHIPROCKET_PASSWORD,
        "smtpHost": app_settings.SMTP_HOST,
        "smtpPort": app_settings.SMTP_PORT,
        "smtpUser": app_settings.SMTP_USER,
        "smtpPassword": app_settings.SMTP_PASSWORD,
        "smtpFromEmail": app_settings.SMTP_FROM_EMAIL,
    }

async def get_payment_credentials() -> dict:
    """
    Shared helper used by payments.py to fetch live credentials from DB.
    Falls back to .env defaults if none are stored yet.
    """
    db = await get_database()
    creds = await db["payment_credentials"].find_one({})
    if not creds:
        return get_default_creds()
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
    return {"status": "reset", "message": "Payment credentials reset to .env defaults."}
