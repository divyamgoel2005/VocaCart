import type { Category, Product, ShoppingItem } from './types'

// Keyword -> category map used by the parser and search to classify items.
export const CATEGORY_KEYWORDS: Record<string, Category> = {
  // produce
  apple: 'produce',
  apples: 'produce',
  banana: 'produce',
  bananas: 'produce',
  orange: 'produce',
  oranges: 'produce',
  strawberry: 'produce',
  strawberries: 'produce',
  tomato: 'produce',
  tomatoes: 'produce',
  onion: 'produce',
  onions: 'produce',
  potato: 'produce',
  potatoes: 'produce',
  spinach: 'produce',
  lettuce: 'produce',
  // dairy
  milk: 'dairy',
  cheese: 'dairy',
  butter: 'dairy',
  yogurt: 'dairy',
  curd: 'dairy',
  paneer: 'dairy',
  eggs: 'dairy',
  egg: 'dairy',
  // bakery
  bread: 'bakery',
  bun: 'bakery',
  buns: 'bakery',
  croissant: 'bakery',
  bagel: 'bakery',
  cake: 'bakery',
  // snacks
  chips: 'snacks',
  cookies: 'snacks',
  biscuits: 'snacks',
  chocolate: 'snacks',
  nuts: 'snacks',
  crackers: 'snacks',
  // beverages
  water: 'beverages',
  juice: 'beverages',
  cola: 'beverages',
  coffee: 'beverages',
  tea: 'beverages',
  soda: 'beverages',
  // household
  detergent: 'household',
  soap: 'household',
  toothpaste: 'household',
  tissue: 'household',
  tissues: 'household',
  shampoo: 'household',
  cleaner: 'household',
}

// Initial shopping list is completely clean/empty for new sessions
export const INITIAL_ITEMS: ShoppingItem[] = []

// Catalog used by the mock product search.
export const PRODUCT_CATALOG: Product[] = [
  { id: 'p-1', name: 'Fresh Farm Tomatoes', brand: 'FarmFresh', size: '1 kg', price: 45.0, currency: '₹', category: 'produce', organic: true, inStock: true, rating: 4.6 },
  { id: 'p-2', name: 'Fresh Potatoes', brand: 'FarmFresh', size: '1 kg', price: 35.0, currency: '₹', category: 'produce', organic: false, inStock: true, rating: 4.1 },
  { id: 'p-3', name: 'Fresh Onions', brand: 'FarmFresh', size: '1 kg', price: 40.0, currency: '₹', category: 'produce', organic: false, inStock: true, rating: 4.3 },
  { id: 'p-4', name: 'Amul Taaza Milk', brand: 'Amul', size: '1 litre', price: 54.0, currency: '₹', category: 'dairy', inStock: true, rating: 4.8 },
  { id: 'p-5', name: 'Amul Butter', brand: 'Amul', size: '100 g', price: 60.0, currency: '₹', category: 'dairy', inStock: true, rating: 4.9 },
  { id: 'p-6', name: 'Britannia 100% Whole Wheat Bread', brand: 'Britannia', size: '400 g', price: 50.0, currency: '₹', category: 'bakery', inStock: true, rating: 4.7 },
  { id: 'p-7', name: 'Tata Salt', brand: 'Tata', size: '1 kg', price: 28.0, currency: '₹', category: 'produce', inStock: true, rating: 4.8 },
  { id: 'p-8', name: 'Aashirvaad Superior MP Atta', brand: 'Aashirvaad', size: '5 kg', price: 265.0, currency: '₹', category: 'produce', inStock: true, rating: 4.9 },
  { id: 'p-9', name: 'Maggi 2-Minute Noodles', brand: 'Nestle', size: '4 Pack', price: 56.0, currency: '₹', category: 'snacks', inStock: true, rating: 4.8 },
  { id: 'p-10', name: 'Wagh Bakri Premium Tea', brand: 'Wagh Bakri', size: '500 g', price: 140.0, currency: '₹', category: 'beverages', inStock: true, rating: 4.7 },
  { id: 'p-11', name: 'Fortune Sunlite Refined Oil', brand: 'Fortune', size: '1 litre', price: 135.0, currency: '₹', category: 'produce', inStock: true, rating: 4.6 },
  { id: 'p-12', name: 'Colgate Strong Teeth Toothpaste', brand: 'Colgate', size: '150 g', price: 95.0, currency: '₹', category: 'household', inStock: true, rating: 4.5 },
]

export const FREQUENT_ITEMS = ['Amul Milk', 'Tata Tea', 'Britannia Bread', 'Amul Butter', 'Maggi Noodles']
export const SEASONAL_ITEMS = ['Fresh Mangoes', 'Fresh Strawberries', 'Watermelon']
