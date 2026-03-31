from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "luscent_glow_db")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
