from fastapi import APIRouter, Body, status, HTTPException
from fastapi.encoders import jsonable_encoder
from datetime import datetime
from ..models import ContactInquiryModel
from ..database import get_database

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
    return inquiries

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
    return inquiries
