from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from .database import connect_to_mongo, close_mongo_connection
from .routes.products import router as product_router
from .routes.auth import router as auth_router
from .routes.wishlist import router as wishlist_router
from .routes.cart import router as cart_router
from .routes.contact import router as contact_router
from .routes.orders import router as orders_router
from .routes.gift_cards import router as gift_cards_router
from .routes.payments import router as payments_router
from .routes.newsletter import router as newsletter_router
from .routes.upload import router as upload_router
from .routes.categories import router as category_router
from .routes.branding import router as branding_router
from .routes.bulk_orders import router as bulk_orders_router
from .routes.about import router as about_router
from .routes.contact_settings import router as contact_settings_router
from .routes.faq import router as faq_router
from .routes.blogs import router as blogs_router
from .routes.policies import router as policy_router
from .routes.users import router as users_router
from .routes.footer import router as footer_router
from .routes.settings import router as settings_router
from .routes.home import router as home_router
from .routes.reviews import router as reviews_router
from .routes.chat import router as chat_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_to_mongo()
    
    yield
    # Shutdown: Close MongoDB connection
    await close_mongo_connection()

app = FastAPI(title="Lucsent Glow API", lifespan=lifespan)

# Enhanced CORS Sanctuary for local interoperability
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, # Standard for Bearer-token rituals to avoid origin conflicts
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add routes
app.include_router(product_router, prefix="/api", tags=["Products"])
app.include_router(auth_router, prefix="/api", tags=["Auth"])
app.include_router(wishlist_router, prefix="/api", tags=["Wishlist"])
app.include_router(cart_router, prefix="/api", tags=["Cart"])
app.include_router(contact_router, prefix="/api/contact", tags=["Contact"])
app.include_router(orders_router, prefix="/api", tags=["Orders"])
app.include_router(gift_cards_router, prefix="/api", tags=["Gift Cards"])
app.include_router(payments_router, prefix="/api", tags=["Payments"])
app.include_router(newsletter_router, prefix="/api", tags=["Newsletter"])
app.include_router(upload_router, prefix="/api", tags=["Upload"])
app.include_router(category_router, prefix="/api", tags=["Categories"])
app.include_router(branding_router, prefix="/api", tags=["Branding"])
app.include_router(bulk_orders_router, prefix="/api", tags=["Bulk Orders"])
app.include_router(about_router, prefix="/api", tags=["About Us"])
app.include_router(contact_settings_router, prefix="/api", tags=["Contact Settings"])
app.include_router(faq_router, prefix="/api", tags=["FAQ"])
app.include_router(blogs_router, prefix="/api", tags=["Blogs"])
app.include_router(policy_router, prefix="/api", tags=["Policies"])
app.include_router(users_router, prefix="/api", tags=["Users"])
app.include_router(footer_router, prefix="/api", tags=["Footer"])
app.include_router(settings_router, prefix="/api", tags=["Global Settings"])
app.include_router(home_router, prefix="/api", tags=["Home Page"])
app.include_router(reviews_router, prefix="/api", tags=["Reviews"])
app.include_router(chat_router, prefix="/api", tags=["AI Concierge"])

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to Glow Haven API with MongoDB!"}
