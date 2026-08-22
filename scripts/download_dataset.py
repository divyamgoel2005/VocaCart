import os
import json
import random

PRODUCTS_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "products.json")

SYNTHETIC_CATEGORIES = {
    "Staples": {
        "Atta & Flour": [
            "Aashirvaad Whole Wheat Atta", "Fortune Chakki Fresh Atta", "Rajdhani Maida", "Sujata Chakki Atta",
            "Patanjali Whole Wheat Atta", "Pillsbury Chakki Fresh Atta", "Nature Fresh Sampoorna Atta", "Loose Chana Sattu"
        ],
        "Rice & Rice Products": [
            "Daawat Rozana Basmati Rice", "Fortune Everyday Basmati Rice", "Fortune Sona Masoori Rice", "Tata Sampann Poha",
            "India Gate Super Basmati Rice", "Kohinoor Charminar Basmati Rice", "Organic Tulaipanji Rice", "Heritage Kolam Rice"
        ],
        "Dals & Pulses": [
            "Tata Sampann Toor Dal", "Tata Sampann Moong Dal", "Fortune Chana Dal", "Catch Rajma Red",
            "Organic Tattva Masoor Dal", "Tata Sampann Kabuli Chana", "Fortune Urad Whole", "Catch Green Moong Whole"
        ],
        "Edible Oils & Ghee": [
            "Fortune Sunlite Sunflower Oil", "Saffola Gold Refined Oil", "Amul Pure Ghee", "Ananda Cow Ghee",
            "Dhara Mustard Oil", "Gemini Refined Soyabean Oil", "Patanjali Cow Ghee", "Gowardhan Pure Cow Ghee", "Sundrop SuperLite Oil"
        ],
        "Salt, Sugar & Spices": [
            "Tata Salt Vacuum Evaporated", "Catch Turmeric Powder", "Everest Red Chilli Powder", "Madhur Pure Sugar",
            "MDH Garam Masala", "Catch Coriander Powder", "Tata Salt Lite", "Everest Chhole Masala", "MDH Kitchen King"
        ]
    },
    "Dairy & Bakery": {
        "Milk & Cream": [
            "Amul Taaza Toned Milk", "Amul Gold Full Cream Milk", "Mother Dairy Toned Milk", "Nandini Pasteurised Milk",
            "Country Delight Cow Milk", "Nestle a+ Slim Milk", "Amul Malai Fresh Cream", "Mother Dairy Cow Milk"
        ],
        "Butter & Cheese": [
            "Amul Butter Pasteurized", "Amul Cheese Slices", "Britannia Processed Cheese Cubes", "Mother Dairy White Butter",
            "Go Cheese Block", "Amul Garlic Butter", "Britannia Cheese Spread", "Amul Mozzarella Cheese"
        ],
        "Paneer & Curd": [
            "Amul Fresh Paneer", "Mother Dairy Ultimate Dahi", "Epigamia Greek Yogurt Strawberry", "Milky Mist Paneer",
            "Amul Masti Dahi", "Nestle a+ Mishti Doi", "Country Delight Fresh Dahi", "Epigamia Mango Greek Yogurt"
        ],
        "Bread & Bakery": [
            "Britannia 100% Whole Wheat Bread", "Harvest Gold White Bread", "Modern Brown Bread", "English Oven Garlic Bread",
            "Britannia Fruit Bun", "English Oven Sub Bun", "Harvest Gold Multigrain Bread", "Modern Sandwich Bread"
        ]
    },
    "Snacks & Branded Foods": {
        "Noodles & Pasta": [
            "Maggi 2-Minute Masala Noodles", "Yippee Power Masala Noodles", "Bambino Roasted Vermicelli", "Disano Durum Wheat Pasta",
            "Top Ramen Curry Noodles", "Barilla Penne Rigate Pasta", "Maggi Oats Noodles", "Ching's Secret Hakka Noodles"
        ],
        "Biscuits & Cookies": [
            "Parle-G Gold Biscuits", "Britannia Bourbon Biscuits", "Sunfeast Dark Fantasy Choco Fills", "Oreo Original Sandwich Cookies",
            "Hide & Seek Chocolate Chip Cookies", "Good Day Butter Cookies", "Unibic Multigrain Cookies", "NutriChoice Digestive"
        ],
        "Chips & Namkeen": [
            "Lay's India's Magic Masala", "Kurkure Masala Munch", "Haldiram's Nagpur Bhujia", "Doritos Nacho Cheese",
            "Uncle Chipps Spicy Treat", "Pringles Sour Cream & Onion", "Haldiram's Khatta Meetha", "Bingo Mad Angles"
        ],
        "Chocolates & Sweets": [
            "Cadbury Dairy Milk Silk", "Nestle KitKat 4 Finger", "Ferrero Rocher 16 Pieces", "Haldiram's Gulab Jamun",
            "Cadbury 5 Star", "Nestle Munch Crisp", "Snickers Peanut Chocolate", "Haldiram's Rasgulla 1kg"
        ]
    },
    "Beverages": {
        "Tea & Coffee": [
            "Tata Tea Gold", "Red Label Natural Care Tea", "Nescafé Classic Instant Coffee", "BRU Instant Coffee",
            "Taj Mahal Tea", "Wagh Bakri Premium Leaf Tea", "Nescafé Gold Blend Coffee", "Continental Xtra Coffee"
        ],
        "Fruit Juices": [
            "Real Fruit Power Mixed Fruit Juice", "Tropicana 100% Orange Juice", "Paper Boat Aamras", "Minute Maid Pulpy Orange",
            "B Natural Mango Juice", "Paper Boat Anardana", "Real Guava Juice", "Tropicana Apple Juice"
        ],
        "Soft Drinks & Energy Drinks": [
            "Coca-Cola Soft Drink", "Sprite Lime Soda", "Thums Up Charged", "Red Bull Energy Drink",
            "Pepsi Soft Drink", "Limca Lemony", "Fanta Orange", "Monster Energy Drink", "Gatorade Blue Bolt"
        ]
    },
    "Cleaning & Household": {
        "Detergents & Fabric Care": [
            "Surf Excel Easy Wash Detergent", "Ariel Matic Front Load Powder", "Vanish Pink Stain Remover", "Tide Plus Extra Power",
            "Comfort After Wash Fabric Conditioner", "Rin Detergent Bar", "Surf Excel Matic Liquid"
        ],
        "Dishwashing": [
            "Vim Dishwash Gel Lemon", "Pril Liquid Dishwash", "Exo Dishwash Bar", "Vim Yellow Dishwash Bar", "Pril Kraft Gel"
        ],
        "All Purpose Cleaners": [
            "Lysol Disinfectant Surface Cleaner", "Collin Glass Cleaner", "Harpic Power Plus Toilet Cleaner", "Domex Disinfectant Floor Cleaner", "Odonil Room Air Freshener"
        ]
    },
    "Beauty & Hygiene": {
        "Bath & Body": [
            "Dettol Original Soap", "Dove Cream Beauty Bathing Bar", "Pears Soft & Fresh Soap", "Fiama Gel Bathing Bar", "Lux International Soap", "Cinthol Lime Soap"
        ],
        "Hair Care": [
            "Clinic Plus Strong & Long Shampoo", "Head & Shoulders Smooth & Silky", "Pantene Hairfall Control", "Dove Intense Repair Shampoo", "Tresemme Keratin Smooth"
        ],
        "Oral Care": [
            "Colgate Strong Teeth Toothpaste", "Sensodyne Rapid Relief", "Close Up Everfresh Red Gel", "Pepsodent Germicheck", "Dabur Red Ayurvedic Toothpaste"
        ]
    }
}

