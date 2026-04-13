from fastapi import APIRouter, Body, HTTPException, status
from fastapi.responses import Response
from typing import List, Optional
from bson import ObjectId
from ..models import CategoryModel, UpdateCategoryModel
from ..database import get_database

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_description="List all categories", response_model=List[CategoryModel])
async def list_categories(hide_empty: bool = False):
    db = await get_database()
    
    if hide_empty:
        # Get slugs of all categories that have at least one product
        active_category_slugs = await db["products"].distinct("category")
        categories = await db["categories"].find({"slug": {"$in": active_category_slugs}}).to_list(100)
    else:
        categories = await db["categories"].find().to_list(100)
        
    return categories

@router.post("/", response_description="Add new category", response_model=CategoryModel, status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryModel = Body(...)):
    db = await get_database()
    # Check if slug already exists
    if await db["categories"].find_one({"slug": category.slug}):
        raise HTTPException(status_code=400, detail="Category slug already exists")
    
    new_cat = await db["categories"].insert_one(category.model_dump(by_alias=True, exclude=["id"]))
    created_cat = await db["categories"].find_one({"_id": new_cat.inserted_id})
    return created_cat

@router.put("/{id}", response_description="Update a category", response_model=CategoryModel)
async def update_category(id: str, category: UpdateCategoryModel = Body(...)):
    db = await get_database()
    query = {"_id": id}
    try:
        if ObjectId.is_valid(id):
            query = {"$or": [{"_id": id}, {"_id": ObjectId(id)}]}
    except:
        pass

    item_data = {k: v for k, v in category.model_dump().items() if v is not None}
    if len(item_data) >= 1:
        update_result = await db["categories"].find_one_and_update(
            query, {"$set": item_data}, return_document=True
        )
        if update_result is not None:
            return update_result
            
    if (existing := await db["categories"].find_one(query)) is not None:
        return existing
    raise HTTPException(status_code=404, detail=f"Category {id} not found")

@router.delete("/{id}", response_description="Delete a category and its products")
async def delete_category(id: str):
    db = await get_database()
    query = {"_id": id}
    try:
        if ObjectId.is_valid(id):
            query = {"$or": [{"_id": id}, {"_id": ObjectId(id)}]}
    except:
        pass

    # Get category to find its slug before deletion
    category = await db["categories"].find_one(query)
    if not category:
        raise HTTPException(status_code=404, detail=f"Category {id} not found")
    
    slug = category.get("slug")
    
    # 1. Delete associated products (Cascade)
    await db["products"].delete_many({"category": slug})
    
    # 2. Delete the category itself
    delete_result = await db["categories"].delete_one(query)
    
    if delete_result.deleted_count == 1:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    
    raise HTTPException(status_code=404, detail=f"Category {id} not found")
