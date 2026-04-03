from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_to_mongo()
    yield
    # Shutdown: Close MongoDB connection
    await close_mongo_connection()

app = FastAPI(title="Lucsent Glow API", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to Glow Haven API with MongoDB!"}
