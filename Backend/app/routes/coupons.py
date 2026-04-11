from fastapi import APIRouter, HTTPException, status, Body
from ..database import get_database
from ..models import CouponModel, UpdateCouponModel
from datetime import datetime
from typing import List
from bson import ObjectId

router = APIRouter(prefix="/coupons", tags=["Coupons"])

@router.get("/", response_description="List all active coupons", response_model=List[CouponModel])
async def list_coupons():
    db = await get_database()
    # Return only active coupons for the storefront
    coupons = await db["coupons"].find({"isActive": True}).to_list(100)
    return coupons

@router.get("/admin", response_description="List all coupons for admin", response_model=List[CouponModel])
async def list_coupons_admin():
    db = await get_database()
    coupons = await db["coupons"].find({}).to_list(100)
    return coupons

@router.post("/", response_description="Add new coupon", response_model=CouponModel)
async def create_coupon(coupon: CouponModel):
    db = await get_database()
    coupon_dict = coupon.model_dump(by_alias=True, exclude=["id"])
    
    # Use upper case for code consistency
    coupon_dict["code"] = coupon_dict["code"].upper()
    
    # Check if coupon code already exists
    existing = await db["coupons"].find_one({"code": coupon_dict["code"]})
    if existing:
        raise HTTPException(status_code=400, detail=f"Coupon with code {coupon_dict['code']} already exists")
    
    coupon_dict["createdAt"] = datetime.utcnow().isoformat()
    coupon_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    new_coupon = await db["coupons"].insert_one(coupon_dict)
    created_coupon = await db["coupons"].find_one({"_id": new_coupon.inserted_id})
    return created_coupon

@router.put("/{id}", response_description="Update a coupon", response_model=CouponModel)
async def update_coupon(id: str, coupon: UpdateCouponModel = Body(...)):
    db = await get_database()
    update_data = {k: v for k, v in coupon.model_dump(by_alias=True).items() if v is not None}
    
    if len(update_data) >= 1:
        update_data["updatedAt"] = datetime.utcnow().isoformat()
        if "code" in update_data:
            update_data["code"] = update_data["code"].upper()
            
        update_result = await db["coupons"].find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": update_data},
            return_document=True
        )
        if update_result:
            return update_result
            
    if (existing_coupon := await db["coupons"].find_one({"_id": ObjectId(id)})) is not None:
        return existing_coupon
    
    raise HTTPException(status_code=404, detail=f"Coupon {id} not found")

@router.delete("/{id}", response_description="Delete a coupon")
async def delete_coupon(id: str):
    db = await get_database()
    delete_result = await db["coupons"].delete_one({"_id": ObjectId(id)})
    
    if delete_result.deleted_count == 1:
        return {"status": "success", "message": "Coupon deleted successfully"}
        
    raise HTTPException(status_code=404, detail=f"Coupon {id} not found")

@router.get("/validate/{code}", response_description="Validate a coupon code")
async def validate_coupon(code: str):
    db = await get_database()
    coupon = await db["coupons"].find_one({"code": code.upper(), "isActive": True})
    
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid or expired coupon code")
    
    return coupon
