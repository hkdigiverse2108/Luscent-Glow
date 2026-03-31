from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_connection = Database()

async def get_database():
    """
    Dependency to get the MongoDB database instance.
    """
    return db_connection.db

async def connect_to_mongo():
    """
    Initialize connection to MongoDB during app startup.
    """
    db_connection.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db_connection.db = db_connection.client[settings.DATABASE_NAME]
    print(f"Connected to MongoDB at {settings.MONGODB_URL}")

async def close_mongo_connection():
    """
    Close MongoDB connection during app shutdown.
    """
    if db_connection.client:
        db_connection.client.close()
        print("MongoDB connection closed.")
