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
    english: ['milk', 'cow milk', 'toned milk', 'full cream milk', 'amul milk'],
  },
  {
    canonical: 'Butter',
    hindi: ['makkhan', 'makhan', 'maska'],
    english: ['butter', 'salted butter', 'pasteurized butter', 'amul butter'],
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
    english: ['salt', 'table salt', 'rock salt', 'iodized salt', 'tata salt'],
  },
  {
    canonical: 'Cooking Oil',
    hindi: ['tel', 'tail', 'sarson tel', 'refined tel', 'ghee'],
    english: ['oil', 'cooking oil', 'mustard oil', 'sunflower oil', 'refined oil', 'ghee', 'clarified butter'],
  },
  {
    canonical: 'Tea',
    hindi: ['chai', 'chay', 'chaai', 'patti', 'chai patti'],
    english: ['tea', 'tea powder', 'black tea', 'green tea', 'tea bags', 'tata tea'],
  },
  {
    canonical: 'Coffee',
    hindi: ['coffee', 'kofi'],
    english: ['coffee', 'instant coffee', 'ground coffee', 'nescafe'],
  },
  {
    canonical: 'Maggi Noodles',
    hindi: ['maggi', 'magi', 'mangi', 'meggi', 'meggie', 'noodles'],
    english: ['maggi', 'maggi noodles', 'instant noodles', 'noodles'],
  },
  {
    canonical: 'Biscuits',
    hindi: ['biskit', 'biscut', 'biscuit', 'parle-g'],
    english: ['biscuit', 'biscuits', 'cookies', 'parle g'],
  },
]

const BRAND_WORDS = new Set([
  'amul', 'tata', 'fortune', 'aashirvaad', 'britannia', 'nestle', 'parle',
  'fresh', 'organic', 'pure', 'mother', 'dairy', 'dettol', 'colgate', 'surf',
  'excel', 'wagh', 'bakri', 'red', 'label', 'taj', 'mahal', 'haldiram', 'patanjali',
  'packet', 'kg', 'kilo', 'litre', 'bottle', 'box', 'piece', 'pcs', 'gm', 'gram'
])

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
  const nonBrand = clean.split(/\s+/).filter(w => !BRAND_WORDS.has(w)).join(' ')
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

  const key1 = getCanonicalItemKey(n1)
  const key2 = getCanonicalItemKey(n2)

  // Direct match on canonical category (e.g. Milk === Milk, Tomato === Tomato)
  if (key1 && key2 && key1 === key2) {
    return true
  }

  // Filter out brand words and generic terms
  const coreWords1 = n1.split(/\s+/).filter(w => w.length > 2 && !BRAND_WORDS.has(w))
  const coreWords2 = n2.split(/\s+/).filter(w => w.length > 2 && !BRAND_WORDS.has(w))

  // Only consider equivalent if core product nouns match exactly
  if (coreWords1.length > 0 && coreWords2.length > 0) {
    const hasCoreMatch = coreWords1.some(w => coreWords2.includes(w))
    if (hasCoreMatch) return true
  }

  return false
}
