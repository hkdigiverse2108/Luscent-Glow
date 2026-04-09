from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    MONGODB_URL: str = os.getenv("MONGODB_URL", "")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "luscent_glow_db")

    # Razorpay Settings
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "")
    
    # Shiprocket Settings
    SHIPROCKET_EMAIL: str = os.getenv("SHIPROCKET_EMAIL", "")
    SHIPROCKET_PASSWORD: str = os.getenv("SHIPROCKET_PASSWORD", "")

    # App URLs for Redirects and Callbacks
    # IMPORTANT: In production, set these via environment variables:
    # BACKEND_URL: The public URL of your FastAPI server
    # FRONTEND_URL: The public URL of your React frontend (important for CORS and redirects)
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:5172")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
