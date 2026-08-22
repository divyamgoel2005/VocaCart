import os
import json
import logging
from app.core.config import settings

logger = logging.getLogger("chromadb_service")

class ChromaService:
    def __init__(self):
        self.client = None
        self.collection = None
        self._init_chroma()

    def _init_chroma(self):
        try:
            import chromadb
            os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
            self.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
            self.collection = self.client.get_or_create_collection(name="products_catalog")
            print("ChromaDB persistent collection initialized.")
        except Exception as e:
            logger.warning(f"ChromaDB initialization failed: {e}")

    def seed_products(self, products_list: list):
        if not self.collection or not products_list:
            return

        try:
            existing_count = self.collection.count()
            if existing_count >= len(products_list):
                return

            ids = [str(p["id"]) for p in products_list]
            documents = [f"{p['name']} {p.get('brand', '')} {p.get('category', '')} {p.get('sub_category', '')} {p.get('description', '')}" for p in products_list]
            metadatas = [
                {
                    "product_id": p["id"],
                    "name": p["name"],
                    "category": p["category"],
                    "sub_category": p.get("sub_category", ""),
                    "brand": p.get("brand", ""),
                    "sale_price": float(p.get("sale_price", 0.0))
                }
                for p in products_list
            ]

            # Batch add
            batch_size = 200
            for i in range(0, len(ids), batch_size):
                self.collection.upsert(
                    ids=ids[i:i+batch_size],
                    documents=documents[i:i+batch_size],
                    metadatas=metadatas[i:i+batch_size]
                )
            print(f"Seeded {len(ids)} products into ChromaDB vector store.")
        except Exception as e:
            logger.error(f"Failed seeding ChromaDB: {e}")

    def find_substitutes(self, query_text: str, category: str = None, limit: int = 5):
        if not self.collection:
            return []

        try:
            where_clause = {"category": category} if category else None
            results = self.collection.query(
                query_texts=[query_text],
                n_results=limit,
                where=where_clause
            )

            substitutes = []
            if results and "metadatas" in results and len(results["metadatas"]) > 0:
                for meta in results["metadatas"][0]:
                    substitutes.append(meta)
            return substitutes
        except Exception as e:
            logger.error(f"ChromaDB query failed: {e}")
            return []

chroma_service = ChromaService()
