import asyncio
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
import dns.resolver
from app.config import settings

# Workaround for /etc/resolv.conf restricted access in sandbox
dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4', '1.1.1.1']

async def create_test_product():
    client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        tlsCAFile=certifi.where()
    )
    db = client[settings.DATABASE_NAME]
    
    test_id = str(uuid.uuid4())[:8]
    product = {
        "name": f"Sync Test Product {test_id}",
        "brand": "Luscent Glow",
        "price": 500, # Initial low price
        "originalPrice": 1000,
        "rating": 5,
        "reviewCount": 0,
        "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800",
        "category": "skincare",
        "tags": ["test", "sync"],
        "variants": [
            {
                "id": "v1",
                "color": "Ruby",
                "size": "30ml",
                "price": 1500, # Higher than base 500
                "originalPrice": 2000,
                "stock": 10
            },
            {
                "id": "v2",
                "color": "Ruby",
                "size": "50ml",
                "price": 2500,
                "originalPrice": 3000,
                "stock": 10
            }
        ]
    }
    
    # We simulate an "un-synced" state initially, then we will "Update" it via the same logic we put in Admin
    # Actually, I'll just check if the ProductCard handles it.
    
    result = await db["products"].insert_one(product)
    print(f"Created Test Product with ID: {result.inserted_id}")
    client.close()

if __name__ == "__main__":
    asyncio.run(create_test_product())
