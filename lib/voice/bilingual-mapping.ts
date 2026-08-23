// Comprehensive Bilingual (Hindi, Hinglish, English) Mapping & Canonical Dictionary

export interface BilingualGrocery {
  canonical: string
  hindi: string[]
  english: string[]
}

export const BILINGUAL_GROCERY_MAP: BilingualGrocery[] = [
  // Vegetables
  {
    canonical: 'Tomato',
    hindi: ['tamatar', 'tamaatar', 'tamater', 'tamatr'],
    english: ['tomato', 'tomatoes', 'fresh tomato', 'red tomato'],
  },
  {
    canonical: 'Potato',
    hindi: ['aloo', 'aalu', 'batata'],
    english: ['potato', 'potatoes', 'fresh potato'],
  },
  {
    canonical: 'Onion',
    hindi: ['pyaz', 'pyaaz', 'kanda', 'pyaj'],
    english: ['onion', 'onions', 'red onion'],
  },
  {
    canonical: 'Ginger',
    hindi: ['adrak', 'aadrak', 'adrakh'],
    english: ['ginger', 'fresh ginger'],
  },
  {
    canonical: 'Garlic',
    hindi: ['lehsun', 'lahsun', 'lasan'],
    english: ['garlic', 'fresh garlic'],
  },
  {
    canonical: 'Chilli',
    hindi: ['mirch', 'mirchi', 'hari mirch', 'lal mirch'],
    english: ['chilli', 'green chilli', 'chili', 'red chilli'],
  },
  {
    canonical: 'Coriander',
    hindi: ['dhaniya', 'hara dhaniya', 'kothmir'],
    english: ['coriander', 'cilantro', 'coriander leaves'],
  },
  {
    canonical: 'Lemon',
    hindi: ['nimbu', 'neebu', 'neembu'],
    english: ['lemon', 'lime', 'lemons'],
  },
  {
    canonical: 'Spinach',
    hindi: ['palak', 'paalak'],
    english: ['spinach', 'fresh spinach'],
  },
  {
    canonical: 'Cauliflower',
    hindi: ['gobhi', 'gobi', 'phool gobi'],
    english: ['cauliflower'],
  },
  {
    canonical: 'Cabbage',
    hindi: ['patta gobi', 'band gobi'],
    english: ['cabbage', 'green cabbage'],
  },
  {
    canonical: 'Peas',
    hindi: ['matar', 'mattar'],
    english: ['peas', 'green peas', 'frozen peas'],
  },
  {
    canonical: 'Carrot',
    hindi: ['gajar', 'gaajar'],
    english: ['carrot', 'carrots', 'red carrot'],
  },
  {
    canonical: 'Cucumber',
    hindi: ['kheera', 'khira', 'kakdi'],
    english: ['cucumber', 'green cucumber'],
  },
  {
    canonical: 'Okra / Lady Finger',
    hindi: ['bhindi', 'bhendi'],
    english: ['okra', 'lady finger', 'ladyfinger'],
  },
  {
    canonical: 'Brinjal / Eggplant',
    hindi: ['baingan', 'baigan', 'bhanta'],
    english: ['brinjal', 'eggplant', 'aubergine'],
  },
  {
    canonical: 'Capsicum',
    hindi: ['shimla mirch', 'simla mirch'],
    english: ['capsicum', 'bell pepper', 'green capsicum'],
  },

  // Fresh Fruits
  {
    canonical: 'Apple',
    hindi: ['seb', 'saeb', 'sebda'],
    english: ['apple', 'apples', 'red apple', 'green apple'],
  },
  {
    canonical: 'Orange',
    hindi: ['santra', 'santre', 'narangi', 'mosambi'],
    english: ['orange', 'oranges', 'sweet lime'],
  },
  {
    canonical: 'Mango',
    hindi: ['aam', 'keri'],
    english: ['mango', 'mangoes', 'alphonso'],
  },
  {
    canonical: 'Banana',
    hindi: ['kela', 'kele'],
    english: ['banana', 'bananas', 'ripe banana'],
  },
  {
    canonical: 'Grapes',
    hindi: ['angoor', 'angur'],
    english: ['grapes', 'green grapes', 'black grapes'],
  },
  {
    canonical: 'Papaya',
    hindi: ['papita', 'papeeta'],
    english: ['papaya', 'papayas'],
  },
  {
    canonical: 'Watermelon',
    hindi: ['tarbooj', 'tarbuz', 'kalingad'],
    english: ['watermelon', 'water melon'],
  },
  {
    canonical: 'Pineapple',
    hindi: ['ananas', 'annanas'],
    english: ['pineapple', 'pine apple'],
  },
  {
    canonical: 'Pomegranate',
    hindi: ['anaar', 'anar'],
    english: ['pomegranate', 'pomegranates'],
  },
  {
    canonical: 'Guava',
    hindi: ['amrood', 'amrud'],
    english: ['guava', 'guavas'],
  },

  // Dairy & Bakery
  {
    canonical: 'Milk',
    hindi: ['doodh', 'dudh', 'dhoodh', 'duudh'],
    english: ['milk', 'cow milk', 'toned milk', 'full cream milk'],
  },
  {
    canonical: 'Butter',
    hindi: ['makkhan', 'makhan', 'maska'],
    english: ['butter', 'salted butter', 'pasteurized butter'],
  },
  {
    canonical: 'Cheese',
    hindi: ['cheese', 'cheez'],
    english: ['cheese', 'cheese cubes', 'cheese slice', 'mozzarella'],
  },
  {
    canonical: 'Paneer / Cottage Cheese',
    hindi: ['paneer', 'panir'],
    english: ['paneer', 'cottage cheese'],
  },
  {
    canonical: 'Curd / Yogurt',
    hindi: ['dahi', 'daahi'],
    english: ['curd', 'yogurt', 'dahi'],
  },
  {
    canonical: 'Eggs',
    hindi: ['anda', 'ande', 'anday'],
    english: ['eggs', 'egg', 'brown eggs', 'white eggs'],
  },
  {
    canonical: 'Bread',
    hindi: ['bread', 'pav', 'paav', 'double roti'],
    english: ['bread', 'white bread', 'brown bread', 'whole wheat bread'],
  },

  // Staples & Groceries
  {
    canonical: 'Wheat Flour / Atta',
    hindi: ['atta', 'aata', 'gehun atta', 'chakki atta'],
    english: ['flour', 'wheat flour', 'atta', 'whole wheat flour'],
  },
  {
    canonical: 'Rice',
    hindi: ['chawal', 'chaawal', 'rice'],
    english: ['rice', 'basmati rice', 'white rice', 'brown rice'],
  },
  {
    canonical: 'Pulses / Dal',
    hindi: ['dal', 'daal', 'toor dal', 'moong dal', 'chana dal', 'masoor dal', 'urad dal'],
    english: ['lentils', 'pulses', 'dal', 'toor dal', 'yellow dal'],
  },
  {
    canonical: 'Sugar',
    hindi: ['cheeni', 'chini', 'shakkar', 'sakhar'],
    english: ['sugar', 'white sugar', 'brown sugar'],
  },
  {
    canonical: 'Salt',
    hindi: ['namak', 'nimak', 'laavan'],
    english: ['salt', 'table salt', 'rock salt', 'iodized salt'],
  },
  {
    canonical: 'Cooking Oil',
    hindi: ['tel', 'tail', 'sarson tel', 'refined tel', 'ghee'],
    english: ['oil', 'cooking oil', 'mustard oil', 'sunflower oil', 'refined oil', 'ghee', 'clarified butter'],
  },
  {
    canonical: 'Tea',
    hindi: ['chai', 'chay', 'chaai', 'patti', 'chai patti'],
    english: ['tea', 'tea powder', 'black tea', 'green tea', 'tea bags'],
  },
  {
    canonical: 'Coffee',
    hindi: ['coffee', 'kofi'],
    english: ['coffee', 'instant coffee', 'ground coffee'],
  },
  {
    canonical: 'Maggi Noodles',
    hindi: ['maggi', 'magi', 'mangi', 'meggi', 'meggie', 'noodles'],
    english: ['maggi', 'maggi noodles', 'instant noodles', 'noodles'],
  },
  {
    canonical: 'Biscuits',
    hindi: ['biskit', 'biscut', 'biscuit'],
    english: ['biscuit', 'biscuits', 'cookies'],
  },
]

