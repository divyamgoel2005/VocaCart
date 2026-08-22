import type { ParsedItem } from '@/lib/api/types'

export interface RecipeBundle {
  name: string
  hindiKeywords: string[]
  englishKeywords: string[]
  items: ParsedItem[]
  spokenHindi: string
  spokenEnglish: string
}

export const RECIPE_BUNDLES: RecipeBundle[] = [
  {
    name: 'Chai / Tea',
    hindiKeywords: ['chai', 'chaai', 'chay', 'tea', 'kadak chai'],
    englishKeywords: ['tea', 'chai', 'milk tea', 'ginger tea'],
    items: [
      { name: 'Milk', quantity: 1, unit: 'packet', category: 'dairy' },
      { name: 'Tea', quantity: 1, unit: 'pack', category: 'beverages' },
      { name: 'Sugar', quantity: 1, unit: 'kg', category: 'produce' },
      { name: 'Ginger', quantity: 1, unit: 'pack', category: 'produce' },
    ],
    spokenHindi: 'Chai banane ka saara samaan (Doodh, Chai Patti, Cheeni, Adrak) list mein jod diya gaya hai.',
    spokenEnglish: 'Added all ingredients for Tea (Milk, Tea Leaves, Sugar, Ginger) to your list.',
  },
  {
    name: 'Maggi Noodles',
    hindiKeywords: ['maggi', 'meggi', 'magi', 'mangi', 'noodles'],
    englishKeywords: ['maggi', 'instant noodles', 'noodles'],
    items: [
      { name: 'Maggi Noodles', quantity: 2, unit: 'packs', category: 'snacks' },
      { name: 'Butter', quantity: 1, unit: 'pack', category: 'dairy' },
      { name: 'Tomato', quantity: 1, unit: 'kg', category: 'produce' },
    ],
    spokenHindi: 'Maggi banane ka samaan (Maggi Noodles, Butter, Tamatar) list mein add kar diya hai.',
    spokenEnglish: 'Added ingredients for Maggi (Maggi Noodles, Butter, Tomato) to your cart.',
  },
  {
    name: 'Sandwich',
    hindiKeywords: ['sandwich', 'sandwitch', 'toast'],
    englishKeywords: ['sandwich', 'veg sandwich', 'cheese sandwich', 'toast'],
    items: [
      { name: 'Bread', quantity: 1, unit: 'loaf', category: 'bakery' },
      { name: 'Butter', quantity: 1, unit: 'pack', category: 'dairy' },
      { name: 'Tomato', quantity: 1, unit: 'kg', category: 'produce' },
      { name: 'Cucumber', quantity: 1, unit: 'kg', category: 'produce' },
    ],
    spokenHindi: 'Sandwich ka samaan (Bread, Butter, Tamatar, Kheera) list mein add kar diya hai.',
    spokenEnglish: 'Added Sandwich ingredients (Bread, Butter, Tomato, Cucumber) to your list.',
  },
  {
    name: 'Aloo Paratha',
    hindiKeywords: ['aloo paratha', 'paratha', 'parathe'],
    englishKeywords: ['aloo paratha', 'potato paratha', 'paratha'],
    items: [
      { name: 'Atta / Flour', quantity: 1, unit: 'kg', category: 'produce' },
      { name: 'Potato', quantity: 1, unit: 'kg', category: 'produce' },
      { name: 'Butter', quantity: 1, unit: 'pack', category: 'dairy' },
      { name: 'Chilli', quantity: 1, unit: 'pack', category: 'produce' },
      { name: 'Coriander', quantity: 1, unit: 'bunch', category: 'produce' },
    ],
    spokenHindi: 'Aloo Paratha ke liye Atta, Aloo, Butter, Mirchi aur Dhaniya list mein jod diya hai.',
    spokenEnglish: 'Added Aloo Paratha ingredients (Atta, Potato, Butter, Chilli, Coriander) to your list.',
  },
  {
    name: 'Fresh Salad',
    hindiKeywords: ['salad', 'kachumber', 'kachumar'],
    englishKeywords: ['salad', 'green salad', 'fresh salad'],
    items: [
      { name: 'Tomato', quantity: 1, unit: 'kg', category: 'produce' },
      { name: 'Cucumber', quantity: 1, unit: 'kg', category: 'produce' },
      { name: 'Onion', quantity: 1, unit: 'kg', category: 'produce' },
      { name: 'Lemon', quantity: 2, unit: 'pcs', category: 'produce' },
    ],
    spokenHindi: 'Salad ka samaan (Tamatar, Kheera, Pyaaz, Nimbu) list mein jod diya gaya hai.',
    spokenEnglish: 'Added Salad items (Tomato, Cucumber, Onion, Lemon) to your list.',
  },
  {
    name: 'Omelette / Eggs',
    hindiKeywords: ['omelette', 'omlet', 'anda bhurji', 'ande ka'],
    englishKeywords: ['omelette', 'eggs', 'scrambled eggs'],
    items: [
      { name: 'Egg', quantity: 6, unit: 'pcs', category: 'dairy' },
      { name: 'Onion', quantity: 1, unit: 'kg', category: 'produce' },
      { name: 'Chilli', quantity: 1, unit: 'pack', category: 'produce' },
      { name: 'Cooking Oil', quantity: 1, unit: 'bottle', category: 'produce' },
    ],
    spokenHindi: 'Omelette banane ke liye Ande, Pyaaz, Mirchi aur Cooking Oil list mein add ho gaya hai.',
    spokenEnglish: 'Added Omelette ingredients (Eggs, Onion, Green Chilli, Oil) to your list.',
  },
  {
    name: 'Coffee',
    hindiKeywords: ['coffee', 'kofi', 'hot coffee', 'cold coffee'],
    englishKeywords: ['coffee', 'cold coffee', 'hot coffee'],
    items: [
      { name: 'Coffee', quantity: 1, unit: 'pack', category: 'beverages' },
      { name: 'Milk', quantity: 1, unit: 'packet', category: 'dairy' },
      { name: 'Sugar', quantity: 1, unit: 'kg', category: 'produce' },
    ],
    spokenHindi: 'Coffee banane ka samaan (Coffee, Doodh, Cheeni) list mein add kar diya hai.',
    spokenEnglish: 'Added Coffee, Milk, and Sugar to your list.',
  },
]

export function matchRecipeBundle(transcript: string): RecipeBundle | null {
  const t = transcript.toLowerCase()
  // Must have a recipe trigger keyword like "samaan", "ingredients", "recipe", "banane ke liye", "banana hai", "banao", "chahiye"
  const isRecipeContext = /(samaan|saman|ingredients|recipe|banane|banana|chahiye|kit|bundle|banao)/i.test(t)
  if (!isRecipeContext) return null

  for (const bundle of RECIPE_BUNDLES) {
    for (const k of [...bundle.hindiKeywords, ...bundle.englishKeywords]) {
      if (new RegExp(`\\b${k}\\b`, 'i').test(t)) {
        return bundle
      }
    }
  }
  return null
}