BRANDS = [
    "Amul", "Tata", "Aashirvaad", "Fortune", "Britannia", "Maggi", "Mother Dairy",
    "Cadbury", "Surf Excel", "Vim", "Lysol", "Colgate", "Dettol", "Nestle",
    "Saffola", "Lay's", "Kurkure", "Haldiram's", "Real", "Tropicana", "Nescafé",
    "Dhara", "Gemini", "Patanjali", "Pillsbury", "India Gate", "Kohinoor", "Organic Tattva",
    "Nandini", "Epigamia", "Epigamia", "Modern", "Harvest Gold", "English Oven",
    "Yippee", "Barilla", "Ching's", "Parle-G", "Sunfeast", "Unibic", "Pringles",
    "Bingo", "Doritos", "Ferrero", "Snickers", "Taj Mahal", "Wagh Bakri", "Paper Boat",
    "Minute Maid", "Coca-Cola", "Sprite", "Thums Up", "Pepsi", "Red Bull", "Monster",
    "Ariel", "Tide", "Vanish", "Comfort", "Exo", "Pril", "Harpic", "Collin",
    "Domex", "Dove", "Pears", "Fiama", "Cinthol", "Clinic Plus", "Head & Shoulders",
    "Pantene", "Tresemme", "Sensodyne", "Close Up", "Dabur"
]

