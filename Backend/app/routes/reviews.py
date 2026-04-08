from fastapi import APIRouter, Body, HTTPException, status, Response
from typing import List, Optional
from ..models import ReviewModel
from ..database import get_database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/reviews", tags=["reviews"])

async def sync_product_stats(product_id: str):
    """
    Recalculates rating and reviewCount for a product using aggressive matching.
    """
    db = await get_database()
    
    # 1. Identify all possible product identifiers
    product_query = {"_id": product_id}
    try:
        if ObjectId.is_valid(product_id):
            product_query = {"$or": [{"_id": product_id}, {"_id": ObjectId(product_id)}]}
    except:
        pass
        
    product = await db["products"].find_one(product_query)
    if not product:
        return None
        
    actual_id = product.get("_id")
    product_name = product.get("name")
    
    # 2. Find ALL reviews matching any of the product's identities
    query_ids = [str(actual_id), str(product_id)]
    if isinstance(actual_id, ObjectId):
        query_ids.append(actual_id)
    try:
        if ObjectId.is_valid(product_id):
            query_ids.append(ObjectId(product_id))
    except:
        pass
        
    all_reviews = await db["reviews"].find({
        "$or": [
            {"productId": {"$in": query_ids}},
            {"productId": product_name},
            {"productName": product_name} # Secondary check
        ]
    }).to_list(1000)
    
    # 3. Calculate stats
    count = len(all_reviews)
    total_rating = sum(r.get("rating", 0) for r in all_reviews)
    avg_rating = round(total_rating / count, 1) if count > 0 else 0
    
    # 4. Update the technical product record
    await db["products"].update_one(
        {"_id": actual_id},
        {"$set": {"rating": avg_rating, "reviewCount": count}}
    )
    
    return {"rating": avg_rating, "count": count}

@router.post("/", response_description="Submit a new review", response_model=ReviewModel)
async def create_review(review: ReviewModel = Body(...)):
    db = await get_database()
    
    # 1. Insert the review
    review_data = review.model_dump(by_alias=True, exclude=["id"])
    if not review_data.get("createdAt"):
        review_data["createdAt"] = datetime.utcnow().isoformat()
        
    result = await db["reviews"].insert_one(review_data)
    created_review = await db["reviews"].find_one({"_id": result.inserted_id})
    
    # 2. Perform Universal Stat Sync
    await sync_product_stats(review.productId)
    
    return created_review

@router.get("/", response_description="List all reviews", response_model=List[dict])
async def list_all_reviews():
    db = await get_database()
    reviews = await db["reviews"].find().sort("createdAt", -1).to_list(1000)
    
    # Enrich reviews with product names
    enriched_reviews = []
    for r in reviews:
        # Convert _id to id if necessary for frontend
        if "_id" in r:
            r["id"] = str(r["_id"])
            del r["_id"] # Remove _id to prevent serialization issues
            
        p_id = r.get("productId")
        if p_id:
            try:
                if ObjectId.is_valid(p_id):
                    p_query = {"$or": [{"_id": p_id}, {"_id": ObjectId(p_id)}]}
                else:
                    p_query = {"_id": p_id}
                
                # 1. First try Products collection
                product = await db["products"].find_one(p_query, {"name": 1})
                if product:
                    r["productName"] = product.get("name")
                else:
                    # 2. Fallback: Search Orders collection for this productId to recover the name
                    order_match = await db["orders"].find_one(
                        {"items.productId": p_id}, 
                        {"items.$": 1}
                    )
                    if order_match and "items" in order_match:
                        r["productName"] = order_match["items"][0].get("name", "Unknown Product")
                    else:
                        r["productName"] = "Unknown Product"
            except Exception:
                r["productName"] = "Unknown Product"
        else:
            r["productName"] = "Unknown Product"
            
        enriched_reviews.append(r)
        
    return enriched_reviews

