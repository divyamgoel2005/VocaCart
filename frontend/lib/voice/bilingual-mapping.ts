// Comprehensive Bilingual (Hindi / Hinglish <-> English) Grocery Product Mappings

export interface ItemAliasGroup {
  canonical: string
  hindi: string[]
  english: string[]
}

export const BILINGUAL_GROCERY_MAP: ItemAliasGroup[] = [
  // Fruits
  {
    canonical: 'Apple',
    hindi: ['seb', 'saeb', 'apple'],
    english: ['apple', 'apples', 'fresh apple', 'red apple', 'green apple', 'shimla apple'],
  },
  {
    canonical: 'Orange',
    hindi: ['santra', 'santre', 'narangi', 'mosambi'],
    english: ['orange', 'oranges', 'fresh orange', 'sweet lime'],
  },
  {
    canonical: 'Mango',
    hindi: ['aam', 'aam papad', 'alphonso', 'dasheri'],
    english: ['mango', 'mangoes', 'fresh mango', 'alphonso mango'],
  },
  {
    canonical: 'Banana',
    hindi: ['kela', 'kele'],
    english: ['banana', 'bananas', 'fresh banana'],
  },
  {
    canonical: 'Grapes',
    hindi: ['angoor', 'angur'],
    english: ['grapes', 'black grapes', 'green grapes'],
  },
  {
    canonical: 'Papaya',
    hindi: ['papita', 'papeeta'],
    english: ['papaya', 'fresh papaya'],
  },
  {
    canonical: 'Watermelon',
    hindi: ['tarbooj', 'tarbuj', 'kalingad'],
    english: ['watermelon', 'fresh watermelon'],
  },
  {
    canonical: 'Pineapple',
    hindi: ['ananas', 'anannas'],
    english: ['pineapple', 'fresh pineapple'],
  },
  {
    canonical: 'Pomegranate',
    hindi: ['anar', 'anaar'],
    english: ['pomegranate', 'fresh pomegranate'],
  },
  {
    canonical: 'Guava',
    hindi: ['amrood', 'amrud'],
    english: ['guava', 'fresh guava'],
  },

  // Vegetables
  {
    canonical: 'Tomato',
    hindi: ['tamatar', 'tamator', 'tamater', 'tamatarr'],
    english: ['tomato', 'tomatoes', 'fresh tomato', 'red tomato'],
  },
  {
    canonical: 'Potato',
    hindi: ['aloo', 'aaloo', 'aalu', 'alu', 'batata'],
    english: ['potato', 'potatoes', 'fresh potato'],
  },
  {
    canonical: 'Onion',
    hindi: ['pyaaz', 'pyaz', 'pyaj', 'kanda', 'gandhe'],
    english: ['onion', 'onions', 'red onion'],
  },
  {
    canonical: 'Ginger',
    hindi: ['adrak', 'aadi'],
    english: ['ginger', 'fresh ginger'],
  },
  {
    canonical: 'Garlic',
    hindi: ['lahsun', 'lehsun', 'lasan'],
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
    canonical: 'Curd / Yogurt',
    hindi: ['dahi', 'daahi'],
    english: ['curd', 'yogurt', 'yoghurt', 'plain curd'],
  },
  {
    canonical: 'Paneer',
    hindi: ['paneer', 'panir'],
    english: ['paneer', 'cottage cheese'],
  },
  {
    canonical: 'Egg',
    hindi: ['anda', 'ande', 'andey'],
    english: ['egg', 'eggs', 'white eggs', 'farm eggs'],
  },
  {
    canonical: 'Bread',
    hindi: ['bread', 'buns', 'double roti', 'pav'],
    english: ['bread', 'white bread', 'brown bread', 'whole wheat bread', 'loaf'],
  },

  // Staples & Grocery
  {
    canonical: 'Atta / Flour',
    hindi: ['atta', 'aata', 'gehu atta', 'maida', 'besan'],
    english: ['atta', 'flour', 'wheat flour', 'chakki atta', 'all purpose flour', 'gram flour'],
  },
  {
    canonical: 'Rice',
    hindi: ['chawal', 'chaaval', 'bhaat'],
    english: ['rice', 'basmati rice', 'white rice', 'brown rice'],
  },
  {
    canonical: 'Sugar',
    hindi: ['cheeni', 'chini', 'shakkar', 'bura'],
    english: ['sugar', 'white sugar', 'brown sugar'],
  },
  {
    canonical: 'Salt',
    hindi: ['namak', 'nimak', 'noon'],
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
  {
    canonical: 'Water',
    hindi: ['paani', 'pani'],
    english: ['water', 'bottled water', 'mineral water'],
  },
]

/**
 * Returns the canonical normalized root key for an item name.
 */
export function getCanonicalItemKey(name: string): string {
  if (!name) return ''
  const clean = name.toLowerCase().trim()

  for (const group of BILINGUAL_GROCERY_MAP) {
    for (const h of group.hindi) {
      if (clean === h || clean.includes(h)) {
        return group.canonical.toLowerCase()
      }
    }
    for (const e of group.english) {
      if (clean === e || clean.includes(e)) {
        return group.canonical.toLowerCase()
      }
    }
  }

  return clean.replace(/s$/, '').replace(/es$/, '')
}

/**
 * Checks if two item names refer to the same grocery item across English and Hindi.
 */
export function areItemsEquivalent(name1: string, name2: string): boolean {
  if (!name1 || !name2) return false
  const n1 = name1.toLowerCase().trim()
  const n2 = name2.toLowerCase().trim()

  if (n1 === n2) return true

  const key1 = getCanonicalItemKey(n1)
  const key2 = getCanonicalItemKey(n2)

  if (key1 && key2 && key1 === key2) {
    return true
  }

  const words1 = n1.split(/\s+/).filter(w => w.length > 2)
  const words2 = n2.split(/\s+/).filter(w => w.length > 2)
  for (const w of words1) {
    if (words2.includes(w)) return true
  }

  return false
}
