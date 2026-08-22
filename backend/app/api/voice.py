import os
import tempfile
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.config import settings
from app.core.database import get_db
from app.services.groq_service import groq_parser
from app.services.fallback_parser import parse_fallback_intent
from app.services.item_resolver import resolve_catalog_item
from app.services.whisper_service import transcribe_audio_file
from app.services.emotion_service import compute_fused_urgency
from app.api.list import add_item_to_list, ItemCreateSchema, delete_item, update_item, ItemUpdateSchema
from app.models.shopping_list import ShoppingListItem
from app.models.action_log import ActionLog

router = APIRouter(prefix="/voice", tags=["voice"])

class VoiceTextRequest(BaseModel):
    transcript: str

@router.post("/process")
async def process_voice_command(
    transcript: Optional[str] = Form(None),
    context_product: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    text = transcript or ""
    temp_audio_path = None

    # Handle Audio Blob input if present
    if audio:
        try:
            suffix = os.path.splitext(audio.filename)[1] or ".wav"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                content = await audio.read()
                tmp.write(content)
                temp_audio_path = tmp.name
            
            if not text:
                whisper_res = transcribe_audio_file(temp_audio_path)
                text = whisper_res.get("transcript", "")
        except Exception as e:
            print(f"Audio processing fallback: {e}")

    if not text or not text.strip():
        return {
            "success": False,
            "confidence": 0.0,
            "needs_clarification": True,
            "clarifying_question": "I couldn't hear or understand that clearly. Could you please repeat your request?",
            "spoken_text": "I couldn't hear that clearly. Could you please repeat?"
        }

    # 1. Emotion Prosody & Text Urgency Analysis
    emotion_res = compute_fused_urgency(audio_path=temp_audio_path, text=text)
    urgency_score = emotion_res["urgency_score"]

    # 2. Intent & Slot Extraction (Groq API -> Fallback Parser)
    parsed_intent = groq_parser.parse_intent(text)
    if not parsed_intent or not parsed_intent.get("intent") or parsed_intent.get("intent") == "UNKNOWN":
        parsed_intent = parse_fallback_intent(text)

    intent_type = parsed_intent.get("intent", "UNKNOWN")
    raw_item_name = parsed_intent.get("item_name", "").strip()
    quantity = parsed_intent.get("quantity", 1.0)
    unit = parsed_intent.get("unit", "item")
    intent_confidence = parsed_intent.get("confidence", 0.8)

    # Clean up temp audio file
    if temp_audio_path and os.path.exists(temp_audio_path):
        try:
            os.remove(temp_audio_path)
        except Exception:
            pass

    # Handle CONFIRM / Affirmation intent (User saying "yes", "haan", "sure")
    if intent_type == "CONFIRM":
        target_name = context_product or raw_item_name
        if target_name:
            matched_product, _ = resolve_catalog_item(target_name, db)
            resolved_name = matched_product.name if matched_product else target_name.title()
            resolved_pid = matched_product.id if matched_product else None
            resolved_cat = matched_product.category if matched_product else "General"
            
            create_payload = ItemCreateSchema(
                product_id=resolved_pid,
                product_name=resolved_name,
                category=resolved_cat,
                quantity=1.0,
                unit="item"
            )
            res = await add_item_to_list(create_payload, db)
            spoken = f"Added {resolved_name} to your list."
            return {
                "success": True,
                "action": "ADD_ITEM",
                "confidence": 0.95,
                "needs_clarification": False,
                "item": res.get("item"),
                "spoken_text": spoken,
                "urgency_score": urgency_score
            }

    # Handle CLEAR_LIST intent
    if intent_type == "CLEAR_LIST":
        items = db.query(ShoppingListItem).all()
        if items:
            snapshot = [{"product_name": i.product_name, "category": i.category, "quantity": i.quantity} for i in items]
            db.query(ShoppingListItem).delete()
            log = ActionLog(action_type="CLEAR", item_id=None, previous_state=str(snapshot), new_state=None)
            db.add(log)
            db.commit()
        return {
            "success": True,
            "action": "CLEAR_LIST",
            "confidence": intent_confidence,
            "needs_clarification": False,
            "spoken_text": "Cleared all items from your shopping list." if urgency_score < 0.65 else "Cleared list.",
            "urgency_score": urgency_score
        }

    # If no item extracted
    if not raw_item_name:
        return {
            "success": False,
            "confidence": 0.3,
            "needs_clarification": True,
            "clarifying_question": "Which grocery item would you like to add or modify in your list?",
            "spoken_text": "Which item would you like to add or remove?"
        }

    # 3. Item Resolution against Catalog (rapidfuzz + sentence-transformers)
    matched_product, match_score = resolve_catalog_item(raw_item_name, db)

    # Calculate overall confidence score
    if matched_product and match_score >= 0.50:
        overall_confidence = max(0.75, round(0.4 * intent_confidence + 0.6 * match_score, 2))
    else:
        overall_confidence = round(0.5 * intent_confidence + 0.5 * match_score, 2)

    # 4. Confidence Threshold Check (< 0.65 -> Ask Clarifying Question)
    if overall_confidence < settings.CONFIDENCE_THRESHOLD:
        product_suggestion = matched_product.name if matched_product else raw_item_name
        clarifying_q = f"Did you mean {product_suggestion}?" if matched_product else f"Did you mean to add {raw_item_name}?"
        return {
            "success": False,
            "confidence": overall_confidence,
            "needs_clarification": True,
            "intent": intent_type,
            "raw_item_name": raw_item_name,
            "suggested_product": product_suggestion,
            "clarifying_question": clarifying_q,
            "spoken_text": clarifying_q,
            "urgency_score": urgency_score
        }

    # 5. Execute Action
    resolved_name = matched_product.name if matched_product else raw_item_name.title()
    resolved_product_id = matched_product.id if matched_product else None
    resolved_category = matched_product.category if matched_product else "General"

    if intent_type == "ADD_ITEM":
        create_payload = ItemCreateSchema(
            product_id=resolved_product_id,
            product_name=resolved_name,
            category=resolved_category,
            quantity=quantity,
            unit=unit
        )
        res = await add_item_to_list(create_payload, db)
        spoken = f"Added {quantity:g} {unit} {resolved_name} to your list." if urgency_score < 0.65 else f"Added {resolved_name}."
        return {
            "success": True,
            "action": "ADD_ITEM",
            "confidence": overall_confidence,
            "needs_clarification": False,
            "item": res.get("item"),
            "spoken_text": spoken,
            "urgency_score": urgency_score
        }

    elif intent_type == "REMOVE_ITEM":
        existing = db.query(ShoppingListItem).filter(
            ShoppingListItem.product_name.ilike(f"%{raw_item_name}%")
        ).first()
        if existing:
            await delete_item(existing.id, db)
            spoken = f"Removed {existing.product_name} from your list." if urgency_score < 0.65 else f"Removed {existing.product_name}."
            return {
                "success": True,
                "action": "REMOVE_ITEM",
                "confidence": overall_confidence,
                "needs_clarification": False,
                "item_id": existing.id,
                "spoken_text": spoken,
                "urgency_score": urgency_score
            }
        else:
            return {
                "success": False,
                "confidence": overall_confidence,
                "needs_clarification": True,
                "clarifying_question": f"Could not find {raw_item_name} in your list to remove.",
                "spoken_text": f"{raw_item_name} is not in your list."
            }

    return {
        "success": True,
        "action": intent_type,
        "confidence": overall_confidence,
        "needs_clarification": False,
        "item_name": resolved_name,
        "spoken_text": f"Processed {intent_type} for {resolved_name}.",
        "urgency_score": urgency_score
    }
