from fastapi import APIRouter, Body, HTTPException, status
from ..database import get_database
from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import List
from ..models import NewsletterSubModel

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
