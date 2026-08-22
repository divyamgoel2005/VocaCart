from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.core.database import Base

class ActionLog(Base):
    __tablename__ = "action_log"

    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String(50), nullable=False) # ADD, REMOVE, UPDATE, CLEAR
    item_id = Column(Integer, nullable=True)
    previous_state = Column(Text, nullable=True) # JSON snapshot
    new_state = Column(Text, nullable=True) # JSON snapshot
    timestamp = Column(DateTime, default=datetime.utcnow)
