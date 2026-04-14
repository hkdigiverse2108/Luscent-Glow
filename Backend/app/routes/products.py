from fastapi import APIRouter, Body, HTTPException, status, Query
from fastapi.responses import Response
from typing import List, Optional
from bson import ObjectId
from ..models import ProductModel, UpdateProductModel
from ..database import get_database

router = APIRouter(prefix="/products", tags=["products"])

@router.post("/", response_description="Add new product", response_model=ProductModel, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductModel = Body(...)):
    db = await get_database()
    new_product = await db["products"].insert_one(product.model_dump(by_alias=True, exclude=["id"]))
    created_product = await db["products"].find_one({"_id": new_product.inserted_id})
    return created_product

@router.get("/", response_description="List all products", response_model=List[ProductModel])
async def list_products(category: Optional[str] = Query(None)):
    db = await get_database()
    query = {}
    if category:
        query["category"] = category
    products_list = await db["products"].find(query).to_list(1000)
    return products_list

@router.get("/recommend", response_description="Get ritual recommendations", response_model=List[ProductModel])
async def recommend_ritual(
    tags: Optional[str] = Query(None)
):
    """
    Dynamically recommends products based on a list of tags.
    """
    db = await get_database()
    query = {}
    
    if tags:
        # Split comma-separated tags and filter out empty strings
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]
        if tag_list:
            # Match products that have ANY of the selected ritual tags
            query["tags"] = {"$in": tag_list}
            
    products_list = await db["products"].find(query).to_list(3)
    
    # Fallback if no specific tags found
    if not products_list:
        products_list = await db["products"].find({}).to_list(3)
        
    return products_list

@router.get("/{id}", response_description="Get a single product", response_model=ProductModel)
async def show_product(id: str):
    db = await get_database()
    # Try querying as ObjectId first, then fallback to string
    query = {"_id": id}
    try:
        if ObjectId.is_valid(id):
            query = {"$or": [{"_id": id}, {"_id": ObjectId(id)}]}
    except:
        pass
        
    if (product := await db["products"].find_one(query)) is not None:
        return product
    raise HTTPException(status_code=404, detail=f"Product {id} not found")

@router.put("/{id}", response_description="Update a product", response_model=ProductModel)
async def update_product(id: str, product: UpdateProductModel = Body(...)):
    db = await get_database()
    query = {"_id": id}
    try:
        if ObjectId.is_valid(id):
            # Check which one exists
            if await db["products"].find_one({"_id": ObjectId(id)}):
                query = {"_id": ObjectId(id)}
    except:
        pass

    item_data = {k: v for k, v in product.model_dump().items() if v is not None}
    if len(item_data) >= 1:
        update_result = await db["products"].find_one_and_update(
            query, {"$set": item_data}, return_document=True
        )
        if update_result is not None:
            return update_result
    if (existing_product := await db["products"].find_one(query)) is not None:
        return existing_product
    raise HTTPException(status_code=404, detail=f"Product {id} not found")

@router.delete("/{id}", response_description="Delete a product")
async def delete_product(id: str):
    db = await get_database()
    query = {"_id": id}
    try:
        if ObjectId.is_valid(id):
            if await db["products"].find_one({"_id": ObjectId(id)}):
                query = {"_id": ObjectId(id)}
    except:
        pass

    delete_result = await db["products"].delete_one(query)
    if delete_result.deleted_count == 1:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    raise HTTPException(status_code=404, detail=f"Product {id} not found")
