import os
import json
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models import Product, ShoppingListItem, ActionLog, EmotionLog
from app.api import products_router, list_router, voice_router, suggestions_router, emotion_router, socket_app
from app.services.chromadb_service import chroma_service

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(products_router, prefix=settings.API_V1_STR)
app.include_router(list_router, prefix=settings.API_V1_STR)
app.include_router(voice_router, prefix=settings.API_V1_STR)
app.include_router(suggestions_router, prefix=settings.API_V1_STR)
app.include_router(emotion_router, prefix=settings.API_V1_STR)

# Mount Socket.IO App
app.mount("/socket.io", socket_app)

@app.on_event("startup")
def startup_db_seed():
    db = SessionLocal()
    try:
        # Check if products table is empty
        count = db.query(Product).count()
        products_json_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "products.json")
        
        if count == 0 and os.path.exists(products_json_path):
            print("Seeding catalog into Database and ChromaDB vector store...")
            with open(products_json_path, "r", encoding="utf-8") as f:
                products_data = json.load(f)

            db_products = [
                Product(
                    id=p["id"],
                    name=p["name"],
                    category=p["category"],
                    sub_category=p.get("sub_category", ""),
                    brand=p.get("brand", ""),
                    sale_price=p["sale_price"],
                    market_price=p["market_price"],
                    type=p.get("type", ""),
                    rating=p.get("rating", 4.2),
                    description=p.get("description", ""),
                    stock_status=p.get("stock_status", "in_stock"),
                    image_url=p.get("image_url", "")
                )
                for p in products_data
            ]
            db.bulk_save_objects(db_products)
            db.commit()
            print(f"Database seeded with {len(db_products)} products.")

            # Seed ChromaDB
            chroma_service.seed_products(products_data)
        elif count > 0:
            print(f"Database already populated with {count} products.")
    except Exception as e:
        print(f"Startup DB seed warning: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "message": "Voice Command Shopping Assistant API is running",
        "docs_url": "/docs",
        "version": settings.VERSION
    }
