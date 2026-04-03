from fastapi import APIRouter, Body, HTTPException, status
from ..database import get_database
from datetime import datetime
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/newsletter", tags=["newsletter"])

class NewsletterSubscribe(BaseModel):
    email: EmailStr

@router.post("/subscribe")
async def subscribe_newsletter(data: NewsletterSubscribe):
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
    return {"message": "Welcome to the inner circle of radiance."}
