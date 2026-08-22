import os
import tempfile
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.emotion_log import EmotionLog
from app.services.emotion_service import compute_fused_urgency

router = APIRouter(prefix="/emotion", tags=["emotion"])

@router.post("/analyze")
async def analyze_emotion(
    text: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    temp_path = None
    if audio:
        try:
            suffix = os.path.splitext(audio.filename)[1] or ".wav"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                content = await audio.read()
                tmp.write(content)
                temp_path = tmp.name
        except Exception as e:
            print(f"Audio file save error: {e}")

    try:
        results = compute_fused_urgency(audio_path=temp_path, text=text or "")
        
        # Log to Database
        log = EmotionLog(
            pitch_variance=results["pitch_variance"],
            energy=results["energy"],
            speaking_rate=results["speaking_rate"],
            text_urgency=results["text_urgency"],
            urgency_score=results["urgency_score"],
            transcript=text
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        return {
            "id": log.id,
            "metrics": results,
            "fused_urgency_score": results["urgency_score"],
            "recommended_tone": results["recommended_tone"]
        }
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
