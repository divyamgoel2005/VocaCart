from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.product import Product

router = APIRouter(prefix="/products", tags=["products"])

@router.get("")
def search_products(
    q: Optional[str] = Query(None, description="Search query string"),
    category: Optional[str] = Query(None, description="Category filter"),
    brand: Optional[str] = Query(None, description="Brand filter"),
    min_price: Optional[float] = Query(None, description="Minimum sale price"),
    max_price: Optional[float] = Query(None, description="Maximum sale price"),
    stock: Optional[str] = Query(None, description="Stock status"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            Product.name.ilike(search_pattern) |
            Product.brand.ilike(search_pattern) |
            Product.category.ilike(search_pattern) |
            Product.description.ilike(search_pattern)
        )
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if brand:
        query = query.filter(Product.brand.ilike(f"%{brand}%"))
    if min_price is not None:
        query = query.filter(Product.sale_price >= min_price)
    if max_price is not None:
        query = query.filter(Product.sale_price <= max_price)
    if stock:
        query = query.filter(Product.stock_status == stock)

    total_count = query.count()
    products = query.offset(skip).limit(limit).all()

    return {
        "total": total_count,
        "skip": skip,
        "limit": limit,
        "items": [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "sub_category": p.sub_category,
                "brand": p.brand,
                "sale_price": p.sale_price,
                "market_price": p.market_price,
                "rating": p.rating,
                "stock_status": p.stock_status,
                "image_url": p.image_url,
                "description": p.description
            }
            for p in products
        ]
    }

@router.get("/{product_id}")
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return {
        "id": p.id,
        "name": p.name,
        "category": p.category,
        "sub_category": p.sub_category,
        "brand": p.brand,
        "sale_price": p.sale_price,
        "market_price": p.market_price,
        "rating": p.rating,
        "stock_status": p.stock_status,
        "image_url": p.image_url,
        "description": p.description
    }
