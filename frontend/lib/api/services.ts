import {
  CATEGORY_KEYWORDS,
  FREQUENT_ITEMS,
  INITIAL_ITEMS,
  PRODUCT_CATALOG,
  SEASONAL_ITEMS,
} from './mock-data'
import type {
  Category,
  Product,
  SearchFilters,
  ShoppingItem,
  Suggestion,
} from './types'
import { areItemsEquivalent } from '@/lib/voice/bilingual-mapping'

export function mapToCategory(catStr?: string): Category {
  if (!catStr) return 'other'
  const c = catStr.toLowerCase()
  if (c.includes('fruit') || c.includes('veg') || c.includes('produce') || c.includes('foodgrain') || c.includes('masala') || c.includes('staples')) return 'produce'
  if (c.includes('dairy') || c.includes('milk') || c.includes('cheese') || c.includes('curd') || c.includes('paneer') || c.includes('egg')) return 'dairy'
  if (c.includes('bakery') || c.includes('bread') || c.includes('cake') || c.includes('croissant') || c.includes('bun')) return 'bakery'
  if (c.includes('snack') || c.includes('biscuit') || c.includes('cookie') || c.includes('chip') || c.includes('noodle') || c.includes('chocolate')) return 'snacks'
  if (c.includes('beverage') || c.includes('drink') || c.includes('juice') || c.includes('tea') || c.includes('coffee') || c.includes('water')) return 'beverages'
  if (c.includes('clean') || c.includes('house') || c.includes('wash') || c.includes('detergent') || c.includes('soap') || c.includes('shampoo') || c.includes('hygiene') || c.includes('beauty')) return 'household'
  return 'other'
}

let idCounter = 1000
export function nextId(prefix = 'id'): string {
  idCounter += 1
  return `${prefix}-${Date.now()}-${idCounter}`
}

const STORAGE_KEY = 'vocacart_shopping_list_v5'

export function getLocalStoredItems(): ShoppingItem[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.warn('Error reading from localStorage', e)
  }
  return []
}

export function setLocalStoredItems(items: ShoppingItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.warn('Error saving to localStorage', e)
  }
}

// --- Shopping list ---

export async function getShoppingList(): Promise<ShoppingItem[]> {
  try {
    const res = await fetch('/api/list', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      const raw = data.raw_items
      if (Array.isArray(raw)) {
        const mapped: ShoppingItem[] = raw.map((item: any) => ({
          id: String(item.id),
          name: item.product_name,
          quantity: Math.max(1, Math.round(item.quantity || 1)),
          unit: item.unit || 'item',
          category: mapToCategory(item.category),
          completed: Boolean(item.is_completed),
        }))
        // If server has items, sync to local
        if (mapped.length > 0) {
          setLocalStoredItems(mapped)
          return mapped
        }
      }
    }
  } catch (err) {
    // offline/client mode
  }
  return getLocalStoredItems()
}

export async function addShoppingItem(
  item: Omit<ShoppingItem, 'id' | 'completed'>,
): Promise<ShoppingItem> {
  const current = getLocalStoredItems()
  const cleanName = item.name.trim()
  const existingIndex = current.findIndex((i) => areItemsEquivalent(i.name, cleanName))

  let resultItem: ShoppingItem
  if (existingIndex !== -1) {
    const updated = [...current]
    const newQty = updated[existingIndex].quantity + item.quantity
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: newQty,
    }
    setLocalStoredItems(updated)
    resultItem = updated[existingIndex]
  } else {
    resultItem = {
      ...item,
      id: nextId('item'),
      completed: false,
    }
    setLocalStoredItems([resultItem, ...current])
  }

  // Sync to API in background
  fetch('/api/list/item', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_name: item.name,
      quantity: item.quantity,
      unit: item.unit || 'item',
      category: item.category,
    }),
  }).catch(() => {})

  return resultItem
}

export async function removeShoppingItem(id: string): Promise<{ id: string }> {
  const current = getLocalStoredItems()
  setLocalStoredItems(current.filter((i) => String(i.id) !== String(id)))
  fetch(`/api/list/item/${id}`, { method: 'DELETE' }).catch(() => {})
  return { id }
}

