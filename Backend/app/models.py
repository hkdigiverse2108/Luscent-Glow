from pydantic import BaseModel, Field, BeforeValidator
from typing import Annotated, Optional, List
from bson import ObjectId

# Represents an ObjectId field in the database.
PyObjectId = Annotated[str, BeforeValidator(str)]

class ProductVariant(BaseModel):
    """
    Schema for individual product variations (Color/Size/Price combinations).
    """
    id: Optional[str] = Field(default=None)
    color: Optional[str] = Field(default=None)
    size: Optional[str] = Field(default=None)
    price: float = Field(..., ge=0)
    originalPrice: Optional[float] = Field(default=None)
    stock: Optional[int] = Field(default=0)
    sku: Optional[str] = Field(default=None)
    appliedPromotionId: Optional[str] = Field(default=None)
    image: Optional[str] = Field(default=None)
    images: List[str] = Field(default_factory=list)

class SEOModel(BaseModel):
    """
    Schema for SEO metadata used across the platform.
    """
    title: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)
    keywords: Optional[str] = Field(default=None)
    ogImage: Optional[str] = Field(default=None)

class ProductModel(BaseModel):
    """
    Full schema for Products, matching frontend interface.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str = Field(...)
    brand: str = Field(...)
    price: float = Field(..., ge=0)
    originalPrice: Optional[float] = Field(default=None)
    discount: Optional[int] = Field(default=None)
    rating: float = Field(..., ge=0, le=5)
    reviewCount: int = Field(..., ge=0)
    image: str = Field(...)
    images: Optional[List[str]] = Field(default=None)
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
    variants: Optional[List[ProductVariant]] = Field(default_factory=list)
    seo: Optional[SEOModel] = Field(default=None)

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
    images: Optional[List[str]] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    shades: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    isNew: Optional[bool] = None
    isTrending: Optional[bool] = None
    isBestSeller: Optional[bool] = None
    description: Optional[str] = None
    variants: Optional[List[ProductVariant]] = None
    ingredients: Optional[str] = None
    howToUse: Optional[str] = None
    appliedPromotionId: Optional[str] = None
    seo: Optional[SEOModel] = None

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
    addresses: List[dict] = Field(default_factory=list)
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

class ReviewModel(BaseModel):
    """
    Model for product reviews submitted by users.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    productId: str = Field(...)
    userMobile: str = Field(...)
    userName: str = Field(...)
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(...)
    title: Optional[str] = Field(default=None)
    images: Optional[List[str]] = Field(default_factory=list)
    selectedVariant: Optional[str] = Field(default=None)
    createdAt: str = Field(...)
    orderNumber: Optional[str] = Field(default=None)
    helpfulCount: int = Field(default=0, ge=0)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "productId": "65f123...",
                "userMobile": "9123456789",
                "userName": "Jane Doe",
                "rating": 5,
                "comment": "Absolutely love the texture and longevity of this lipstick!",
                "createdAt": "2026-04-07T14:18:19Z"
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
    mobileNumber: Optional[str] = Field(default=None)
    otp: str = Field(...)
    newPassword: str = Field(...)
    userId: Optional[str] = Field(default=None)

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
    Schema for updating cart item quantity or removing items.
    """
    userMobile: Optional[str] = Field(default=None)
    guestId: Optional[str] = Field(default=None)
    productId: str = Field(...)
    quantity: int = Field(..., ge=0)
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
    productId: Optional[str] = Field(default=None)
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
    userName: Optional[str] = Field(default=None)
    createdAt: str = Field(...)
    orderNumber: str = Field(...)
    merchantTransactionId: Optional[str] = Field(default=None)
    
    # Shiprocket Tracking Fields
    shiprocketOrderId: Optional[str] = Field(default=None)
    shiprocketShipmentId: Optional[str] = Field(default=None)
    trackingNumber: Optional[str] = Field(default=None)
    trackingUrl: Optional[str] = Field(default=None)
    courierPartner: Optional[str] = Field(default=None)

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
    senderName: Optional[str] = Field(default=None)
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

class UpdateGiftCardModel(BaseModel):
    """
    Schema for updating gift card details.
    """
    currentBalance: Optional[float] = None
    recipientName: Optional[str] = None
    recipientMobile: Optional[str] = None
    message: Optional[str] = None
    theme: Optional[str] = None
    isActive: Optional[bool] = None
    expiryDate: Optional[str] = None

class GiftCardSettingsModel(BaseModel):
    """
    Model for the dynamic content of the Gift Cards landing page.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    heroTitle: str = Field(default="Gift Radiance")
    heroDescription: str = Field(default="Empower someone you love to choose their own ritual.")
    heroImage: str = Field(default="/assets/gift-cards/hero.png")
    themes: List[dict] = Field(default_factory=list) # {id, name, image, color}
    amounts: List[int] = Field(default_factory=list) # [1000, 2500, 5000, 10000]
    features: List[dict] = Field(default_factory=list) # {icon, title, desc}
    benefitsTitle: str = Field(default="Because Beauty is a Personal Choice.")
    benefitsDescription: str = Field(default="Choosing the perfect skincare ritual for someone else can be challenging.")
    benefitsList: List[str] = Field(default_factory=list)
    faqs: List[dict] = Field(default_factory=list) # {q, a}
    seo: Optional[SEOModel] = Field(default=None)
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True

