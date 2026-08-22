import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.shopping_list import ShoppingListItem
from app.models.product import Product
from app.models.action_log import ActionLog
from app.api.realtime import broadcast_list_update

router = APIRouter(prefix="/list", tags=["list"])

class ItemCreateSchema(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    category: Optional[str] = "General"
    quantity: float = 1.0
    unit: str = "item"

class ItemUpdateSchema(BaseModel):
    quantity: Optional[float] = None
    unit: Optional[str] = None
    is_completed: Optional[bool] = None

@router.get("")
def get_shopping_list(db: Session = Depends(get_db)):
    items = db.query(ShoppingListItem).all()
    grouped = {}
    
    for item in items:
        cat = item.category or "General"
        grouped.setdefault(cat, []).append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "category": item.category,
            "quantity": item.quantity,
            "unit": item.unit,
            "is_completed": item.is_completed,
            "created_at": item.created_at.isoformat() if item.created_at else None
        })

    return {
        "total_items": len(items),
        "categories": grouped,
        "raw_items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "category": item.category,
                "quantity": item.quantity,
                "unit": item.unit,
                "is_completed": item.is_completed
            }
            for item in items
        ]
    }

@router.post("/item")
async def add_item_to_list(payload: ItemCreateSchema, db: Session = Depends(get_db)):
    # Auto-assign category from Product if product_id or match is found
    matched_category = payload.category
    if payload.product_id:
        p = db.query(Product).filter(Product.id == payload.product_id).first()
        if p:
            matched_category = p.category

    # Check if item with same name already exists in list
    existing = db.query(ShoppingListItem).filter(
        ShoppingListItem.product_name.ilike(payload.product_name)
    ).first()

    if existing:
        prev_state = json.dumps({"quantity": existing.quantity, "is_completed": existing.is_completed})
        existing.quantity += payload.quantity
        if payload.unit:
            existing.unit = payload.unit
        db.commit()
        db.refresh(existing)
        
        new_state = json.dumps({"quantity": existing.quantity, "is_completed": existing.is_completed})
        log = ActionLog(action_type="UPDATE", item_id=existing.id, previous_state=prev_state, new_state=new_state)
        db.add(log)
        db.commit()

        item_dict = {
            "id": existing.id, "product_id": existing.product_id, "product_name": existing.product_name,
            "category": existing.category, "quantity": existing.quantity, "unit": existing.unit, "is_completed": existing.is_completed
        }
        await broadcast_list_update("UPDATE", item_dict)
        return {"status": "updated", "item": item_dict}

    new_item = ShoppingListItem(
        product_id=payload.product_id,
        product_name=payload.product_name,
        category=matched_category or "General",
        quantity=payload.quantity,
        unit=payload.unit,
        is_completed=False
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    log = ActionLog(action_type="ADD", item_id=new_item.id, previous_state=None, new_state=json.dumps({
        "product_name": new_item.product_name, "quantity": new_item.quantity, "category": new_item.category
    }))
    db.add(log)
    db.commit()

    item_dict = {
        "id": new_item.id, "product_id": new_item.product_id, "product_name": new_item.product_name,
        "category": new_item.category, "quantity": new_item.quantity, "unit": new_item.unit, "is_completed": new_item.is_completed
    }
    await broadcast_list_update("ADD", item_dict)
    return {"status": "created", "item": item_dict}

@router.put("/item/{item_id}")
async def update_item(item_id: int, payload: ItemUpdateSchema, db: Session = Depends(get_db)):
    item = db.query(ShoppingListItem).filter(ShoppingListItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Shopping list item not found")

    prev_state = json.dumps({"quantity": item.quantity, "unit": item.unit, "is_completed": item.is_completed})

    if payload.quantity is not None:
        item.quantity = payload.quantity
    if payload.unit is not None:
        item.unit = payload.unit
    if payload.is_completed is not None:
        item.is_completed = payload.is_completed

    db.commit()
    db.refresh(item)

    new_state = json.dumps({"quantity": item.quantity, "unit": item.unit, "is_completed": item.is_completed})
    log = ActionLog(action_type="UPDATE", item_id=item.id, previous_state=prev_state, new_state=new_state)
    db.add(log)
    db.commit()

    item_dict = {
        "id": item.id, "product_id": item.product_id, "product_name": item.product_name,
        "category": item.category, "quantity": item.quantity, "unit": item.unit, "is_completed": item.is_completed
    }
    await broadcast_list_update("UPDATE", item_dict)
    return {"status": "updated", "item": item_dict}

@router.delete("/item/{item_id}")
async def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(ShoppingListItem).filter(ShoppingListItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Shopping list item not found")

    prev_state = json.dumps({
        "product_id": item.product_id, "product_name": item.product_name,
        "category": item.category, "quantity": item.quantity, "unit": item.unit, "is_completed": item.is_completed
    })

    log = ActionLog(action_type="REMOVE", item_id=item.id, previous_state=prev_state, new_state=None)
    db.add(log)
    
    db.delete(item)
    db.commit()

    item_dict = {"id": item_id, "product_name": item.product_name}
    await broadcast_list_update("REMOVE", item_dict)
    return {"status": "deleted", "item_id": item_id}

@router.post("/undo")
async def undo_last_action(db: Session = Depends(get_db)):
    last_log = db.query(ActionLog).order_by(ActionLog.id.desc()).first()
    if not last_log:
        return {"status": "no_actions_to_undo", "message": "No actions recorded in log"}

    action_type = last_log.action_type
    item_id = last_log.item_id

    if action_type == "ADD":
        # Undo ADD -> delete the created item
        item = db.query(ShoppingListItem).filter(ShoppingListItem.id == item_id).first()
        if item:
            db.delete(item)
            db.delete(last_log)
            db.commit()
            await broadcast_list_update("UNDO_ADD", {"id": item_id})
            return {"status": "undone", "action": "ADD_REVERTED", "item_id": item_id}

    elif action_type == "REMOVE":
        # Undo REMOVE -> recreate item from previous_state
        if last_log.previous_state:
            prev = json.loads(last_log.previous_state)
            recreated = ShoppingListItem(
                product_id=prev.get("product_id"),
                product_name=prev.get("product_name"),
                category=prev.get("category", "General"),
                quantity=prev.get("quantity", 1.0),
                unit=prev.get("unit", "item"),
                is_completed=prev.get("is_completed", False)
            )
            db.add(recreated)
            db.delete(last_log)
            db.commit()
            db.refresh(recreated)
            item_dict = {
                "id": recreated.id, "product_id": recreated.product_id, "product_name": recreated.product_name,
                "category": recreated.category, "quantity": recreated.quantity, "unit": recreated.unit, "is_completed": recreated.is_completed
            }
            await broadcast_list_update("UNDO_REMOVE", item_dict)
            return {"status": "undone", "action": "REMOVE_REVERTED", "item": item_dict}

    elif action_type == "UPDATE":
        # Undo UPDATE -> restore previous_state
        if last_log.previous_state:
            prev = json.loads(last_log.previous_state)
            item = db.query(ShoppingListItem).filter(ShoppingListItem.id == item_id).first()
            if item:
                item.quantity = prev.get("quantity", item.quantity)
                item.unit = prev.get("unit", item.unit)
                item.is_completed = prev.get("is_completed", item.is_completed)
                db.delete(last_log)
                db.commit()
                db.refresh(item)
                item_dict = {
                    "id": item.id, "product_id": item.product_id, "product_name": item.product_name,
                    "category": item.category, "quantity": item.quantity, "unit": item.unit, "is_completed": item.is_completed
                }
                await broadcast_list_update("UNDO_UPDATE", item_dict)
                return {"status": "undone", "action": "UPDATE_REVERTED", "item": item_dict}

    elif action_type == "CLEAR":
        if last_log.previous_state:
            prev_items = json.loads(last_log.previous_state)
            recreated_items = []
            for pi in prev_items:
                ri = ShoppingListItem(
                    product_id=pi.get("product_id"),
                    product_name=pi.get("product_name"),
                    category=pi.get("category", "General"),
                    quantity=pi.get("quantity", 1.0),
                    unit=pi.get("unit", "item"),
                    is_completed=pi.get("is_completed", False)
                )
                db.add(ri)
                recreated_items.append(ri)
            db.delete(last_log)
            db.commit()
            await broadcast_list_update("UNDO_CLEAR", {})
            return {"status": "undone", "action": "CLEAR_REVERTED"}

    return {"status": "error", "message": "Could not undo action"}