export async function updateItemQuantity(
  id: string,
  quantity: number,
): Promise<{ id: string; quantity: number }> {
  const safeQty = Math.max(1, quantity)
  const current = getLocalStoredItems()
  setLocalStoredItems(
    current.map((i) => (String(i.id) === String(id) ? { ...i, quantity: safeQty } : i)),
  )
  fetch(`/api/list/item/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity: safeQty }),
  }).catch(() => {})
  return { id, quantity: safeQty }
}

export async function toggleItemComplete(
  id: string,
  completed: boolean,
): Promise<{ id: string; completed: boolean }> {
  const current = getLocalStoredItems()
  setLocalStoredItems(
    current.map((i) => (String(i.id) === String(id) ? { ...i, completed } : i)),
  )
  fetch(`/api/list/item/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_completed: completed }),
  }).catch(() => {})
  return { id, completed }
}

export async function undoLastAction(): Promise<{ status: string }> {
  try {
    const res = await fetch('/api/list/undo', { method: 'POST' })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn('Backend undo error:', err)
  }
  return { status: 'success' }
}

// --- Product search ---

export interface SearchResponse {
  term: string
  filters: SearchFilters
  results: Product[]
}

export async function searchProducts(
  term: string,
  filters: SearchFilters = {},
): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams()
    if (term) params.append('q', term)
    if (filters.brand) params.append('brand', filters.brand)
    if (filters.maxPrice) params.append('max_price', String(filters.maxPrice))

    const res = await fetch(`/api/products?${params.toString()}`)
    if (res.ok) {
      const data = await res.json()
      const rawProducts = data.items || []
      if (rawProducts.length > 0) {
        const results: Product[] = rawProducts.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          brand: p.brand || 'Catalog',
          size: p.sub_category || 'Standard',
          price: Number(p.sale_price || 0),
          currency: '₹',
          category: mapToCategory(p.category),
          organic: Boolean(
            p.name?.toLowerCase().includes('organic') ||
            p.description?.toLowerCase().includes('organic'),
          ),
          inStock: p.stock_status === 'in_stock',
          rating: Number(p.rating || 4.2),
        }))

        let filtered = results
        if (filters.organic) {
          filtered = filtered.filter((p) => p.organic)
        }
        return { term, filters, results: filtered }
      }
    }
  } catch (err) {
    // Fallback to local catalog
  }

  // Fallback to local catalog
  const normalized = term.toLowerCase().trim()
  let results = PRODUCT_CATALOG.filter((product) => {
    const haystack = `${product.name} ${product.brand} ${product.category}`.toLowerCase()
    const matchesTerm = normalized
      ? normalized.split(/\s+/).some((word) => haystack.includes(word))
      : true
    const matchesPrice = filters.maxPrice ? product.price <= filters.maxPrice : true
    const matchesBrand = filters.brand
      ? product.brand.toLowerCase().includes(filters.brand)
      : true
    const matchesOrganic = filters.organic ? Boolean(product.organic) : true
    return matchesTerm && matchesPrice && matchesBrand && matchesOrganic
  })

  results = results.sort((a, b) => a.price - b.price)
  return { term, filters, results }
}

export async function getSubstitutes(itemName: string): Promise<Product[]> {
  try {
    const res = await fetch('/api/suggestions/substitutes')
    if (res.ok) {
      const data = await res.json()
      const raw = data.items || []
      if (raw.length > 0) {
        return raw.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          brand: p.brand || 'Substitute',
          size: p.sub_category || 'Standard',
          price: Number(p.sale_price || 0),
          currency: '₹',
          category: mapToCategory(p.category),
          inStock: true,
          rating: Number(p.rating || 4.5),
          substituteFor: itemName,
        }))
      }
    }
  } catch (err) {
    // fallback
  }
  const key = itemName.toLowerCase()
  return PRODUCT_CATALOG.filter((p) => p.substituteFor && key.includes(p.substituteFor))
}

// --- Suggestions (Smart Picks) ---