class PaymentRecordModel(BaseModel):
    """
    Detailed audit log for every payment transaction.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    merchantId: str = Field(...)
    merchantTransactionId: str = Field(...)
    orderNumber: str = Field(...)
    userMobile: str = Field(...)
    amount: float = Field(...)
    status: str = Field(default="INITIATED") # INITIATED, SUCCESS, FAILED, PENDING
    providerReferenceId: Optional[str] = Field(default=None)
    paymentMode: Optional[str] = Field(default=None)
    response: Optional[str] = Field(default=None)
    data: Optional[dict] = Field(default=None)
    rawResponse: Optional[dict] = Field(default=None)
    createdAt: str = Field(...)
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True

class CategoryModel(BaseModel):
    """
    Model for product categories shown in the header and filters.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str = Field(...)
    slug: str = Field(...)
    image: Optional[str] = Field(default=None)
    seo: Optional[SEOModel] = Field(default=None)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "Skincare",
                "slug": "skincare",
                "image": "https://..."
            }
        }

class UpdateCategoryModel(BaseModel):
    """
    Model for updating existing categories.
    """
    name: Optional[str] = None
    slug: Optional[str] = None
    image: Optional[str] = None
    seo: Optional[SEOModel] = None

class BulkOrderSettingsModel(BaseModel):
    """
    Model for the dynamic content of the Bulk Orders landing page.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    heroTitle: str = Field(default="Elevate Your Corporate Gifting.")
    heroDescription: str = Field(default="Transform business relationships into lasting impressions.")
    heroImage: str = Field(default="/assets/corporate-gifting.png")
    heroBadge: str = Field(default="Corporate Support")
    features: List[dict] = Field(default_factory=list) # {icon, title, desc}
    stats: List[dict] = Field(default_factory=list) # {icon, label}
    quantities: List[str] = Field(default_factory=list) # ["10-50", "50-100", ...]
    inquiryTitle: str = Field(default="The Inquiry Portal")
    inquiryDescription: str = Field(default="Share your requirements and our team will reach out.")
    seo: Optional[SEOModel] = Field(default=None)
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True

class AboutSettingsModel(BaseModel):
    """
    Model for the dynamic content of the About Us landing page.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    heroImage: str = Field(default="/assets/about/hero-about.png")
    heroBadge: str = Field(default="The Luscent Chronicle")
    heroTitle: str = Field(default="Curating Radiance, Defying Convention.")
    narrativeTitle: str = Field(default="Beauty is not a trend. It is a Quiet Revolution.")
    narrativeParagraphs: List[str] = Field(default_factory=list)
    values: List[dict] = Field(default_factory=list) # {icon, title, desc}
    interludeImage: str = Field(default="/assets/about/values-botanical.png")
    interludeTitle: str = Field(default="98% Natural Origins")
    interludeSubtitle: str = Field(default="CRAFTED IN SMALL BATCHES FOR UNCOMPROMISED POTENCY")
    curatorImage: str = Field(default="/assets/about/curator-portrait.png")
    curatorBadge: str = Field(default="Our Founder")
    curatorTitle: str = Field(default="A Vision of Subtle Luxury.")
    curatorQuote: str = Field(default="I wanted to create a space where beauty wasn't about concealment, but about enhancement.")
    curatorName: str = Field(default="Janvi Vasani, Founder & Curator")
    commitments: List[str] = Field(default_factory=list)
    seo: Optional[SEOModel] = Field(default=None)
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True

