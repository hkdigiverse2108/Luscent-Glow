import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Path to the .env file in the Backend directory
env_path = os.path.join("c:/Users/HP/Downloads/Lucsent_glow/Backend", ".env")
load_dotenv(env_path)

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://HK_Digiverse:HK%40Digiverse%40123@cluster0.lcbyqbq.mongodb.net/luscent_glow_db?retryWrites=true&w=majority&appName=Cluster0")
DATABASE_NAME = os.getenv("DATABASE_NAME", "luscent_glow_db")

products = [
  {
    "name": "Velvet Matte Lipstick", "brand": "Luscent Glow", "price": 899, "originalPrice": 1299, "discount": 31,
    "rating": 4.5, "reviewCount": 2341, "category": "makeup", "tags": ["lips", "matte"],
    "image": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop",
    "shades": ["Rose Petal", "Berry Crush", "Nude Bliss", "Crimson Red"],
    "isTrending": True, "isBestSeller": True,
    "description": "A luxuriously smooth matte lipstick that glides on effortlessly, delivering rich, full-coverage color that lasts all day.",
    "ingredients": "Isododecane, Dimethicone, Trimethylsiloxysilicate, Nylon-611/Dimethicone Copolymer",
    "howToUse": "Apply directly from the bullet or use a lip brush for precision. Start from the center and work outward."
  },
  {
    "name": "Hydra Glow Serum", "brand": "Luscent Glow", "price": 1499, "originalPrice": 1999, "discount": 25,
    "rating": 4.8, "reviewCount": 1856, "category": "skincare", "tags": ["serum", "hydration"],
    "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop",
    "sizes": ["30ml", "50ml"], "isNew": True, "isTrending": True,
    "description": "An ultra-lightweight serum infused with hyaluronic acid and vitamin C for a dewy, luminous glow.",
    "ingredients": "Isododecane, Dimethicone, Trimethylsiloxysilicate, Nylon-611/Dimethicone Copolymer",
    "howToUse": "Apply directly from the bullet or use a lip brush for precision. Start from the center and work outward."
  },
  {
    "name": "Silk Foundation SPF 30", "brand": "Luscent Glow", "price": 1899, "originalPrice": 2499, "discount": 24,
    "rating": 4.6, "reviewCount": 987, "category": "makeup", "tags": ["face", "foundation"],
    "image": "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=500&h=500&fit=crop",
    "shades": ["Ivory", "Sand", "Honey", "Caramel", "Mocha", "Espresso"],
    "isBestSeller": True,
  },
  {
    "name": "Rose Gold Eyeshadow Palette", "brand": "Luscent Glow", "price": 2199, "originalPrice": 2999, "discount": 27,
    "rating": 4.7, "reviewCount": 1523, "category": "makeup", "tags": ["eyes", "palette"],
    "image": "https://images.unsplash.com/photo-1583241800698-e8ab01830a07?w=500&h=500&fit=crop",
    "isTrending": True, "isNew": True,
  },
  {
    "name": "Midnight Bloom Perfume", "brand": "Luscent Glow", "price": 3499, "originalPrice": 4499, "discount": 22,
    "rating": 4.9, "reviewCount": 743, "category": "fragrances", "tags": ["perfume", "floral"],
    "image": "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500&h=500&fit=crop",
    "sizes": ["30ml", "50ml", "100ml"], "isNew": True,
  },
  {
    "name": "Keratin Repair Shampoo", "brand": "Luscent Glow", "price": 699, "originalPrice": 899, "discount": 22,
    "rating": 4.3, "reviewCount": 2104, "category": "haircare", "tags": ["shampoo", "repair"],
    "image": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&h=500&fit=crop",
    "sizes": ["250ml", "500ml"],
  },
  {
    "name": "Vitamin C Day Cream", "brand": "Luscent Glow", "price": 1199, "originalPrice": 1599, "discount": 25,
    "rating": 4.4, "reviewCount": 1678, "category": "skincare", "tags": ["moisturizer", "vitamin-c"],
    "image": "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=500&h=500&fit=crop",
    "isBestSeller": True,
  },
  {
    "name": "Gel Nail Polish Set", "brand": "Luscent Glow", "price": 799, "originalPrice": 1099, "discount": 27,
    "rating": 4.2, "reviewCount": 892, "category": "nails", "tags": ["gel", "nail-polish"],
    "image": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=500&fit=crop",
    "shades": ["Cherry", "Blush", "Nude", "Plum", "Coral"],
  },
  {
    "name": "Body Butter — Vanilla Orchid", "brand": "Luscent Glow", "price": 599, "originalPrice": 799, "discount": 25,
    "rating": 4.6, "reviewCount": 1345, "category": "bath-body", "tags": ["body", "moisturizer"],
    "image": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&h=500&fit=crop",
    "sizes": ["200ml", "400ml"], "isTrending": True,
  },
  {
    "name": "Precision Brow Pencil", "brand": "Luscent Glow", "price": 499, "originalPrice": 699, "discount": 29,
    "rating": 4.5, "reviewCount": 2789, "category": "makeup", "tags": ["brows", "pencil"],
    "image": "https://images.unsplash.com/photo-1597225244660-1cd128c64284?w=500&h=500&fit=crop",
    "shades": ["Blonde", "Brunette", "Dark Brown", "Black"], "isBestSeller": True,
  },
  {
    "name": "Retinol Night Serum", "brand": "Luscent Glow", "price": 1799, "originalPrice": 2499, "discount": 28,
    "rating": 4.7, "reviewCount": 1102, "category": "skincare", "tags": ["serum", "anti-aging"],
    "image": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&h=500&fit=crop",
    "sizes": ["30ml", "50ml"], "isNew": True,
  },
  {
    "name": "Volumizing Mascara", "brand": "Luscent Glow", "price": 649, "originalPrice": 849, "discount": 24,
    "rating": 4.4, "reviewCount": 3201, "category": "makeup", "tags": ["eyes", "mascara"],
    "image": "https://images.unsplash.com/photo-1591360236630-4eb9b32add41?w=500&h=500&fit=crop",
    "isTrending": True, "isBestSeller": True,
  },
]

async def seed_db():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    # Delete existing products
    await db["products"].delete_many({})
    print("Cleared existing products.")
    
    # Insert new products
    result = await db["products"].insert_many(products)
    print(f"Successfully seeded {len(result.inserted_ids)} products.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_db())
