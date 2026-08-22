from sqlalchemy import Column, Integer, String, Float, Text
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)
    sub_category = Column(String(100), index=True)
    brand = Column(String(100), index=True)
    sale_price = Column(Float, nullable=False)
    market_price = Column(Float, nullable=False)
    type = Column(String(100))
    rating = Column(Float, default=4.0)
    description = Column(Text)
    stock_status = Column(String(50), default="in_stock")
    image_url = Column(String(500))