export const KNOWN_BRANDS = [
  'oreo', 'bourbon', 'hide & seek', 'hide and seek', 'good day', 'marie gold', 'marie',
  'monaco', 'krackjack', 'parle-g', 'parle g', 'parle', 'britannia', 'sunfeast',
  'amul', 'mother dairy', 'safal', 'nestle', 'tata', 'fortune', 'aashirvaad',
  'maggi', 'knorr', 'top ramen', 'yippee', 'lays', 'kurkure', 'bingo', 'haldiram',
  'cadbury', 'dairy milk', 'kitkat', 'snickers', 'lipton', 'taj mahal', 'red label',
  'wagh bakri', 'society', 'nescafe', 'bru', 'colgate', 'pepsodent', 'sensodyne',
  'dettol', 'lifebuoy', 'dove', 'pears', 'lux', 'surf excel', 'ariel', 'tide', 'vim',
  'harpic', 'lizol', 'patanjali', 'everest', 'mdh', 'saffola'
]

/**
 * Extracts recognized brand from product name
 */
export function extractBrand(name: string): string | null {
  if (!name) return null
  const lower = name.toLowerCase()
  for (const b of KNOWN_BRANDS) {
    const escaped = b.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    if (new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`, 'i').test(lower)) {
      return b
    }
  }
  return null
}

/**
 * Returns the canonical normalized root key for an item name.
 */
export function getCanonicalItemKey(name: string): string {
  if (!name) return ''
  const clean = name.toLowerCase().trim()

  for (const group of BILINGUAL_GROCERY_MAP) {
    for (const h of group.hindi) {
      if (clean === h || clean.split(/\s+/).includes(h)) {
        return group.canonical.toLowerCase()
      }
    }
    for (const e of group.english) {
      if (clean === e || clean.split(/\s+/).includes(e)) {
        return group.canonical.toLowerCase()
      }
    }
  }

  // Strip brand prefixes to get the core noun
  const nonBrand = clean.split(/\s+/).filter((w) => !KNOWN_BRANDS.includes(w)).join(' ')
  return (nonBrand || clean).replace(/s$/, '').replace(/es$/, '')
}

/**
 * Checks if two item names refer to the exact same grocery item across English and Hindi.
 */
export function areItemsEquivalent(name1: string, name2: string): boolean {
  if (!name1 || !name2) return false
  const n1 = name1.toLowerCase().trim()
  const n2 = name2.toLowerCase().trim()

  if (n1 === n2) return true

  const brand1 = extractBrand(n1)
  const brand2 = extractBrand(n2)

  // 1. BRAND CONFLICT RULE:
  // If both items have different explicit brands (e.g. Oreo vs Parle-G, Amul vs Mother Dairy, Tata vs Wagh Bakri),
  // they are DIFFERENT distinct products!
  if (brand1 && brand2 && brand1 !== brand2) {
    return false
  }

  // 2. If both items have the same brand, check if canonical product matches (e.g. Amul Milk vs Amul Milk, Oreo vs Oreo)
  if (brand1 && brand2 && brand1 === brand2) {
    const key1 = getCanonicalItemKey(n1)
    const key2 = getCanonicalItemKey(n2)
    return key1 === key2 || n1.includes(n2) || n2.includes(n1)
  }

  // 3. One has a brand (e.g. "Oreo Biscuits") and the other is generic (e.g. "Biscuits" without brand)
  // If brand is missing on one side, only match if the specific brand name itself was mentioned
  if ((brand1 && !brand2) || (!brand1 && brand2)) {
    const specifiedBrand = brand1 || brand2
    if (specifiedBrand && (n1.includes(specifiedBrand) && n2.includes(specifiedBrand))) {
      return true
    }
    // Generic "biscuit" should not automatically increment a branded "Oreo" if user didn't say Oreo
    const key1 = getCanonicalItemKey(n1)
    const key2 = getCanonicalItemKey(n2)
    if (key1 === 'milk' || key1 === 'atta' || key1 === 'salt') {
      return key1 === key2
    }
    return false
  }

  // 4. Neither has a brand (Fresh produce / general items like Tomato vs Tamatar)
  const key1 = getCanonicalItemKey(n1)
  const key2 = getCanonicalItemKey(n2)
  if (key1 && key2 && key1 === key2) {
    return true
  }

  return false
}
