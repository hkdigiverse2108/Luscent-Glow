from fastapi import APIRouter, HTTPException, status
from ..database import get_database
from ..models import GlobalSettingsModel, PaymentCredentialsModel, ShiprocketCredentialsModel, SmtpCredentialsModel
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
            "copyrightText": "© 2026 Luscent Glow. All rights reserved.",
            "freeShippingThreshold": 999,
            "promoText": "Use Code",
            "promoCode": "GLOW15",
            "priceFilters": [
                { "label": "Under ₹500", "min": 0, "max": 500 },
                { "label": "₹500 – ₹1000", "min": 500, "max": 1000 },
                { "label": "₹1000 – ₹2000", "min": 1000, "max": 2000 },
                { "label": "Above ₹2000", "min": 2000, "max": 999999 }
            ],
            "updatedAt": datetime.utcnow().isoformat()
        }
    return settings

@router.put("/", response_description="Update global platform settings", response_model=GlobalSettingsModel)
async def update_global_settings(settings: GlobalSettingsModel):
    db = await get_database()
    
    # Use model_dump without excessive exclusions to ensure all model fields persist
    settings_dict = settings.model_dump(by_alias=True, exclude={"id"})
    settings_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    # Perform an atomic update/upsert on the single settings document
    result = await db["global_settings"].find_one_and_update(
        {}, 
        {"$set": settings_dict}, 
        upsert=True, 
        return_document=True
    )
    
    if not result:
        # Fallback if find_one_and_update fails to return the document
        return settings
        
    return result


# ─── Payment Credentials CRUD ───────────────────────────────────────────────

def get_default_payment_creds():
    """Helper to generate defaults from .env (via config.py) at runtime."""
    return {
        "activeGateway": "razorpay",
        "keyId": app_settings.RAZORPAY_KEY_ID,
        "keySecret": app_settings.RAZORPAY_KEY_SECRET,
        "mode": "sandbox",
        "cashfreeAppId": "",
        "cashfreeSecretKey": "",
        "cashfreeMode": "sandbox"
    }

async def get_payment_credentials() -> dict:
    """
    Shared helper used by payments.py to fetch live payment credentials from DB.
    """
    db = await get_database()
    creds = await db["payment_credentials"].find_one({})
    if not creds:
        return get_default_payment_creds()
    return creds

# ─── Shiprocket Credentials Helpers ──────────────────────────────────────────

def get_default_shiprocket_creds():
    return {
        "shiprocketEmail": app_settings.SHIPROCKET_EMAIL,
        "shiprocketPassword": app_settings.SHIPROCKET_PASSWORD,
        "shiprocketPickupLocation": "Primary"
    }

async def get_shiprocket_credentials() -> dict:
    db = await get_database()
    creds = await db["shiprocket_credentials"].find_one({})
    if not creds:
        return get_default_shiprocket_creds()
    return creds

# ─── SMTP Credentials Helpers ────────────────────────────────────────────────

def get_default_smtp_creds():
    return {
        "smtpHost": app_settings.SMTP_HOST,
        "smtpPort": app_settings.SMTP_PORT,
        "smtpUser": app_settings.SMTP_USER,
        "smtpPassword": app_settings.SMTP_PASSWORD,
        "smtpFromEmail": app_settings.SMTP_FROM_EMAIL
    }

async def get_smtp_credentials() -> dict:
    db = await get_database()
    creds = await db["smtp_credentials"].find_one({})
    if not creds:
        return get_default_smtp_creds()
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
    """Deletes existing payment credentials and re-seeds them from the .env baseline."""
    db = await get_database()
    defaults = get_default_payment_creds()
    defaults["updatedAt"] = datetime.utcnow().isoformat()
    
    await db["payment_credentials"].delete_many({}) # Clear existing
    result = await db["payment_credentials"].find_one_and_update(
        {}, 
        {"$set": defaults}, 
        upsert=True, 
        return_document=True
    )
    return {"status": "reset", "message": "Payment credentials re-seeded from .env baseline.", "data": result}

# ─── Shiprocket Routes ──────────────────────────────────────────────────────

@router.get("/shiprocket-credentials", response_description="Get Shiprocket credentials", response_model=ShiprocketCredentialsModel)
async def get_shiprocket_creds():
    return await get_shiprocket_credentials()

@router.put("/shiprocket-credentials", response_description="Update Shiprocket credentials", response_model=ShiprocketCredentialsModel)
async def update_shiprocket_creds(creds: ShiprocketCredentialsModel):
    db = await get_database()
    creds_dict = creds.model_dump(by_alias=True, exclude=["id"])
    creds_dict["updatedAt"] = datetime.utcnow().isoformat()
    result = await db["shiprocket_credentials"].find_one_and_update({}, {"$set": creds_dict}, upsert=True, return_document=True)
    return result

@router.delete("/shiprocket-credentials", response_description="Reset Shiprocket credentials to defaults")
async def reset_shiprocket_creds():
    db = await get_database()
    defaults = get_default_shiprocket_creds()
    defaults["updatedAt"] = datetime.utcnow().isoformat()
    
    await db["shiprocket_credentials"].delete_many({})
    result = await db["shiprocket_credentials"].find_one_and_update({}, {"$set": defaults}, upsert=True, return_document=True)
    return {"status": "reset", "message": "Shiprocket credentials re-seeded from .env baseline.", "data": result}

# ─── SMTP Routes ────────────────────────────────────────────────────────────

@router.get("/smtp-credentials", response_description="Get SMTP credentials", response_model=SmtpCredentialsModel)
async def get_smtp_creds():
    return await get_smtp_credentials()

@router.put("/smtp-credentials", response_description="Update SMTP credentials", response_model=SmtpCredentialsModel)
async def update_smtp_creds(creds: SmtpCredentialsModel):
    db = await get_database()
    creds_dict = creds.model_dump(by_alias=True, exclude=["id"])
    creds_dict["updatedAt"] = datetime.utcnow().isoformat()
    result = await db["smtp_credentials"].find_one_and_update({}, {"$set": creds_dict}, upsert=True, return_document=True)
    return result

@router.delete("/smtp-credentials", response_description="Reset SMTP credentials to defaults")
async def reset_smtp_creds():
    db = await get_database()
    defaults = get_default_smtp_creds()
    defaults["updatedAt"] = datetime.utcnow().isoformat()
    
    await db["smtp_credentials"].delete_many({})
    result = await db["smtp_credentials"].find_one_and_update({}, {"$set": defaults}, upsert=True, return_document=True)
    return {"status": "reset", "message": "SMTP credentials re-seeded from .env baseline.", "data": result}
