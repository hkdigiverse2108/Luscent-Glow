import asyncio
import os
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
import dns.resolver
from app.config import settings

# Workaround for /etc/resolv.conf restricted access in sandbox
dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4', '1.1.1.1']

async def migrate_products():
    print("--- Starting Product Variants Migration ---")
    
    # Initialize connection
    client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        tlsCAFile=certifi.where()
    )
    db = client[settings.DATABASE_NAME]
    
    # Fetch all products
    products = await db["products"].find({}).to_list(1000)
    print(f"[*] Found {len(products)} products in database.")
    
    migrated_count = 0
    skipped_count = 0
    
    for product in products:
        # Check if variants already exist or if there's data to migrate
        existing_variants = product.get("variants", [])
        if existing_variants and len(existing_variants) > 0:
            skipped_count += 1
            continue
            
        shades = product.get("shades", [])
        sizes = product.get("sizes", [])
        
        if not shades and not sizes:
            skipped_count += 1
            print(f" [!] Skipping '{product.get('name')}': No shades or sizes found.")
            continue
            
        # Prepare variants
        new_variants = []
        base_price = product.get("price", 0)
        base_original_price = product.get("originalPrice")
        
        # Scenario 1: Only Shades
        if shades and not sizes:
            for shade in shades:
                new_variants.append({
                    "id": str(uuid.uuid4())[:8],
                    "color": shade,
                    "size": None,
                    "price": base_price,
                    "originalPrice": base_original_price,
                    "stock": 10,
                    "sku": f"{product.get('name')[:3].upper()}-{shade[:3].upper()}"
                })
        
        # Scenario 2: Only Sizes
        elif sizes and not shades:
            for size in sizes:
                new_variants.append({
                    "id": str(uuid.uuid4())[:8],
                    "color": None,
                    "size": size,
                    "price": base_price,
                    "originalPrice": base_original_price,
                    "stock": 10,
                    "sku": f"{product.get('name')[:3].upper()}-{size.replace(' ', '').upper()}"
                })
        
        # Scenario 3: Both (Cross product)
        elif shades and sizes:
            for shade in shades:
                for size in sizes:
                    new_variants.append({
                        "id": str(uuid.uuid4())[:8],
                        "color": shade,
                        "size": size,
                        "price": base_price,
                        "originalPrice": base_original_price,
                        "stock": 10,
                        "sku": f"{product.get('name')[:3].upper()}-{shade[:2].upper()}-{size[:2].upper()}"
                    })
        
        if new_variants:
            # Update product with variants
            await db["products"].update_one(
                {"_id": product["_id"]},
                {"$set": {"variants": new_variants}}
            )
            migrated_count += 1
            print(f" [✔] Migrated '{product.get('name')}': Created {len(new_variants)} variations.")

    print(f"\n--- Migration Complete ---")
    print(f"Migrated: {migrated_count}")
    print(f"Skipped:  {skipped_count}")
    
    client.close()

if __name__ == "__main__":
    # Ensure event loop runs correctly
    asyncio.run(migrate_products())
