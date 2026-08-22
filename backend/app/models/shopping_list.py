from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from app.core.database import Base

class ShoppingListItem(Base):
    __tablename__ = "shopping_list"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, nullable=True)
    product_name = Column(String(255), nullable=False)
    category = Column(String(100), default="General")
    quantity = Column(Float, default=1.0)
    unit = Column(String(50), default="item")
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
