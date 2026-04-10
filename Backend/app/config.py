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

    # SMTP Settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "hello@luscentglow.com")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "Luscent Glow")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
