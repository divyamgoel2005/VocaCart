// Domain types shared across the app.

export type Category =
  | 'produce'
  | 'dairy'
  | 'bakery'
  | 'snacks'
  | 'beverages'
  | 'household'
  | 'other'

export const CATEGORY_ORDER: Category[] = [
  'produce',
  'dairy',
  'bakery',
  'snacks',
  'beverages',
  'household',
  'other',
]

export interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit?: string
  category: Category
  completed: boolean
  note?: string
  substitute?: string
}

export interface Product {
  id: string
  name: string
  brand: string
  size: string
  price: number
  currency: string
  category: Category
  organic?: boolean
  inStock: boolean
  rating: number
  substituteFor?: string
}

export type SuggestionKind = 'low' | 'substitute' | 'seasonal' | 'frequent'

export interface Suggestion {
  id: string
  kind: SuggestionKind
  title: string
  message: string
  itemName: string
  category: Category
  quantity?: number
  price?: number
  brand?: string
  imageUrl?: string
  reason?: string
}

export type ActivityKind =
  | 'add'
  | 'remove'
  | 'update'
  | 'complete'
  | 'search'
  | 'language'

export interface ActivityEvent {
  id: string
  kind: ActivityKind
  text: string
  timestamp: number
}

// --- Voice parsing ---

export type VoiceIntent = 'add' | 'remove' | 'search' | 'update' | 'unknown'

export interface ParsedItem {
  name: string
  quantity: number
  unit?: string
  category: Category
}

export interface SearchFilters {
  maxPrice?: number
  currency?: string
  brand?: string
  size?: string
  organic?: boolean
}

export interface VoiceCommandResult {
  transcript: string
  intent: VoiceIntent
  items: ParsedItem[]
  searchTerm?: string
  filters?: SearchFilters
}

export type LanguageCode = 'en' | 'hi' | 'hinglish'

export interface LanguageOption {
  code: LanguageCode
  label: string
  native: string
  hint: string
  bcp47: string
}