@router.delete("/{id}", response_description="Delete a review")
async def delete_review(id: str):
    db = await get_database()
    
    # Try finding the review to update product stats after deletion
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    review = await db["reviews"].find_one(query)
    
    if not review:
        raise HTTPException(status_code=404, detail=f"Review {id} not found")
        
    p_id = review.get("productId")
    
    delete_result = await db["reviews"].delete_one(query)
    
    if delete_result.deleted_count == 1:
        # Recalculate product rating and count using Universal Sync
        if p_id:
            await sync_product_stats(p_id)
            
        return Response(status_code=status.HTTP_204_NO_CONTENT)
        
    raise HTTPException(status_code=404, detail=f"Review {id} not found")

@router.get("/product/{productId}", response_description="Get reviews for a product", response_model=List[ReviewModel])
async def get_product_reviews(productId: str):
    db = await get_database()
    
    # 1. Broad Identification: Collect all possible IDs and Names for this item
    query_ids = [productId, str(productId)]
    product_names = []
    
    # If the productId passed IS likely a name (not an ObjectId), add it to names
    if not (ObjectId.is_valid(productId) and len(productId) == 24):
        product_names.append(productId)
        
    try:
        if ObjectId.is_valid(productId):
            query_ids.append(ObjectId(productId))
    except:
        pass
        
    # 2. Try to find the product to get its full "Sacred Identity"
    # Search by ID (as technical ID) OR name (as slug or display name)
    product_query = {
        "$or": [
            {"_id": productId},
            {"name": productId}
        ]
    }
    try:
        if ObjectId.is_valid(productId):
            product_query["$or"].append({"_id": ObjectId(productId)})
    except:
        pass
        
    product = await db["products"].find_one(product_query)
    
    # 3. Enhance search criteria if product is found
    if product:
        p_id = product.get("_id")
        p_name = product.get("name")
        
        query_ids.append(str(p_id))
        if isinstance(p_id, ObjectId):
            query_ids.append(p_id)
        if p_name:
            product_names.append(p_name)
            
    # 4. Total Connectivity Search: Match ANY identifier
    # This matches by ID, String ID, or Name across both ID and Name fields
    review_query = {
        "$or": [
            {"productId": {"$in": query_ids}},
            {"productId": {"$in": product_names}},
            {"productName": {"$in": product_names}}
        ]
    }
        
    reviews = await db["reviews"].find(review_query).sort("createdAt", -1).to_list(100)
    
    return reviews

@router.put("/{id}", response_description="Update an existing review", response_model=ReviewModel)
async def update_review(id: str, review_update: dict = Body(...)):
    db = await get_database()
    query = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
    
    # Get existing review to find productId
    existing_review = await db["reviews"].find_one(query)
    if not existing_review:
        raise HTTPException(status_code=404, detail=f"Review {id} not found")
        
    p_id = existing_review.get("productId")
    
    # Update the review (excluding internal ID if present)
    review_update.pop("id", None)
    review_update.pop("_id", None)
    
    await db["reviews"].update_one(query, {"$set": review_update})
    updated_review = await db["reviews"].find_one(query)
    
    # Recalculate product rating and count
    if p_id:
        product_query_ids = [str(p_id)]
        try:
            if ObjectId.is_valid(str(p_id)):
                product_query_ids.append(ObjectId(str(p_id)))
        except:
            pass

        all_reviews = await db["reviews"].find({
            "productId": {"$in": [p_id, str(p_id)]}
        }).to_list(1000)
        
        count = len(all_reviews)
        total_rating = sum(r.get("rating", 0) for r in all_reviews)
        avg_rating = round(total_rating / count, 1) if count > 0 else 0
        
        # Update using the found product's actual ID
        await db["products"].update_one(
            {"$or": [{"_id": p_id}, {"_id": ObjectId(p_id)} if ObjectId.is_valid(p_id) else {"_id": p_id}]},
            {"$set": {"rating": avg_rating, "reviewCount": count}}
        )
        
    return updated_review

@router.get("/user/{userMobile}", response_description="Get all reviews by a user", response_model=List[ReviewModel])
async def get_user_reviews(userMobile: str):
    db = await get_database()
    reviews = await db["reviews"].find({"userMobile": userMobile}).sort("createdAt", -1).to_list(100)
    return reviews
