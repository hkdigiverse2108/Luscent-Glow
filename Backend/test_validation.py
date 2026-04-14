from app.models import ProductModel
import json

data = {
    "name": "Test Product",
    "brand": "Brand",
    "price": 0,
    "rating": 5,
    "reviewCount": 0,
    "image": "test.jpg",
    "category": "test",
    "tags": ["test"],
    "variants": [
        {"id": "v1", "color": "Red", "size": "50ml", "price": 1200, "stock": 10}
    ]
}

try:
    p = ProductModel(**data)
    print("Validation Successful")
except Exception as e:
    print(f"Validation Failed: {e}")
