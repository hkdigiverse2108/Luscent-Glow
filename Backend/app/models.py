from pydantic import BaseModel, Field, BeforeValidator
from typing import Annotated, Optional, List
from bson import ObjectId

# Represents an ObjectId field in the database.
PyObjectId = Annotated[str, BeforeValidator(str)]

class ProductModel(BaseModel):
    """
    Full schema for Products, matching frontend interface.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str = Field(...)
    brand: str = Field(...)
    price: float = Field(..., gt=0)
    originalPrice: Optional[float] = Field(default=None)
    discount: Optional[int] = Field(default=None)
    rating: float = Field(..., ge=0, le=5)
    reviewCount: int = Field(..., ge=0)
    image: str = Field(...)
    category: str = Field(...)
    tags: List[str] = Field(default_factory=list)
    shades: Optional[List[str]] = Field(default=None)
    sizes: Optional[List[str]] = Field(default=None)
    isNew: Optional[bool] = Field(default=False)
    isTrending: Optional[bool] = Field(default=False)
    isBestSeller: Optional[bool] = Field(default=False)
    description: Optional[str] = Field(default=None)
    ingredients: Optional[str] = Field(default=None)
    howToUse: Optional[str] = Field(default=None)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "Velvet Matte Lipstick",
                "brand": "Luscent Glow",
                "price": 899,
                "originalPrice": 1299,
                "discount": 31,
                "rating": 4.5,
                "reviewCount": 2341,
                "category": "makeup",
                "tags": ["lips", "matte"],
                "image": "https://..."
            }
        }

class UpdateProductModel(BaseModel):
    """
    Schema for updating products.
    """
    name: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    originalPrice: Optional[float] = None
    discount: Optional[int] = None
    rating: Optional[float] = None
    reviewCount: Optional[int] = None
    image: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    shades: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    isNew: Optional[bool] = None
    isTrending: Optional[bool] = None
    isBestSeller: Optional[bool] = None
    description: Optional[str] = None
    ingredients: Optional[str] = None
    howToUse: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Updated Lipstick Name",
                "price": 999
            }
        }

class UserModel(BaseModel):
    """
    User profile schema for authentication and account management.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    fullName: str = Field(...)
    mobileNumber: str = Field(...)
    email: str = Field(...)
    password: str = Field(...)  # Stored as bcrypt hash
    isAdmin: bool = Field(default=False)
    isVerified: bool = Field(default=False)
    otp: Optional[str] = Field(default=None)
    profilePicture: Optional[str] = Field(default=None)
    shippingAddress: Optional[dict] = Field(default=None)
    createdAt: Optional[str] = Field(default=None)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "fullName": "Jane Doe",
                "mobileNumber": "+91 9876543210",
                "email": "jane@example.com",
                "password": "hashed_password_here"
            }
        }

class UserAuthModel(BaseModel):
    """
    Schema for login credentials.
    """
    mobileNumber: str = Field(...)
    password: str = Field(...)

class OTPVerifyModel(BaseModel):
    """
    Schema for OTP verification.
    """
    mobileNumber: str = Field(...)
    otp: str = Field(...)

class WishlistItem(BaseModel):
    """
    Schema for a wishlist item, linking a user to a product.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    userMobile: str = Field(...)
    productId: str = Field(...)
    createdAt: str = Field(...)

    class Config:
        populate_by_name = True

class WishlistToggleModel(BaseModel):
    """
    Schema for toggling an item in the wishlist.
    """
    userMobile: str = Field(...)
    productId: str = Field(...)

class ForgotPasswordModel(BaseModel):
    """
    Schema for initiating a password reset.
    """
    mobileNumber: str = Field(...)

class PasswordResetModel(BaseModel):
    """
    Schema for password reset.
    """
    mobileNumber: str = Field(...)
    otp: str = Field(...)
    newPassword: str = Field(...)

class CartItemModel(BaseModel):
    """
    Schema for a cart item, linking a user to a product with details.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    userMobile: Optional[str] = Field(default=None)
    guestId: Optional[str] = Field(default=None)
    productId: str = Field(...)
    quantity: int = Field(..., ge=1)
    price: Optional[float] = Field(default=None)
    name: Optional[str] = Field(default=None)
    image: Optional[str] = Field(default=None)
    selectedShade: Optional[str] = Field(default=None)
    selectedSize: Optional[str] = Field(default=None)
    metadata: Optional[dict] = Field(default=None)
    createdAt: Optional[str] = Field(default=None)

    class Config:
        populate_by_name = True

class CartUpdateModel(BaseModel):
    """
    Schema for updating cart item quantity.
    """
    userMobile: str = Field(...)
    productId: str = Field(...)
    quantity: int = Field(..., ge=1)
    price: Optional[float] = Field(default=None)
    name: Optional[str] = Field(default=None)
    image: Optional[str] = Field(default=None)
    selectedShade: Optional[str] = Field(default=None)
    selectedSize: Optional[str] = Field(default=None)
    metadata: Optional[dict] = Field(default=None)

class ContactInquiryModel(BaseModel):
    """
    Schema for storing user contact inquiries from the Contact Us page.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str = Field(...)
    email: str = Field(...)
    phoneNumber: Optional[str] = Field(default=None)
    companyName: Optional[str] = Field(default=None)
    estimatedQuantity: Optional[str] = Field(default=None)
    subject: str = Field(...)
    message: str = Field(...)
    createdAt: Optional[str] = Field(default=None)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "Jane Doe",
                "email": "jane@example.com",
                "phoneNumber": "+91 9876543210",
                "subject": "Curation Advice",
                "message": "I would love to know more about..."
            }
        }

class OrderItem(BaseModel):
    """
    Schema for an item within an order.
    """
    productId: str = Field(...)
    name: str = Field(...)
    price: float = Field(...)
    quantity: int = Field(..., ge=1)
    image: str = Field(...)
    selectedShade: Optional[str] = Field(default=None)
    selectedSize: Optional[str] = Field(default=None)
    metadata: Optional[dict] = Field(default=None)

class OrderModel(BaseModel):
    """
    Schema for a complete user order.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    userMobile: Optional[str] = Field(default=None)
    items: List[OrderItem] = Field(...)
    totalAmount: float = Field(...)
    status: str = Field(default="Processing") # Processing, Quality Check, Shipped, Delivered, Cancelled
    paymentStatus: str = Field(default="Pending")
    shippingAddress: Optional[dict] = Field(default=None)
    createdAt: str = Field(...)
    orderNumber: str = Field(...)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "userMobile": "+91 9876543210",
                "totalAmount": 2499,
                "status": "Processing",
                "orderNumber": "LG-827364"
            }
        }

class GiftCardModel(BaseModel):
    """
    Schema for a generated gift card that can be redeemed.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    code: str = Field(...) # Unique 12-char code: LG-GIFT-XXXX-XXXX
    initialBalance: float = Field(..., gt=0)
    currentBalance: float = Field(..., ge=0)
    senderMobile: str = Field(...)
    recipientName: str = Field(...)
    recipientMobile: Optional[str] = Field(default=None)
    message: Optional[str] = Field(default=None)
    theme: Optional[str] = Field(default="Gold Radiance")
    image: Optional[str] = Field(default=None)
    isActive: bool = Field(default=True)
    expiryDate: str = Field(...)
    createdAt: str = Field(...)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "code": "LG-GIFT-AX72-KM9P",
                "initialBalance": 5000,
                "currentBalance": 5000,
                "recipientName": "Jane Doe",
                "isActive": True
            }
        }