class ContactSettingsModel(BaseModel):
    """
    Model for the dynamic content of the Contact Us landing page.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    heroBadge: str = Field(default="Glow Support")
    heroTitle: str = Field(default="Your Radiance, Our Priority.")
    heroDescription: str = Field(default="Whether you seek personalized product curation or require immediate support, our artisan team is here to illuminate your journey.")
    formTitle: str = Field(default="Initiate a Conversation")
    formSubjects: List[str] = Field(default_factory=list)
    channels: List[dict] = Field(default_factory=list) # {icon, badge, value, desc}
    boutiqueImage: str = Field(default="/assets/contact/boutique-storefront.png")
    faqTitle: str = Field(default="Seeking Instant Curation?")
    faqSubtitle: str = Field(default="Most inquiries are illuminated in our FAQ registry.")
    faqLinks: List[str] = Field(default_factory=list)
    seo: Optional[SEOModel] = Field(default=None)
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True

class FAQSettingsModel(BaseModel):
    """
    Model for the dynamic content of the FAQ landing page.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    heroBadge: str = Field(default="Support Services")
    heroTitle: str = Field(default="How can we assist you?")
    heroDescription: str = Field(default="Explore our curated guide to the most frequent inquiries regarding your journey to radiant skin.")
    categories: List[dict] = Field(default_factory=list) # {id, icon, title, questions: [{id, question, answer}]}
    supportTitle: str = Field(default="Still have questions?")
    supportDescription: str = Field(default="Our Support team is here to assist you with any personalized requests.")
    supportButtonText: str = Field(default="Contact Support")
    supportButtonLink: str = Field(default="/contact")
    seo: Optional[SEOModel] = Field(default=None)
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True

class BlogPostModel(BaseModel):
    """
    Model for an individual journal story (blog post).
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    title: str = Field(...)
    excerpt: str = Field(...)
    content: str = Field(...) # HTML content for rich storytelling
    author: str = Field(default="Elena Vance")
    date: str = Field(...)
    category: str = Field(default="Rituals")
    image: str = Field(...)
    readTime: str = Field(default="5 min read")
    featured: bool = Field(default=False)
    relatedProducts: List[str] = Field(default_factory=list)
    seo: Optional[SEOModel] = Field(default=None)
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True

class BlogSettingsModel(BaseModel):
    """
    Model for editorial branding/titles on the Journal page.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    heroBadge: str = Field(default="The Journal")
    heroTitle: str = Field(default="Glow Haven Chronicles")
    finaleTitle: str = Field(default="Stay Inspired")
    finaleSubtitle: str = Field(default="Ritual of Radiance")
    seo: Optional[SEOModel] = Field(default=None)
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True

class EditorialVoiceModel(BaseModel):
    """
    Model for an authoritative editorial voice/profile.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str = Field(...)
    badge: str = Field(default="EDITORIAL VOICE")
    insights: str = Field(...)
    image: str = Field(...)
    isActive: bool = Field(default=False)
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "Dr. Marcus Chen",
                "badge": "EDITORIAL VOICE",
                "insights": "Beauty is the outward reflection of a harmonious soul.",
                "image": "/assets/blog/authors/marcus.png",
                "isActive": True
            }
        }

class BrandingModel(BaseModel):
    """
    Model for site-wide branding settings like logo.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    logoText: str = Field(default="Luscent Glow")
    logoImage: Optional[str] = Field(default=None)
    useImage: bool = Field(default=False)
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True

class PolicyInsightModel(BaseModel):
    """
    Schema for a highlight/insight in a policy page.
    """
    icon: str = Field(...)
    title: str = Field(...)
    description: str = Field(...)

class PolicySectionModel(BaseModel):
    """
    Schema for a section within a policy.
    """
    id: str = Field(...)
    title: str = Field(...)
    content: str = Field(...) # HTML content
    icon: Optional[str] = Field(default="FileText")

