from fastapi import APIRouter, Body, HTTPException, status, Response
from typing import List, Optional
from ..models import ReviewModel
from ..database import get_database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("/", response_description="Submit a new review", response_model=ReviewModel)
async def create_review(review: ReviewModel = Body(...)):
    db = await get_database()
    
    # 1. Insert the review
    review_data = review.model_dump(by_alias=True, exclude=["id"])
    if not review_data.get("createdAt"):
        review_data["createdAt"] = datetime.utcnow().isoformat()
        
    result = await db["reviews"].insert_one(review_data)
    created_review = await db["reviews"].find_one({"_id": result.inserted_id})
    
    # 2. Update Product Rating & Count
    product_id = review.productId
    
    # Try different ID formats to match the product
    # Some products use string IDs, others use ObjectIds
    product = await db["products"].find_one({"_id": product_id})
    if not product:
        try:
            if ObjectId.is_valid(product_id):
                product = await db["products"].find_one({"_id": ObjectId(product_id)})
        except:
            pass
            
    if product:
        # Get all reviews for this product
        # Search for both string and object ID just in case
        all_reviews = await db["reviews"].find({
            "$or": [
                {"productId": product_id},
                {"productId": str(product_id)}
            ]
        }).to_list(1000)
        
        total_rating = sum(r.get("rating", 0) for r in all_reviews)
        count = len(all_reviews)
        avg_rating = round(total_rating / count, 1) if count > 0 else 0
        
        # Update using the found product's actual ID
        await db["products"].update_one(
            {"_id": product["_id"]},
            {"$set": {"rating": avg_rating, "reviewCount": count}}
        )
        
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
        # Recalculate product rating and count
        if p_id:
            p_query = {"$or": [{"_id": p_id}, {"_id": ObjectId(p_id)}]} if ObjectId.is_valid(p_id) else {"_id": p_id}
            all_reviews = await db["reviews"].find({"productId": p_id}).to_list(1000)
            count = len(all_reviews)
            total_rating = sum(r.get("rating", 0) for r in all_reviews)
            avg_rating = round(total_rating / count, 1) if count > 0 else 0
            
            await db["products"].update_one(
                p_query,
                {"$set": {"rating": avg_rating, "reviewCount": count}}
            )
            
        return Response(status_code=status.HTTP_204_NO_CONTENT)
        
    raise HTTPException(status_code=404, detail=f"Review {id} not found")

@router.get("/product/{productId}", response_description="Get reviews for a product", response_model=List[ReviewModel])
async def get_product_reviews(productId: str):
    db = await get_database()
    
    # Identify the search criteria - support both string IDs and ObjectIds
    query_ids = [productId, str(productId)]
    try:
        if ObjectId.is_valid(productId):
            query_ids.append(ObjectId(productId))
    except:
        pass
        
    # Find all reviews where productId matches any of the formats
    reviews = await db["reviews"].find({
        "productId": {"$in": query_ids}
    }).sort("createdAt", -1).to_list(100)
    
    return reviews
