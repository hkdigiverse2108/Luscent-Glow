from fastapi import APIRouter, Body, HTTPException, status
from fastapi.responses import Response
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from ..models import OfferModel, UpdateOfferModel, OfferSettingsModel
from ..database import get_database

router = APIRouter(prefix="/offers", tags=["Offers"])

# --- Individual Offers CRUD ---

@router.get("/", response_description="List all offers", response_model=List[OfferModel])
async def list_offers():
    db = await get_database()
    offers = await db["offers"].find().to_list(1000)
    return offers

@router.post("/", response_description="Create a new offer", response_model=OfferModel, status_code=status.HTTP_201_CREATED)
async def create_offer(offer: OfferModel = Body(...)):
    db = await get_database()
    offer_dict = offer.model_dump(by_alias=True, exclude=["id"])
    offer_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    new_offer = await db["offers"].insert_one(offer_dict)
    created_offer = await db["offers"].find_one({"_id": new_offer.inserted_id})
    return created_offer

@router.put("/{id}", response_description="Update an offer", response_model=OfferModel)
async def update_offer(id: str, offer: UpdateOfferModel = Body(...)):
    db = await get_database()
    query = {"_id": id}
    try:
        if ObjectId.is_valid(id):
            query = {"_id": ObjectId(id)}
    except:
        pass

    update_data = {k: v for k, v in offer.model_dump().items() if v is not None}
    if update_data:
        update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
        update_result = await db["offers"].find_one_and_update(
            query, {"$set": update_data}, return_document=True
        )
        if update_result:
            return update_result
            
    if (existing := await db["offers"].find_one(query)) is not None:
        return existing
    raise HTTPException(status_code=404, detail=f"Offer {id} not found")

@router.delete("/{id}", response_description="Delete an offer")
async def delete_offer(id: str):
    db = await get_database()
    query = {"_id": id}
    try:
        if ObjectId.is_valid(id):
            query = {"_id": ObjectId(id)}
    except:
        pass

    delete_result = await db["offers"].delete_one(query)
    if delete_result.deleted_count == 1:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    raise HTTPException(status_code=404, detail=f"Offer {id} not found")


# --- Offers Page Settings ---

@router.get("/settings", response_description="Get Offers page settings", response_model=OfferSettingsModel)
async def get_offer_settings():
    db = await get_database()
    if (settings := await db["offer_settings"].find_one()) is not None:
        return settings
    
    # Return default if none exists
    default_settings = OfferSettingsModel()
    return default_settings

@router.put("/settings", response_description="Update Offers page settings", response_model=OfferSettingsModel)
async def update_offer_settings(settings: OfferSettingsModel = Body(...)):
    db = await get_database()
    settings_dict = settings.model_dump(by_alias=True, exclude=["id"])
    settings_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    update_result = await db["offer_settings"].find_one_and_update(
        {}, 
        {"$set": settings_dict}, 
        upsert=True, 
        return_document=True
    )
    return update_result
