from app.database import get_database
import asyncio
from app.models import ProductModel
from bson import ObjectId

async def check_products():
    db = await get_database()
    products = await db["products"].find({}).to_list(1000)
    
    with_variants = []
    need_migration = []
    
    for p in products:
        # Check if variants field exists and has items
        variants = p.get("variants", [])
        has_shades = p.get("shades", [])
        has_sizes = p.get("sizes", [])
        
        if variants:
            with_variants.append(p["name"])
        elif has_shades or has_sizes:
            need_migration.append({
                "name": p["name"],
                "shades": has_shades,
                "sizes": has_sizes,
                "price": p.get("price")
            })
            
    print(f"Products already using NEW variants: {len(with_variants)}")
    for name in with_variants:
        print(f" - {name}")
        
    print(f"\nProducts that could be migrated ({len(need_migration)}):")
    for p in need_migration:
        print(f" - {p['name']} (Shades: {len(p['shades'] or [])}, Sizes: {len(p['sizes'] or [])})")

if __name__ == "__main__":
    asyncio.run(check_products())