export async function getSuggestions(
  currentItems: ShoppingItem[],
): Promise<Suggestion[]> {
  try {
    const [coRes, lowRes, subRes] = await Promise.allSettled([
      fetch('/api/suggestions/co-occurrence'),
      fetch('/api/suggestions/running-low'),
      fetch('/api/suggestions/substitutes'),
    ])

    const suggestions: Suggestion[] = []
    const present = new Set(currentItems.map((i) => i.name.toLowerCase()))

    if (coRes.status === 'fulfilled' && coRes.value.ok) {
      const coData = await coRes.value.json()
      const items = coData.items || []
      for (const item of items) {
        if (!present.has(item.name.toLowerCase())) {
          suggestions.push({
            id: nextId('co'),
            kind: 'frequent',
            title: 'Usually Bought Together',
            message: item.reason || `Frequently added alongside items in your cart.`,
            itemName: item.name,
            brand: item.brand || '',
            price: item.sale_price ? Number(item.sale_price) : undefined,
            imageUrl: item.image_url,
            reason: item.reason || 'Popular pairing',
            category: mapToCategory(item.category),
            quantity: 1,
          })
        }
        if (suggestions.length >= 3) break
      }
    }

    if (lowRes.status === 'fulfilled' && lowRes.value.ok) {
      const lowData = await lowRes.value.json()
      const items = lowData.items || []
      for (const item of items) {
        if (!present.has(item.name.toLowerCase())) {
          suggestions.push({
            id: nextId('low'),
            kind: 'low',
            title: 'Probably Running Low',
            message: item.reason || `Estimated based on restock cycles.`,
            itemName: item.name,
            brand: item.brand || '',
            price: item.sale_price ? Number(item.sale_price) : undefined,
            imageUrl: item.image_url,
            reason: item.reason || 'Restock cycle',
            category: mapToCategory(item.category),
            quantity: 1,
          })
        }
        if (suggestions.length >= 6) break
      }
    }

    if (subRes.status === 'fulfilled' && subRes.value.ok) {
      const subData = await subRes.value.json()
      const items = subData.items || []
      for (const item of items) {
        if (!present.has(item.name.toLowerCase())) {
          suggestions.push({
            id: nextId('sub'),
            kind: 'substitute',
            title: 'Smart Substitute',
            message: item.reason || `Alternative choice.`,
            itemName: item.name,
            brand: item.brand || '',
            price: item.sale_price ? Number(item.sale_price) : undefined,
            imageUrl: item.image_url,
            reason: item.reason || 'Alternative option',
            category: mapToCategory(item.category),
            quantity: 1,
          })
        }
        if (suggestions.length >= 8) break
      }
    }

    if (suggestions.length > 0) {
      return suggestions
    }
  } catch (err) {
    // fallback
  }

  // Fallback suggestions
  const present = new Set(currentItems.map((i) => i.name.toLowerCase()))
  const suggestions: Suggestion[] = []

  for (const name of FREQUENT_ITEMS) {
    if (!present.has(name.toLowerCase())) {
      suggestions.push({
        id: nextId('sug'),
        kind: 'low',
        title: 'Probably Running Low',
        message: `You may be running low on ${name.toLowerCase()}.`,
        itemName: name,
        category: mapToCategory(name),
        quantity: 1,
      })
    }
    if (suggestions.length >= 3) break
  }

  for (const name of SEASONAL_ITEMS) {
    if (!present.has(name.toLowerCase())) {
      suggestions.push({
        id: nextId('sug'),
        kind: 'seasonal',
        title: 'In season',
        message: `${name} are in season right now.`,
        itemName: name,
        category: 'produce',
        quantity: 1,
      })
    }
  }

  return suggestions
}

// --- Voice processing backend contract ---

export interface VoiceBackendResponse {
  success: boolean
  action?: 'ADD_ITEM' | 'REMOVE_ITEM' | 'CLEAR_ALL' | 'READ_LIST' | 'TOTAL_BILL' | 'CHECK_OFF' | 'RECIPE_BUNDLE' | 'GENERAL_CHAT' | 'SEARCH' | 'UNKNOWN'
  spoken_text?: string
  confidence?: number
  raw_item_name?: string
  suggested_product?: string
  urgency_score?: number
  needs_clarification?: boolean
  items?: Array<{
    product_name: string
    quantity: number
    unit?: string
    category?: string
    brand?: string
  }>
  item?: {
    product_name: string
    quantity: number
    unit?: string
    category?: string
    brand?: string
  }
}

export async function processVoiceBackend(
  transcript: string,
  previousContext?: string,
): Promise<VoiceBackendResponse> {
  const res = await fetch('/api/voice/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript,
      previous_context: previousContext || '',
    }),
  })
  if (!res.ok) {
    throw new Error(`Voice process failed: ${res.statusText}`)
  }
  return await res.json()
}
