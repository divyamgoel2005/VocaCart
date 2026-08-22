import re
import logging
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from rapidfuzz import fuzz, process
from app.models.product import Product

logger = logging.getLogger("item_resolver")

# Secondary derivative words that should only match if explicitly asked for in query
DERIVATIVE_MODIFIERS = {
    "juice", "juices", "yogurt", "yoghurt", "bun", "buns", "cake", "cakes",
    "jam", "jams", "biscuit", "biscuits", "cookie", "cookies", "chips",
    "sauce", "ketchup", "pickle", "drink", "drinks", "beverage", "shake",
    "smoothie", "candy", "flavor", "flavoured", "flavored", "bar", "spread",
    "ice cream", "puree", "paste", "syrup", "extract"
}

# Lazy load sentence transformers model
_model = None

def get_sentence_transformer():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            print("Loading sentence-transformers model (all-MiniLM-L6-v2)...")
            _model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            logger.warning(f"Could not load sentence-transformers: {e}")
            _model = False
    return _model if _model is not False else None

def resolve_catalog_item(item_query: str, db: Session) -> Tuple[Optional[Product], float]:
    if not item_query or len(item_query.strip()) == 0:
        return None, 0.0

    products = db.query(Product).all()
    if not products:
        return None, 0.0

    query_clean = item_query.lower().strip()
    filler_words = {
        "add", "buy", "get", "one", "two", "three", "four", "five", "kg",
        "kilo", "kilos", "liter", "liters", "pack", "packet", "packets",
        "item", "please", "can", "you", "i", "want", "to", "a", "an", "the",
        "of", "in", "my", "shopping", "list", "karo", "do", "ek", "do", "aur"
    }
    
    query_tokens = set(re.findall(r'\b\w+\b', query_clean))
    specific_tokens = query_tokens - filler_words
    if not specific_tokens:
        specific_tokens = query_tokens

    # Check if query explicitly contains derivative modifiers (e.g. "apple juice" contains "juice")
    query_has_modifiers = query_tokens.intersection(DERIVATIVE_MODIFIERS)

    product_names = [p.name for p in products]

    # 1. Direct and Keyword Overlap Ranking
    scored_candidates = []
    for p in products:
        p_name_words = set(re.findall(r'\b\w+\b', p.name.lower()))
        p_brand_words = set(re.findall(r'\b\w+\b', (p.brand or "").lower()))
        combined_words = p_name_words.union(p_brand_words)

        # Check if product is a derivative item (e.g. "Juice", "Yogurt", "Bun", "Ketchup")
        product_modifiers = p_name_words.intersection(DERIVATIVE_MODIFIERS)
        
        # If product is a derivative (e.g. Apple Juice) but query did NOT ask for derivative (e.g. just "Apple"):
        # Skip or heavily penalize so fresh item is preserved!
        unwanted_modifiers = product_modifiers - query_has_modifiers
        if unwanted_modifiers and not query_has_modifiers:
            continue

        matched_specific = len(specific_tokens.intersection(combined_words))
        matched_all = len(query_tokens.intersection(combined_words))

        if matched_specific > 0 or matched_all > 0:
            fuzzy_ratio = fuzz.token_set_ratio(query_clean, p.name.lower()) / 100.0
            overlap_ratio = (2.0 * matched_specific + matched_all) / float(2.0 * len(specific_tokens) + len(query_tokens))
            composite_score = (0.75 * overlap_ratio) + (0.25 * fuzzy_ratio)
            scored_candidates.append((p, composite_score, matched_specific, matched_all, fuzzy_ratio))

    if scored_candidates:
        scored_candidates.sort(key=lambda x: (x[2], x[3], x[1]), reverse=True)
        best_product, best_score, _, _, _ = scored_candidates[0]
        if best_score >= 0.35:
            match_confidence = min(0.98, round(best_score, 2))
            return best_product, match_confidence

    # 2. RapidFuzz String Matching with derivative check
    filtered_products = [
        p for p in products
        if not (set(re.findall(r'\b\w+\b', p.name.lower())).intersection(DERIVATIVE_MODIFIERS) - query_has_modifiers and not query_has_modifiers)
    ]

    if filtered_products:
        filtered_names = [p.name for p in filtered_products]
        best_fuzzy_match = process.extractOne(query_clean, filtered_names, scorer=fuzz.token_set_ratio)
        fuzzy_score = (best_fuzzy_match[1] / 100.0) if best_fuzzy_match else 0.0
        if best_fuzzy_match and fuzzy_score >= 0.70:
            matched_product_by_fuzzy = filtered_products[best_fuzzy_match[2]]
            return matched_product_by_fuzzy, round(fuzzy_score, 2)

    return None, 0.0
