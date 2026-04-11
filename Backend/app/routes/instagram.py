from fastapi import APIRouter, HTTPException, Body, status
from typing import List
from ..database import get_database
from ..models import InstagramPostModel, UpdateInstagramPostModel
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/instagram", tags=["Instagram Gallery"])

@router.get("/", response_description="List all active Instagram posts", response_model=List[InstagramPostModel])
async def list_instagram_posts():
    db = await get_database()
    # Fetch active posts sorted by order
    posts = await db["instagram_posts"].find({"isActive": True}).sort("order", 1).to_list(100)
    return posts

@router.get("/admin/", response_description="List all Instagram posts for management", response_model=List[InstagramPostModel])
async def list_all_instagram_posts():
    db = await get_database()
    # Fetch all posts for admin management
    posts = await db["instagram_posts"].find().sort("order", 1).to_list(500)
    return posts

@router.post("/", response_description="Add new Instagram post", response_model=InstagramPostModel, status_code=status.HTTP_201_CREATED)
async def create_instagram_post(post: InstagramPostModel = Body(...)):
    db = await get_database()
    post_dict = post.model_dump(by_alias=True, exclude=["id"])
    post_dict["createdAt"] = datetime.utcnow().isoformat() + "Z"
    
    new_post = await db["instagram_posts"].insert_one(post_dict)
    created_post = await db["instagram_posts"].find_one({"_id": new_post.inserted_id})
    return created_post

@router.put("/{id}/", response_description="Update an Instagram post", response_model=InstagramPostModel)
async def update_instagram_post(id: str, post: UpdateInstagramPostModel = Body(...)):
    db = await get_database()
    update_data = {k: v for k, v in post.model_dump().items() if v is not None}
    
    if len(update_data) >= 1:
        update_result = await db["instagram_posts"].update_one(
            {"_id": ObjectId(id)}, {"$set": update_data}
        )
        
        if update_result.modified_count == 1:
            updated_post = await db["instagram_posts"].find_one({"_id": ObjectId(id)})
            if updated_post:
                return updated_post

    if (existing_post := await db["instagram_posts"].find_one({"_id": ObjectId(id)})) is not None:
        return existing_post

    raise HTTPException(status_code=404, detail=f"Instagram post {id} not found")

@router.delete("/{id}/", response_description="Delete an Instagram post")
async def delete_instagram_post(id: str):
    db = await get_database()
    delete_result = await db["instagram_posts"].delete_one({"_id": ObjectId(id)})

    if delete_result.deleted_count == 1:
        return {"message": "Post deleted successfully"}

    raise HTTPException(status_code=404, detail=f"Instagram post {id} not found")
