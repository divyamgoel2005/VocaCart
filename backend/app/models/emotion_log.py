from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime
from app.core.database import Base

class EmotionLog(Base):
    __tablename__ = "emotion_log"

    id = Column(Integer, primary_key=True, index=True)
    pitch_variance = Column(Float, default=0.0)
    energy = Column(Float, default=0.0)
    speaking_rate = Column(Float, default=0.0)
    text_urgency = Column(Float, default=0.0)
    urgency_score = Column(Float, default=0.0)
    transcript = Column(String(500), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