class PolicyModel(BaseModel):
    """
    Model for dynamic policy pages (Privacy, Terms, etc.).
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    type: str = Field(...) # unique identifier: privacy-policy, terms-of-service, etc.
    title: str = Field(...)
    subtitle: str = Field(...)
    lastUpdated: str = Field(...)
    heroIcon: Optional[str] = Field(default="Shield")
    insights: List[PolicyInsightModel] = Field(default_factory=list)
    sections: List[PolicySectionModel] = Field(default_factory=list)
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "type": "privacy-policy",
                "title": "Privacy Policy",
                "subtitle": "Your trust is everything.",
                "lastUpdated": "March 30, 2026",
                "insights": [],
                "sections": []
            }
        }

class FooterSocial(BaseModel):
    platform: str
    url: str
    icon: str

class FooterLink(BaseModel):
    label: str
    path: str

class FooterColumn(BaseModel):
    title: str
    links: List[FooterLink]

class FooterModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    brandDescription: str
    socials: List[FooterSocial]
    email: str
    phone: str
    columns: List[FooterColumn]
    newsletterTitle: str
    newsletterSubtitle: str
    copyrightText: str
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "brandDescription": "Elevate your beauty routine with our premium, cruelty-free cosmetics.",
                "socials": [{"platform": "Instagram", "url": "https://...", "icon": "Instagram"}],
                "email": "hello@luscentglow.com",
                "phone": "+91 97126 63607",
                "columns": [
                    {
                        "title": "Information",
                        "links": [{"label": "About Us", "path": "/about"}]
                    }
                ],
                "newsletterTitle": "Beauty Line",
                "newsletterSubtitle": "Curated aesthetics & beauty tips straight to your inbox.",
                "copyrightText": "© 2026 Luscent Glow. All rights reserved."
            }
        }

class GlobalSettingsModel(BaseModel):
    """
    Model for platform-wide configurations like WhatsApp number.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    whatsappNumber: str = Field(default="919537150942")
    storeName: str = Field(default="Luscent Glow")
    supportEmail: str = Field(default="hello@luscentglow.com")
    supportPhone: str = Field(default="+91 97126 63607")
    freeShippingThreshold: int = Field(default=0)
    defaultShippingCharge: float = Field(default=0)
    announcementText: str = Field(default="FREE SHIPPING ABOVE ₹999 | USE CODE GLOW15")
    copyrightText: str = Field(default="© 2026 Luscent Glow. All rights reserved.")
    priceFilters: List[dict] = Field(default_factory=list)
    seo: Optional[SEOModel] = Field(default=None)
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "whatsappNumber": "919537150942",
                "storeName": "Luscent Glow",
                "supportEmail": "hello@luscentglow.com",
                "supportPhone": "+91 97126 63607",
                "freeShippingThreshold": 999,
                "announcementText": "FREE SHIPPING ABOVE ₹999 | USE CODE GLOW15",
                "copyrightText": "© 2026 Luscent Glow. All rights reserved.",
                "updatedAt": "2026-04-06T09:53:06Z"
            }
        }


