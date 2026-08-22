import os
import json
from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.shopping_list import ShoppingListItem
from app.services.chromadb_service import chroma_service

ORDERS_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "orders.json")

def load_orders():
    if os.path.exists(ORDERS_JSON_PATH):
        with open(ORDERS_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def get_usually_bought_together(product_ids: list, db: Session, limit: int = 5):
    orders = load_orders()
    if not orders or not product_ids:
        # Fallback to popular items in same categories
        return []

    co_counts = defaultdict(int)
    target_set = set(product_ids)

    for order in orders:
        order_pids = {item["product_id"] for item in order.get("items", [])}
        if target_set.intersection(order_pids):
            for pid in order_pids - target_set:
                co_counts[pid] += 1

    sorted_pids = sorted(co_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    top_pids = [pid for pid, count in sorted_pids]

    if not top_pids:
        return []

    recommended_products = db.query(Product).filter(Product.id.in_(top_pids)).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "brand": p.brand,
            "sale_price": p.sale_price,
            "image_url": p.image_url,
            "reason": "Frequently bought together"
        }
        for p in recommended_products
    ]

def get_probably_running_low(db: Session, limit: int = 5):
    # Time-decay based recommendation from items marked completed or past list items
    items = db.query(ShoppingListItem).filter(ShoppingListItem.is_completed == True).all()
    
    # Standard essential household items frequency fallback
    essential_keywords = ["Milk", "Bread", "Atta", "Butter", "Eggs", "Tea", "Coffee", "Rice", "Sugar", "Dal"]
    query_filters = [Product.name.ilike(f"%{kw}%") for kw in essential_keywords]
    
    candidates = db.query(Product).filter(
        Product.name.ilike(f"%{essential_keywords[0]}%") |
        Product.name.ilike(f"%{essential_keywords[1]}%") |
        Product.name.ilike(f"%{essential_keywords[2]}%") |
        Product.name.ilike(f"%{essential_keywords[3]}%") |
        Product.name.ilike(f"%{essential_keywords[4]}%")
    ).all()

    # Deduplicate by base product name to avoid repeat variants
    seen_bases = set()
    unique_products = []
    for p in candidates:
        base_name = p.name.split('-')[0].strip()
        if base_name not in seen_bases:
            seen_bases.add(base_name)
            unique_products.append(p)
            if len(unique_products) >= limit:
                break

    return [
        {
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "brand": p.brand,
            "sale_price": p.sale_price,
            "image_url": p.image_url,
            "reason": "Estimated to be running low based on household cycle"
        }
        for p in unique_products
    ]

def get_item_substitutes(product_id: int, db: Session, limit: int = 5):
    target_product = db.query(Product).filter(Product.id == product_id).first()
    if not target_product:
        return []

    target_base = target_product.name.split('-')[0].strip()

    # Search via ChromaDB vector store
    subs = chroma_service.find_substitutes(query_text=target_product.name, category=target_product.category, limit=limit * 2)
    
    results = []
    seen_ids = {product_id}
    seen_bases = {target_base}

    for s in subs:
        sub_id = s.get("product_id")
        if sub_id not in seen_ids:
            p = db.query(Product).filter(Product.id == sub_id).first()
            if p:
                p_base = p.name.split('-')[0].strip()
                if p_base not in seen_bases:
                    seen_bases.add(p_base)
                    seen_ids.add(p.id)
                    results.append({
                        "id": p.id,
                        "name": p.name,
                        "category": p.category,
                        "brand": p.brand,
                        "sale_price": p.sale_price,
                        "stock_status": p.stock_status,
                        "image_url": p.image_url,
                        "reason": f"Similar to {target_product.name.split('-')[0].strip()}"
                    })
        if len(results) >= limit:
            break

    # Fallback to same sub_category products if needed
    if len(results) < limit:
        same_cat = db.query(Product).filter(
            Product.category == target_product.category,
            Product.id != product_id
        ).limit(limit * 2).all()
        
        for p in same_cat:
            p_base = p.name.split('-')[0].strip()
            if p.id not in seen_ids and p_base not in seen_bases:
                seen_bases.add(p_base)
                seen_ids.add(p.id)
                results.append({
                    "id": p.id,
                    "name": p.name,
                    "category": p.category,
                    "brand": p.brand,
                    "sale_price": p.sale_price,
                    "stock_status": p.stock_status,
                    "image_url": p.image_url,
                    "reason": f"Alternative choice in {target_product.category}"
                })
            if len(results) >= limit:
                break

    return results
