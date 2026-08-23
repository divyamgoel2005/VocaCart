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

export const INITIAL_ITEMS: ShoppingItem[] = [
  { id: 'i-1', name: 'Bananas', quantity: 6, unit: 'pcs', category: 'produce', completed: false },
  { id: 'i-2', name: 'Whole Milk', quantity: 2, unit: 'bottles', category: 'dairy', completed: false, substitute: 'Almond Milk' },
  { id: 'i-3', name: 'Sourdough Bread', quantity: 1, unit: 'loaf', category: 'bakery', completed: true },
  { id: 'i-4', name: 'Sparkling Water', quantity: 4, unit: 'cans', category: 'beverages', completed: false },
  { id: 'i-5', name: 'Dish Soap', quantity: 1, unit: 'bottle', category: 'household', completed: false },
]

// Catalog used by the mock product search.
export const PRODUCT_CATALOG: Product[] = [
  { id: 'p-1', name: 'Organic Gala Apples', brand: 'FarmFresh', size: '1 kg', price: 3.49, currency: '$', category: 'produce', organic: true, inStock: true, rating: 4.6 },
  { id: 'p-2', name: 'Red Delicious Apples', brand: 'Orchard Co', size: '1 kg', price: 2.29, currency: '$', category: 'produce', organic: false, inStock: true, rating: 4.1 },
  { id: 'p-3', name: 'Organic Strawberries', brand: 'BerryLane', size: '250 g', price: 4.99, currency: '$', category: 'produce', organic: true, inStock: true, rating: 4.8 },
  { id: 'p-4', name: 'Full Cream Milk', brand: 'DairyPure', size: '1 litre', price: 1.19, currency: '$', category: 'dairy', inStock: true, rating: 4.4 },
  { id: 'p-5', name: 'Toned Milk', brand: 'Amul', size: '1 litre', price: 0.89, currency: '$', category: 'dairy', inStock: true, rating: 4.2 },
  { id: 'p-6', name: 'Almond Milk (Unsweetened)', brand: 'NutriNut', size: '1 litre', price: 2.49, currency: '$', category: 'dairy', inStock: true, rating: 4.5, substituteFor: 'milk' },
  { id: 'p-7', name: 'Oat Milk Barista', brand: 'OatWay', size: '1 litre', price: 2.79, currency: '$', category: 'dairy', inStock: false, rating: 4.7, substituteFor: 'milk' },
  { id: 'p-8', name: 'Dove Whitening Toothpaste', brand: 'Dove', size: '150 g', price: 3.99, currency: '$', category: 'household', inStock: true, rating: 4.3 },
  { id: 'p-9', name: 'Herbal Toothpaste', brand: 'Himalaya', size: '150 g', price: 2.49, currency: '$', category: 'household', inStock: true, rating: 4.0 },
  { id: 'p-10', name: 'Fluoride Toothpaste', brand: 'Colgate', size: '100 g', price: 1.99, currency: '$', category: 'household', inStock: true, rating: 4.2 },
  { id: 'p-11', name: 'Sparkling Water Lime', brand: 'Fizzo', size: '330 ml x 6', price: 4.49, currency: '$', category: 'beverages', inStock: true, rating: 4.1 },
  { id: 'p-12', name: 'Cold Brew Coffee', brand: 'Roast&Co', size: '750 ml', price: 5.49, currency: '$', category: 'beverages', inStock: true, rating: 4.6 },
  { id: 'p-13', name: 'Multigrain Bread', brand: 'BakeHouse', size: '400 g', price: 2.19, currency: '$', category: 'bakery', inStock: true, rating: 4.3 },
  { id: 'p-14', name: 'Butter Croissants', brand: 'BakeHouse', size: '4 pcs', price: 3.29, currency: '$', category: 'bakery', inStock: true, rating: 4.7 },
  { id: 'p-15', name: 'Dark Chocolate 70%', brand: 'CocoaBar', size: '100 g', price: 2.99, currency: '$', category: 'snacks', inStock: true, rating: 4.8 },
]

// Frequently purchased & history data used to build smart suggestions.
export const FREQUENT_ITEMS = ['Eggs', 'Bread', 'Bananas', 'Coffee', 'Yogurt']
export const SEASONAL_ITEMS = ['Strawberries', 'Mangoes']
