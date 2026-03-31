from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import connect_to_mongo, close_mongo_connection
from .routes.products import router as product_router
from .routes.auth import router as auth_router
from .routes.wishlist import router as wishlist_router
from .routes.cart import router as cart_router
from .routes.contact import router as contact_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_to_mongo()
    yield
    # Shutdown: Close MongoDB connection
    await close_mongo_connection()

app = FastAPI(title="Glow Haven API", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add routes
app.include_router(product_router, tags=["Products"])
app.include_router(auth_router, tags=["Auth"])
app.include_router(wishlist_router, tags=["Wishlist"])
app.include_router(cart_router, tags=["Cart"])
app.include_router(contact_router, prefix="/contact", tags=["Contact"])

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to Glow Haven API with MongoDB!"}