class OfferModel(BaseModel):
    """
    Model for individual promotional offers, flash deals, and bundles.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    type: str = Field(...) # flash, bundle, tier
    title: str = Field(...)
    discount: Optional[str] = Field(default=None)
    category: Optional[str] = Field(default=None)
    image: Optional[str] = Field(default=None)
    endTime: Optional[str] = Field(default=None) # ISO string or countdown time
    price: Optional[float] = Field(default=None)
    originalPrice: Optional[float] = Field(default=None)
    items: List[str] = Field(default_factory=list)
    tag: Optional[str] = Field(default=None)
    threshold: Optional[float] = Field(default=None)
    reward: Optional[str] = Field(default=None)
    isActive: bool = Field(default=True)
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "type": "flash",
                "title": "Midnight Radiance Flash Sale",
                "discount": "FLAT 40% OFF",
                "category": "Skincare Essentials",
                "image": "https://...",
                "endTime": "2026-04-07T00:00:00Z"
            }
        }

class UpdateOfferModel(BaseModel):
    """
    Schema for updating individual offers.
    """
    type: Optional[str] = None
    title: Optional[str] = None
    discount: Optional[str] = None
    category: Optional[str] = None
    image: Optional[str] = None
    endTime: Optional[str] = None
    price: Optional[float] = None
    originalPrice: Optional[float] = None
    items: Optional[List[str]] = None
    tag: Optional[str] = None
    threshold: Optional[float] = None
    reward: Optional[str] = None
    isActive: Optional[bool] = None

class OfferSettingsModel(BaseModel):
    """
    Model for the dynamic content of the Offers landing page.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    heroTitle: str = Field(default="Exclusive Treasures Waiting For You")
    heroDescription: str = Field(default="Unlock limited-time discounts on our premium, cruelty-free collection.")
    heroImage: str = Field(default="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1600&h=900&fit=crop")
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True
class HeroSlideModel(BaseModel):
    """
    Schema for a single slide in the cinematic hero carousel.
    """
    image: str = Field(...)
    title: str = Field(...)
    subtitle: str = Field(...)
    cta: str = Field(default="Shop Collection")
    link: str = Field(default="/products")

class HomeBrandStoryModel(BaseModel):
    """
    Schema for the philosophical 'Our Story' section on the homepage.
    """
    badge: str = Field(default="Our Philosophy")
    title: str = Field(default="The Alchemy of Radiance")
    description: str = Field(...)
    image: str = Field(default="/assets/hero/brand-story.png")
    buttonText: str = Field(default="Read Our Full Story")
    buttonLink: str = Field(default="/about")

class HomeDiscountBannerModel(BaseModel):
    """
    Schema for the promotional highlight banner on the homepage.
    """
    image: str = Field(default="/assets/home/discount-banner.png")
    title: str = Field(default="Season of Radiance")
    subtitle: str = Field(default="Limited time offers on our signature collections.")
    discountText: str = Field(default="UP TO 50% OFF")
    buttonText: str = Field(default="Claim Offer")
    buttonLink: str = Field(default="/offers")
    endDate: Optional[str] = Field(default=None)
    isActive: bool = Field(default=True)

class HomeInstagramModel(BaseModel):
    """
    Schema for the Instagram feed integration.
    """
    profileHandle: str = Field(default="@hk_digiverse")
    description: str = Field(default="Explore our latest innovations and milestones.")

class InstagramPostModel(BaseModel):
    """
    Model for an individual manual Instagram post or reel entry.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    type: str = Field(default="post") # post or reel
    imageUrl: str = Field(...)
    postUrl: str = Field(...)
    caption: Optional[str] = Field(default=None)
    order: int = Field(default=0)
    isActive: bool = Field(default=True)
    createdAt: Optional[str] = None

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "type": "reel",
                "imageUrl": "https://...",
                "postUrl": "https://instagram.com/reels/...",
                "order": 1
            }
        }

class UpdateInstagramPostModel(BaseModel):
    """
    Schema for updating individual manual Instagram entries.
    """
    type: Optional[str] = None
    imageUrl: Optional[str] = None
    postUrl: Optional[str] = None
    caption: Optional[str] = None
    order: Optional[int] = None
    isActive: Optional[bool] = None

class HomeSettingsModel(BaseModel):
    """
    Unified model for all homepage settings and dynamic content.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    heroSlides: List[HeroSlideModel] = Field(default_factory=list)
    trendingTitle: str = Field(default="Trending Now")
    trendingSubtitle: str = Field(default="Curated selection of our most sought-after rituals.")
    categoriesTitle: str = Field(default="Shop by Category")
    newArrivalsTitle: str = Field(default="New Arrivals")
    newArrivalsSubtitle: str = Field(default="The latest additions to our sanctuary.")
    brandStory: HomeBrandStoryModel = Field(...)
    discountBanner: HomeDiscountBannerModel = Field(...)
    instagram: HomeInstagramModel = Field(...)
    seo: Optional[SEOModel] = Field(default=None)
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True

