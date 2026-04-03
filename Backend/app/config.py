from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "luscent_glow_db")

    # PhonePe Settings
    PHONEPE_MERCHANT_ID: str = os.getenv("PHONEPE_MERCHANT_ID", "PGTESTPAYUAT86")
    PHONEPE_SALT_KEY: str = os.getenv("PHONEPE_SALT_KEY", "96434309-7796-489d-8924-ab56988a6076")
    PHONEPE_SALT_INDEX: str = os.getenv("PHONEPE_SALT_INDEX", "1")
    PHONEPE_BASE_URL: str = os.getenv("PHONEPE_BASE_URL", "https://api-preprod.phonepe.com/apis/pg-sandbox")

    # App URLs for Redirects and Callbacks
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:5172")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
