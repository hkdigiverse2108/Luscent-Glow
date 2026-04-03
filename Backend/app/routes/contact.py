from fastapi import APIRouter, Body, status, HTTPException
from fastapi.encoders import jsonable_encoder
from datetime import datetime
from ..models import ContactInquiryModel
from ..database import get_database
from bson import ObjectId

router = APIRouter()

@router.post("/inquiry", response_description="Add new contact inquiry", status_code=status.HTTP_201_CREATED)
async def create_inquiry(inquiry: ContactInquiryModel = Body(...)):
    db = await get_database()
    
    # Convert pydantic model to dict
    inquiry_dict = inquiry.model_dump(by_alias=True, exclude=["id"])
    
    # Add creation timestamp
    inquiry_dict["createdAt"] = datetime.utcnow().isoformat()
    
    new_inquiry = await db["inquiries"].insert_one(inquiry_dict)
    
    return {
        "status": "success", 
        "message": "Inquiry recorded successfully",
        "inquiryId": str(new_inquiry.inserted_id)
    }

@router.get("/inquiries", response_description="List all contact inquiries")
async def list_inquiries():
    db = await get_database()
    inquiries = await db["inquiries"].find().to_list(1000)
    for inquiry in inquiries:
        inquiry["_id"] = str(inquiry["_id"])
    return inquiries

@router.delete("/inquiry/{inquiry_id}", response_description="Delete contact inquiry")
async def delete_inquiry(inquiry_id: str):
    db = await get_database()
    delete_result = await db["inquiries"].delete_one({"_id": ObjectId(inquiry_id)})
    
    if delete_result.deleted_count == 1:
        return {"status": "success", "message": "Inquiry successfully removed"}
    
    raise HTTPException(status_code=404, detail="Inquiry not found")

@router.post("/bulk-inquiry", response_description="Add new bulk/corporate inquiry", status_code=status.HTTP_201_CREATED)
async def create_bulk_inquiry(inquiry: ContactInquiryModel = Body(...)):
    db = await get_database()
    
    # Convert pydantic model to dict
    inquiry_dict = inquiry.model_dump(by_alias=True, exclude=["id"])
    
    # Add creation timestamp
    inquiry_dict["createdAt"] = datetime.utcnow().isoformat()
    
    new_inquiry = await db["bulk_inquiries"].insert_one(inquiry_dict)
    
    return {
        "status": "success", 
        "message": "Corporate inquiry recorded successfully",
        "inquiryId": str(new_inquiry.inserted_id)
    }

@router.get("/bulk-inquiries", response_description="List all corporate inquiries")
async def list_bulk_inquiries():
    db = await get_database()
    inquiries = await db["bulk_inquiries"].find().to_list(1000)
    for inquiry in inquiries:
        inquiry["_id"] = str(inquiry["_id"])
    return inquiries

@router.delete("/bulk-inquiry/{inquiry_id}", response_description="Delete corporate inquiry")
async def delete_bulk_inquiry(inquiry_id: str):
    db = await get_database()
    delete_result = await db["bulk_inquiries"].delete_one({"_id": ObjectId(inquiry_id)})
    
    if delete_result.deleted_count == 1:
        return {"status": "success", "message": "Corporate inquiry successfully removed"}
    
    raise HTTPException(status_code=404, detail="Corporate inquiry not found")