class NewsletterSubModel(BaseModel):
    """
    Schema for newsletter subscribers.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    email: str = Field(...)
    subscribedAt: str = Field(...)

    class Config:
        populate_by_name = True

class NewsletterEmailSettingsModel(BaseModel):
    """
    Model for managing the content and sender details of the newsletter welcome email.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    fromName: str = Field(default="Luscent Glow")
    fromEmail: str = Field(default="hello@luscentglow.com")
    subject: str = Field(default="Your Invitation to Radiance")
    headline: str = Field(default="The Ritual Begins")
    body1: str = Field(default="We are honored to welcome you to the Luscent Glow sanctuary. You have entered a curated space where botanical alchemy meets modern science to unveil the authentic brilliance of your skin.")
    body2: str = Field(default="As a cherished member of our inner circle, you will now receive priority access to our artisanal small-batch launches, intimate beauty philosophies, and exclusive invitations reserved for those who prioritize their glow.")
    buttonText: str = Field(default="Begin Your Ritual")
    quote: str = Field(default='"In the pursuit of light, we find our most authentic selves."')
    
    # SMTP Configuration
    smtpHost: str = Field(default="smtp.gmail.com")
    smtpPort: int = Field(default=587)
    smtpUser: str = Field(default="")
    smtpPassword: str = Field(default="")
    
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "fromName": "Luscent Glow",
                "fromEmail": "hello@luscentglow.com",
                "subject": "Your Invitation to Radiance",
                "headline": "The Ritual Begins",
                "body1": "We are honored...",
                "body2": "As a cherished member...",
                "buttonText": "Begin Your Ritual",
                "quote": "\"In the pursuit of light...\""
            }
        }

class PriceFilterModel(BaseModel):
    label: str
    min: float
    max: float



class PaymentCredentialsModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    activeGateway: str = Field(default="razorpay")
    keyId: str = Field(default="")
    keySecret: str = Field(default="")
    mode: str = Field(default="sandbox")
    cashfreeAppId: str = Field(default="")
    cashfreeSecretKey: str = Field(default="")
    cashfreeMode: str = Field(default="sandbox")
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True

class ShiprocketCredentialsModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    shiprocketEmail: str = Field(default="")
    shiprocketPassword: str = Field(default="")
    shiprocketPickupLocation: str = Field(default="Primary")
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True

class SmtpCredentialsModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    smtpHost: str = Field(default="smtp.gmail.com")
    smtpPort: int = Field(default=587)
    smtpUser: str = Field(default="")
    smtpPassword: str = Field(default="")
    smtpFromEmail: str = Field(default="")
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True

class CouponModel(BaseModel):
    """
    Schema for promotional discount coupons.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    code: str = Field(...)
    discountType: str = Field(...) # percentage, fixed, shipping
    value: float = Field(..., ge=0)
    minPurchase: float = Field(default=0, ge=0)
    expiryDate: str = Field(...)
    description: Optional[str] = Field(default=None)
    isActive: bool = Field(default=True)
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "code": "GLOW20",
                "discountType": "percentage",
                "value": 20,
                "minPurchase": 1000,
                "expiryDate": "2026-05-31",
                "isActive": True
            }
        }

class UpdateCouponModel(BaseModel):
    """
    Schema for updating coupons.
    """
    code: Optional[str] = None
    discountType: Optional[str] = None
    value: Optional[float] = None
    minPurchase: Optional[float] = None
    expiryDate: Optional[str] = None
    description: Optional[str] = None
    isActive: Optional[bool] = None

class QuizSubmissionModel(BaseModel):
    """
    Model for Radiance Ritual Consultation (Skin Quiz) results.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    skinType: str
    concern: str
    routine: str
    recommendedProductIds: List[str] = Field(default_factory=list)
    userName: Optional[str] = Field(default="Anonymous")
    userEmail: Optional[str] = Field(default=None)
    createdAt: str # ISO String

    class Config:
        populate_by_name = True

class QuizOptionModel(BaseModel):
    """
    Sub-schema for individual quiz options with recommendation mapping.
    """
    id: str
    label: str
    sub: Optional[str] = None
    icon: Optional[str] = None
    recommendedTag: Optional[str] = None

class QuizStepModel(BaseModel):
    """
    Model for dynamic Consultation steps (questions).
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    stepId: str # e.g. "skinType"
    question: str
    options: List[QuizOptionModel]
    order: int

    class Config:
        populate_by_name = True
