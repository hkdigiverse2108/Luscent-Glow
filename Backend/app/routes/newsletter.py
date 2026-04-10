from fastapi import APIRouter, Body, HTTPException, status, BackgroundTasks
from ..database import get_database
from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import List
from ..models import NewsletterSubModel
from ..utils.email_service import send_welcome_email

router = APIRouter(prefix="/newsletter", tags=["newsletter"])

class NewsletterSubscribe(BaseModel):
    email: EmailStr

@router.post("/subscribe")
async def subscribe_newsletter(data: NewsletterSubscribe, background_tasks: BackgroundTasks):
    db = await get_database()
    
    # Check if already exists
    existing = await db["newsletter_subs"].find_one({"email": data.email})
    if existing:
        return {"message": "You are already part of our inner circle."}
    
    new_sub = {
        "email": data.email,
        "subscribedAt": datetime.utcnow().isoformat()
    }
    
    await db["newsletter_subs"].insert_one(new_sub)
    
    # Send welcome email as a background task
    background_tasks.add_task(send_welcome_email, str(data.email))
    
    return {"message": "Welcome to the inner circle of radiance."}

@router.get("/", response_description="List all subscribers", response_model=List[NewsletterSubModel])
async def list_subscribers():
    db = await get_database()
    subs = await db["newsletter_subs"].find({}).to_list(1000)
    return subs

@router.delete("/{email}", response_description="Remove subscriber")
async def remove_subscriber(email: str):
    db = await get_database()
    delete_result = await db["newsletter_subs"].delete_one({"email": email})
    if delete_result.deleted_count == 1:
        return {"message": "Subscriber removed from repository."}
    raise HTTPException(status_code=404, detail="Subscriber not found.")

# ─── Newsletter Email Settings CRUD ──────────────────────────────────────────

from ..models import NewsletterEmailSettingsModel
from ..config import settings as app_settings

@router.get("/settings", response_description="Get newsletter email settings", response_model=NewsletterEmailSettingsModel)
async def get_newsletter_settings():
    db = await get_database()
    db_settings = await db["newsletter_settings"].find_one({}) or {}
    
    # Create the model with DB data, and manually fill gaps with .env config
    # This ensures that if the DB has partial data, we still show .env values for SMTP
    return {
        "fromName": db_settings.get("fromName") or app_settings.SMTP_FROM_NAME or "Luscent Glow",
        "fromEmail": db_settings.get("fromEmail") or app_settings.SMTP_FROM_EMAIL or "hello@luscentglow.com",
        "subject": db_settings.get("subject") or "Your Invitation to Radiance",
        "headline": db_settings.get("headline") or "The Ritual Begins",
        "body1": db_settings.get("body1") or "We are honored...",
        "body2": db_settings.get("body2") or "As a cherished member...",
        "buttonText": db_settings.get("buttonText") or "Begin Your Ritual",
        "quote": db_settings.get("quote") or "\"In the pursuit of light...\"",
        "smtpHost": db_settings.get("smtpHost") or app_settings.SMTP_HOST or "smtp.gmail.com",
        "smtpPort": db_settings.get("smtpPort") or app_settings.SMTP_PORT or 587,
        "smtpUser": db_settings.get("smtpUser") or app_settings.SMTP_USER or "",
        "smtpPassword": db_settings.get("smtpPassword") or app_settings.SMTP_PASSWORD or "",
        "updatedAt": db_settings.get("updatedAt") or datetime.utcnow().isoformat()
    }

from ..utils.env_utils import sync_to_env

@router.put("/settings", response_description="Update newsletter email settings", response_model=NewsletterEmailSettingsModel)
async def update_newsletter_settings(settings_data: NewsletterEmailSettingsModel):
    db = await get_database()
    
    settings_dict = settings_data.model_dump(by_alias=True, exclude=["id"])
    settings_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    result = await db["newsletter_settings"].find_one_and_update(
        {}, 
        {"$set": settings_dict}, 
        upsert=True, 
        return_document=True
    )
    
    # Synchronize to .env file for persistence across restarts/deployments
    sync_to_env(settings_dict)
    
    return result
