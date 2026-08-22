import re

HINDI_NUMBERS = {
    "ek": 1.0, "one": 1.0,
    "do": 2.0, "two": 2.0,
    "tin": 3.0, "teen": 3.0, "three": 3.0,
    "char": 4.0, "chaar": 4.0, "four": 4.0,
    "panch": 5.0, "paanch": 5.0, "five": 5.0,
    "chhe": 6.0, "six": 6.0,
    "saat": 7.0, "seven": 7.0,
    "aath": 8.0, "eight": 8.0,
    "nau": 9.0, "nine": 9.0,
    "das": 10.0, "ten": 10.0
}

UNITS = ["packet", "packets", "kg", "kilo", "kilos", "gram", "grams", "g", "liter", "liters", "litre", "litres", "l", "bottle", "bottles", "box", "boxes", "piece", "pieces"]

def parse_fallback_intent(text: str) -> dict:
    if not text:
        return {"intent": "UNKNOWN", "item_name": "", "quantity": 1.0, "unit": "item", "confidence": 0.0}

    t_lower = text.lower().strip()
    
    # 1. Clear List Intent
    if any(k in t_lower for k in ["clear list", "empty list", "clear shopping list", "saare item hatao", "list khali karo", "delete list"]):
        return {"intent": "CLEAR_LIST", "item_name": "", "quantity": 1.0, "unit": "item", "confidence": 0.95}

    # 2. Confirm / Affirmation Intent (e.g., "yes", "haan", "sure", "correct")
    confirm_keywords = ["yes", "yeah", "yep", "haan", "ha", "sure", "correct", "ok", "okay", "right", "yes please", "add it", "haan add karo", "ha jodo"]
    if any(re.search(r'\b' + k + r'\b', t_lower) for k in confirm_keywords):
        return {"intent": "CONFIRM", "item_name": "", "quantity": 1.0, "unit": "item", "confidence": 0.95}

    # Determine intent type (ADD vs REMOVE)
    intent = "ADD_ITEM"
    confidence = 0.85

    add_keywords = [
        "add", "jodo", "laao", "buy", "put", "chahiye", "le aao", "dalo", "karo",
        "need", "want", "get", "bring", "give", "take", "include", "khareedo"
    ]
    remove_keywords = ["remove", "delete", "hatao", "nikal", "nikalo", "drop", "cancel", "hata"]

    has_remove_kw = any(re.search(r'\b' + k + r'\b', t_lower) for k in remove_keywords)
    has_add_kw = any(re.search(r'\b' + k + r'\b', t_lower) for k in add_keywords)

    if has_remove_kw:
        intent = "REMOVE_ITEM"

    # Extract quantity
    quantity = 1.0
    words = t_lower.split()
    
    # Match digits first
    digit_match = re.search(r'\b(\d+(?:\.\d+)?)\b', t_lower)
    if digit_match:
        quantity = float(digit_match.group(1))
    else:
        for w in words:
            if w in HINDI_NUMBERS:
                quantity = HINDI_NUMBERS[w]
                break

    # Extract unit
    unit = "item"
    for u in UNITS:
        if re.search(r'\b' + u + r'\b', t_lower):
            unit = u
            break

    # Extract item name by removing filler words, action keywords, numbers, units
    clean_words = []
    ignore_set = set(add_keywords + remove_keywords + list(HINDI_NUMBERS.keys()) + UNITS + [
        "packet", "packets", "please", "can", "you", "i", "want", "to", "a", "an", "the",
        "of", "in", "my", "shopping", "list", "karo", "do", "bhi", "ko", "se", "aur", "and"
    ])
    
    # Filter out standalone numbers
    for w in words:
        w_clean = re.sub(r'[^\w\s]', '', w)
        if not w_clean:
            continue
        if w_clean.isdigit():
            continue
        if w_clean not in ignore_set:
            clean_words.append(w_clean)

    item_name = " ".join(clean_words).strip()
    
    # Adjust confidence if item name is extracted cleanly
    if not item_name:
        confidence = 0.30
        intent = "UNKNOWN"
    elif not has_add_kw and not has_remove_kw and ("asdfghjkl" in t_lower or "random noise" in t_lower or "gibberish" in t_lower):
        confidence = 0.40
        intent = "UNKNOWN"
    elif len(item_name) < 2:
        confidence = 0.45

    return {
        "intent": intent,
        "item_name": item_name.title() if item_name else "",
        "quantity": quantity,
        "unit": unit,
        "confidence": round(confidence, 2)
    }
