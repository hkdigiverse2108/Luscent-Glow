from fastapi import APIRouter, Query
from ..services.seo_injector import get_seo_data

router = APIRouter(prefix="/seo", tags=["SEO"])

@router.get("/data")
async def get_seo_metadata(path: str = Query(..., description="The relative path to fetch SEO data for")):
    """
    Internal endpoint used by Vite dev server to fetch SEO metadata for a given path.
    """
    data = await get_seo_data(path)
    if not data:
        return {
            "title": "Luscent Glow | Pure Botanical Radiance",
            "description": "Premium, cruelty-free botanical skincare and makeup.",
            "keywords": "skincare, beauty, botanical"
        }
    return data
