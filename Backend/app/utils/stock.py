from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

async def adjust_stock(db, items, direction="decrement"):
    """
    Atomically adjusts the stock levels for product variants based on order items.
    direction: "decrement" (for new orders) or "increment" (for cancellations)
    """
    if not items:
        return

    for item in items:
        product_id = item.get("productId")
        color = item.get("selectedShade")
        size = item.get("selectedSize")
        quantity = int(item.get("quantity", 1))
        
        if not product_id:
            logger.warning(f"Stock adjustment skipped: Missing productId for item {item.get('name')}")
            continue

        change = -quantity if direction == "decrement" else quantity
        
        # Prepare query - handle both string and ObjectId
        query = {"_id": product_id}
        try:
            if ObjectId.is_valid(product_id):
                query = {"$or": [{"_id": product_id}, {"_id": ObjectId(product_id)}]}
        except Exception:
            pass

        # Use arrayFilters to update the specific variant matching color and size
        # If color/size are null/empty, we match exactly that state
        try:
            update_result = await db["products"].update_one(
                query,
                {"$inc": {"variants.$[elem].stock": change}},
                array_filters=[{
                    "elem.color": color,
                    "elem.size": size
                }]
            )
            
            if update_result.modified_count == 0:
                logger.warning(f"Stock adjustment failed: Could not find matching variant for product {product_id} (Color: {color}, Size: {size})")
            else:
                logger.info(f"Stock {direction}ed for product {product_id} (Variant: {color}/{size}) by {quantity}")
                
        except Exception as e:
            logger.error(f"Critical error during stock adjustment for product {product_id}: {str(e)}")
