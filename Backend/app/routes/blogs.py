from fastapi import APIRouter, HTTPException, status, Body
from ..database import get_database
from ..models import BlogPostModel, BlogSettingsModel, EditorialVoiceModel
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

router = APIRouter(prefix="/blogs", tags=["Blogs"])

# --- Blog Settings Endpoints ---

@router.get("/settings/", response_description="Get blog page settings", response_model=BlogSettingsModel)
async def get_blog_settings():
    db = await get_database()
    settings = await db["blog_settings"].find_one({})
    if not settings:
        return {
            "heroBadge": "The Journal",
            "heroTitle": "Glow Haven Chronicles",
            "finaleTitle": "Stay Inspired",
            "finaleSubtitle": "Ritual of Radiance",
            "seo": {
                "title": "The Journal | Luscent Glow",
                "description": "Explore the chronicles of botanical radiance and modern alchemy.",
                "keywords": "skincare blog, beauty rituals, organic ingredients"
            },
            "updatedAt": datetime.utcnow().isoformat()
        }
    return settings

@router.put("/settings/", response_description="Update blog page settings", response_model=BlogSettingsModel)
async def update_blog_settings(settings: BlogSettingsModel):
    db = await get_database()
    settings_dict = settings.model_dump(by_alias=True, exclude=["id"])
    settings_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    result = await db["blog_settings"].find_one_and_update(
        {}, 
        {"$set": settings_dict}, 
        upsert=True, 
        return_document=True
    )
    return result

# --- Editorial Voice Endpoints ---

@router.get("/editorial-voices/", response_description="List all editorial voices", response_model=List[EditorialVoiceModel])
async def list_editorial_voices():
    db = await get_database()
    voices = await db["editorial_voices"].find().to_list(100)
    
    # Data migration fallback: convert 'quote' to 'insights' if 'insights' is missing
    for voice in voices:
        if "insights" not in voice and "quote" in voice:
            voice["insights"] = voice.pop("quote")
            
    return voices

@router.post("/editorial-voices/", response_description="Create a new editorial voice", response_model=EditorialVoiceModel)
async def create_editorial_voice(voice: EditorialVoiceModel):
    db = await get_database()
    voice_dict = voice.model_dump(by_alias=True, exclude=["id"])
    voice_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    # If this is active, deactivate others
    if voice_dict.get("isActive"):
        await db["editorial_voices"].update_many({"isActive": True}, {"$set": {"isActive": False}})
        
    new_voice = await db["editorial_voices"].insert_one(voice_dict)
    created_voice = await db["editorial_voices"].find_one({"_id": new_voice.inserted_id})
    return created_voice

@router.put("/editorial-voices/{id}/", response_description="Update an editorial voice", response_model=EditorialVoiceModel)
async def update_editorial_voice(id: str, voice: EditorialVoiceModel):
    db = await get_database()
    voice_dict = voice.model_dump(by_alias=True, exclude=["id"])
    voice_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    # If setting to active, deactivate others
    if voice_dict.get("isActive"):
        await db["editorial_voices"].update_many({"_id": {"$ne": ObjectId(id) if ObjectId.is_valid(id) else id}, "isActive": True}, {"$set": {"isActive": False}})
        
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"id": id}
    
    result = await db["editorial_voices"].find_one_and_update(
        query, 
        {"$set": voice_dict}, 
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail=f"Voice with ID {id} not found")
    return result

@router.delete("/editorial-voices/{id}/", response_description="Delete an editorial voice")
async def delete_editorial_voice(id: str):
    db = await get_database()
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"id": id}
    
    delete_result = await db["editorial_voices"].delete_one(query)
    if delete_result.deleted_count == 1:
        return {"message": "Editorial voice removed from journal"}
    
    raise HTTPException(status_code=404, detail=f"Voice with ID {id} not found")

# --- Blog Post Endpoints ---

@router.get("/", response_description="List all blog posts", response_model=List[BlogPostModel])
async def list_blog_posts():
    db = await get_database()
    # Sort by featured first, then by date (descending)
    posts = await db["blog_posts"].find().sort([("featured", -1), ("date", -1)]).to_list(1000)
    return posts

@router.get("/{id}/", response_description="Get a single blog post", response_model=BlogPostModel)
async def get_blog_post(id: str):
    db = await get_database()
    if not ObjectId.is_valid(id):
        # Fallback to search by title/slug/id if needed, but for now assuming MongoDB ID
        post = await db["blog_posts"].find_one({"_id": id}) # for seeded IDs which might be strings
    else:
        post = await db["blog_posts"].find_one({"_id": ObjectId(id)})
    
    if not post:
        # Search by id as string for consistency with seeded data
        post = await db["blog_posts"].find_one({"id": id})
        
    if not post:
        raise HTTPException(status_code=404, detail=f"Story with ID {id} not found")
    return post

@router.post("/", response_description="Create a new blog post", response_model=BlogPostModel)
async def create_blog_post(post: BlogPostModel):
    db = await get_database()
    post_dict = post.model_dump(by_alias=True, exclude=["id"])
    post_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    # If this is featured, un-feature others (optional, or just allow multiple)
    if post_dict.get("featured"):
        await db["blog_posts"].update_many({"featured": True}, {"$set": {"featured": False}})

    new_post = await db["blog_posts"].insert_one(post_dict)
    created_post = await db["blog_posts"].find_one({"_id": new_post.inserted_id})
    return created_post

@router.put("/{id}/", response_description="Update a blog post", response_model=BlogPostModel)
async def update_blog_post(id: str, post: BlogPostModel):
    db = await get_database()
    post_dict = post.model_dump(by_alias=True, exclude=["id"])
    post_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    if post_dict.get("featured"):
        await db["blog_posts"].update_many({"_id": {"$ne": ObjectId(id) if ObjectId.is_valid(id) else id}, "featured": True}, {"$set": {"featured": False}})

    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"id": id}
    
    result = await db["blog_posts"].find_one_and_update(
        query, 
        {"$set": post_dict}, 
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail=f"Story with ID {id} not found")
    return result

@router.delete("/{id}/", response_description="Delete a blog post")
async def delete_blog_post(id: str):
    db = await get_database()
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"id": id}
    
    delete_result = await db["blog_posts"].delete_one(query)
    if delete_result.deleted_count == 1:
        return {"message": "Story deleted from chronicles"}
    
    raise HTTPException(status_code=404, detail=f"Story with ID {id} not found")
