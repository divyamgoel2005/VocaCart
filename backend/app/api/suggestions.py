from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.shopping_list import ShoppingListItem
from app.services.recommendation import get_usually_bought_together, get_probably_running_low, get_item_substitutes

router = APIRouter(prefix="/suggestions", tags=["suggestions"])

@router.get("/co-occurrence")
def suggestions_co_occurrence(db: Session = Depends(get_db)):
    active_items = db.query(ShoppingListItem).all()
    pids = [item.product_id for item in active_items if item.product_id]
    
    recommendations = get_usually_bought_together(pids, db, limit=6)
    return {
        "type": "co_occurrence",
        "title": "Usually Bought Together",
        "items": recommendations
    }

@router.get("/running-low")
def suggestions_running_low(db: Session = Depends(get_db)):
    recommendations = get_probably_running_low(db, limit=6)
    return {
        "type": "running_low",
        "title": "Probably Running Low",
        "items": recommendations
    }

@router.get("/substitutes")
def suggestions_substitutes(
    product_id: Optional[int] = Query(None, description="Product ID to find substitutes for"),
    db: Session = Depends(get_db)
):
    if not product_id:
        # Pick first active item product_id or default item
        first_item = db.query(ShoppingListItem).filter(ShoppingListItem.product_id.isnot(None)).first()
        product_id = first_item.product_id if first_item else 1

    recommendations = get_item_substitutes(product_id, db, limit=6)
    return {
        "type": "substitutes",
        "title": "Smart Substitutes",
        "product_id": product_id,
        "items": recommendations
    }
