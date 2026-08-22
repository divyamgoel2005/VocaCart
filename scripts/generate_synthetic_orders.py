import os
import json
import random

PRODUCTS_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "products.json")
ORDERS_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "orders.json")

# Realistic co-purchase rules: keyword -> associated keywords
CO_PURCHASE_RULES = [
    (["Bread", "Garlic Bread"], ["Butter", "Cheese", "Jam"]),
    (["Maggi", "Noodles"], ["Ketchup", "Sauce", "Cheese"]),
    (["Tea", "Coffee"], ["Milk", "Biscuits", "Sugar"]),
    (["Pasta"], ["Sauce", "Cheese", "Olive Oil"]),
    (["Milk"], ["Cereal", "Oats", "Bread"]),
    (["Atta"], ["Toor Dal", "Moong Dal", "Rice", "Ghee"]),
    (["Shampoo"], ["Conditioner", "Bathing Bar", "Soap"]),
    (["Detergent"], ["Fabric Care", "Vim Dishwash", "Surface Cleaner"]),
    (["Chips", "Kurkure", "Nachos"], ["Soft Drink", "Coca-Cola", "Sprite"])
]

def generate_synthetic_orders():
    print("Generating synthetic session-level order histories...")
    if not os.path.exists(PRODUCTS_JSON_PATH):
        print("Products dataset not found. Running download_dataset.py first...")
        from download_dataset import generate_synthetic_catalog
        generate_synthetic_catalog()

    with open(PRODUCTS_JSON_PATH, "r", encoding="utf-8") as f:
        products = json.load(f)

    # Index products by keyword
    keyword_map = {}
    for p in products:
        name_lower = p["name"].lower()
        for primary_keys, target_keys in CO_PURCHASE_RULES:
            for pk in primary_keys:
                if pk.lower() in name_lower:
                    keyword_map.setdefault(pk, []).append(p)
            for tk in target_keys:
                if tk.lower() in name_lower:
                    keyword_map.setdefault(tk, []).append(p)

    orders = []
    num_sessions = 1200

    for session_id in range(1, num_sessions + 1):
        session_items = []
        
        # Pick 1 to 3 seed rules
        chosen_rules = random.sample(CO_PURCHASE_RULES, k=random.randint(1, 3))
        for primary_keys, target_keys in chosen_rules:
            # Pick a primary item
            pk = random.choice(primary_keys)
            if pk in keyword_map and keyword_map[pk]:
                p_item = random.choice(keyword_map[pk])
                if p_item["id"] not in [x["product_id"] for x in session_items]:
                    session_items.append({
                        "product_id": p_item["id"],
                        "product_name": p_item["name"],
                        "category": p_item["category"],
                        "quantity": random.randint(1, 3)
                    })
            
            # High probability (85%) of adding co-purchased item
            if random.random() < 0.85:
                tk = random.choice(target_keys)
                if tk in keyword_map and keyword_map[tk]:
                    t_item = random.choice(keyword_map[tk])
                    if t_item["id"] not in [x["product_id"] for x in session_items]:
                        session_items.append({
                            "product_id": t_item["id"],
                            "product_name": t_item["name"],
                            "category": t_item["category"],
                            "quantity": random.randint(1, 2)
                        })

        # Add 1-2 random items to add realistic noise
        for _ in range(random.randint(0, 2)):
            rand_p = random.choice(products)
            if rand_p["id"] not in [x["product_id"] for x in session_items]:
                session_items.append({
                    "product_id": rand_p["id"],
                    "product_name": rand_p["name"],
                    "category": rand_p["category"],
                    "quantity": random.randint(1, 2)
                })

        orders.append({
            "session_id": f"SESS-{session_id:05d}",
            "items": session_items,
            "total_items": len(session_items)
        })

    os.makedirs(os.path.dirname(ORDERS_JSON_PATH), exist_ok=True)
    with open(ORDERS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(orders, f, indent=2)

    print(f"Successfully generated {len(orders)} order histories saved to {ORDERS_JSON_PATH}.")

if __name__ == "__main__":
    generate_synthetic_orders()
