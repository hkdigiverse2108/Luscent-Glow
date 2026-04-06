from fastapi import APIRouter, HTTPException, Body, status
from ..models import UserModel
from ..database import get_database
from bson import ObjectId
from typing import List, Dict, Any
from datetime import datetime
import bcrypt

router = APIRouter(prefix="/users", tags=["Users"])

# Helper to hash password
def hash_password(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

@router.get("/", response_model=List[Dict[str, Any]])
async def get_all_users():
    db = await get_database()
    users = await db["users"].find().to_list(1000)
    for user in users:
        user["id"] = str(user["_id"])
        del user["_id"]
        if "password" in user:
            del user["password"]
    return users

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserModel = Body(...)):
    db = await get_database()
    # Check if user already exists
    existing_user = await db["users"].find_one({"mobileNumber": user.mobileNumber})
    if existing_user:
        raise HTTPException(status_code=400, detail="Mobile number already registered")
    
    # Hash password and setup user
    user_dict = user.model_dump(by_alias=True, exclude=["id"])
    # Hash for authentication
    user_dict["password"] = hash_password(user.password)
    user_dict["createdAt"] = datetime.utcnow().isoformat()
    
    new_user = await db["users"].insert_one(user_dict)
    return {"message": "User created successfully", "userId": str(new_user.inserted_id)}

@router.get("/{userId}")
async def get_user_details(userId: str):
    db = await get_database()
    try:
        user_id_obj = ObjectId(userId)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    user = await db["users"].find_one({"_id": user_id_obj})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["id"] = str(user["_id"])
    del user["_id"]
    if "password" in user:
        del user["password"]
    
    # Keep plainPassword for admin view (already in 'user' dict from find_one)
    
    user_mobile = user.get("mobileNumber")
    
    # Fetch Cart Items (enriched)
    cart_items = await db["cart"].find({"userMobile": user_mobile}).to_list(1000)
    full_cart = []
    for item in cart_items:
        productId = item["productId"]
        if productId.startswith("giftcard-"):
            full_cart.append({
                "id": productId,
                "name": item.get("name") or "Digital Gift Card",
                "price": item.get("price") or 0,
                "image": item.get("image") or "",
                "quantity": item["quantity"]
            })
            continue
            
        product = await db["products"].find_one({"_id": ObjectId(productId) if ObjectId.is_valid(productId) else productId})
        if product:
            full_cart.append({
                "id": str(product["_id"]),
                "name": product["name"],
                "price": product["price"],
                "image": product["image"],
                "quantity": item["quantity"]
            })

    # Fetch Wishlist Items (enriched)
    wishlist_items = await db["wishlist"].find({"userMobile": user_mobile}).to_list(1000)
    full_wishlist = []
    for item in wishlist_items:
        productId = item["productId"]
        product = await db["products"].find_one({"_id": ObjectId(productId) if ObjectId.is_valid(productId) else productId})
        if product:
            full_wishlist.append({
                "id": str(product["_id"]),
                "name": product["name"],
                "price": product["price"],
                "image": product["image"]
            })
            
    # Fetch Gift Cards (sent or received)
    gift_cards = await db["gift_cards"].find({
        "$or": [
            {"senderMobile": user_mobile},
            {"recipientMobile": user_mobile}
        ]
    }).to_list(1000)
    
    formatted_cards = []
    for card in gift_cards:
        formatted_cards.append({
            "id": str(card["_id"]),
            "code": card["code"],
            "initialBalance": card.get("initialBalance", 0),
            "currentBalance": card.get("currentBalance", 0),
            "recipientName": card.get("recipientName"),
            "recipientMobile": card.get("recipientMobile"),
            "senderName": card.get("senderName"),
            "senderMobile": card.get("senderMobile"),
            "isActive": card.get("isActive", True),
            "theme": card.get("theme", "Gold Radiance"),
            "image": card.get("image"),
            "message": card.get("message"),
            "createdAt": card.get("createdAt")
        })

    return {
        "user": user,
        "cart": full_cart,
        "wishlist": full_wishlist,
        "giftCards": formatted_cards
    }

@router.put("/{userId}")
async def update_user(userId: str, data: Dict[str, Any] = Body(...)):
    db = await get_database()
    try:
        user_id_obj = ObjectId(userId)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    # Get current user state
    current_user = await db["users"].find_one({"_id": user_id_obj})
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    old_mobile = current_user.get("mobileNumber")
    new_mobile = data.get("mobileNumber")
    
    # Check if mobile number is being changed
    relational_update = False
    if new_mobile and new_mobile != old_mobile:
        # Check if new number is already taken
        existing_user = await db["users"].find_one({"mobileNumber": new_mobile})
        if existing_user:
            raise HTTPException(status_code=400, detail="New mobile number is already registered")
        relational_update = True

    # Prepare update data
    allowed_fields = ["fullName", "email", "mobileNumber", "profilePicture", "isAdmin", "isVerified", "shippingAddress", "password"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    
    # Special handling for password
    if "password" in update_data and update_data["password"]:
        # Hash for secure authentication
        update_data["password"] = hash_password(update_data["password"])
    elif "password" in update_data:
        # Don't update password if empty string provided
        del update_data["password"]
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = await db["users"].update_one(
        {"_id": user_id_obj},
        {"$set": update_data}
    )
    
    if relational_update:
        # Update references across all collections
        collections_to_update = ["cart", "wishlist", "orders"]
        for coll in collections_to_update:
            await db[coll].update_many(
                {"userMobile": old_mobile},
                {"$set": {"userMobile": new_mobile}}
            )
        
        # Gift cards have specific field names
        await db["gift_cards"].update_many(
            {"senderMobile": old_mobile},
            {"$set": {"senderMobile": new_mobile}}
        )
        await db["gift_cards"].update_many(
            {"recipientMobile": old_mobile},
            {"$set": {"recipientMobile": new_mobile}}
        )

    return {"message": "User updated successfully"}

@router.put("/{userId}/password")
async def update_user_password(userId: str, data: Dict[str, str] = Body(...)):
    db = await get_database()
    try:
        user_id_obj = ObjectId(userId)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    new_password = data.get("password")
    if not new_password:
        raise HTTPException(status_code=400, detail="Password is required")
        
    hashed_password = hash_password(new_password)
    result = await db["users"].update_one(
        {"_id": user_id_obj},
        {"$set": {"password": hashed_password}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": "Password updated successfully"}

@router.delete("/{userId}")
async def delete_user(userId: str):
    db = await get_database()
    try:
        user_id_obj = ObjectId(userId)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
        
    user = await db["users"].find_one({"_id": user_id_obj})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_mobile = user.get("mobileNumber")
    
    # Delete User
    await db["users"].delete_one({"_id": user_id_obj})
    
    # Delete Cart and Wishlist if mobileNumber exists
    if user_mobile:
        await db["cart"].delete_many({"userMobile": user_mobile})
        await db["wishlist"].delete_many({"userMobile": user_mobile})
        
    return {"message": "User and associated records deleted successfully"}