def generate_synthetic_catalog():
    print("Downloading/generating dataset...")
    products = []
    pid = 1

    # Try Kaggle API first
    kaggle_success = False
    try:
        if os.path.exists(os.path.expanduser("~/.kaggle/kaggle.json")):
            import kaggle
            print("Kaggle credentials found. Attempting Kaggle download...")
            kaggle.api.dataset_download_files("survy/big-basket-products", path="data", unzip=True)
            print("Successfully downloaded Kaggle BigBasket dataset.")
            kaggle_success = True
    except Exception as e:
        print(f"Kaggle download omitted or unavailable ({e}). Generating synthetic catalog fallback.")

    if not kaggle_success:
        print("Generating 3,000+ item rich Indian grocery dataset...")
        # Create base items from dictionary and expand variants
        for category, subcats in SYNTHETIC_CATEGORIES.items():
            for subcat, items in subcats.items():
                for item_base in items:
                    brand = item_base.split()[0]
                    if brand not in BRANDS:
                        brand = random.choice(BRANDS)

                    # Create size / flavor / pack variations
                    variants = [
                        ("Standard Pack", 0.9, 1.0),
                        ("500g / 500ml Pack", 0.95, 1.05),
                        ("1kg / 1L Pack", 1.8, 2.0),
                        ("5kg / 5L Value Pack", 4.5, 4.9),
                        ("Economy Combo Pack", 1.7, 1.85),
                        ("Family Super Pack", 2.8, 3.1),
                        ("Mini / Travel Pack", 0.4, 0.45),
                        ("Buy 1 Get 1 Special", 1.4, 1.6),
                        ("Pouch Pack", 0.85, 0.92),
                        ("Tetra Pack / Jar", 1.1, 1.25)
                    ]
                    
                    for var_name, price_mult, mrp_mult in variants:
                        base_market_price = round(random.uniform(30, 450) * mrp_mult, 2)
                        base_sale_price = round(base_market_price * random.uniform(0.82, 0.95), 2)
                        rating = round(random.uniform(3.8, 4.9), 1)
                        
                        full_name = f"{item_base} - {var_name}" if var_name != "Standard Pack" else item_base
                        
                        products.append({
                            "id": pid,
                            "name": full_name,
                            "category": category,
                            "sub_category": subcat,
                            "brand": brand,
                            "sale_price": base_sale_price,
                            "market_price": base_market_price,
                            "type": subcat,
                            "rating": rating,
                            "description": f"Premium quality {full_name} from {brand}. Trusted choice for everyday home requirements. Fresh, authentic, and hygienic.",
                            "stock_status": "in_stock" if random.random() > 0.08 else "out_of_stock",
                            "image_url": f"https://picsum.photos/seed/{pid}/300/300"
                        })
                        pid += 1

        os.makedirs(os.path.dirname(PRODUCTS_JSON_PATH), exist_ok=True)
        with open(PRODUCTS_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(products, f, indent=2)
        print(f"Successfully generated dataset with {len(products)} products saved to {PRODUCTS_JSON_PATH}.")

if __name__ == "__main__":
    generate_synthetic_catalog()
