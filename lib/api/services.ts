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
  return `${prefix}-${idCounter}`
}

// --- Shopping list ---

export async function getShoppingList(): Promise<ShoppingItem[]> {
  try {
    const res = await fetch('/api/list', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      const raw = data.raw_items || []
      return raw.map((item: any) => ({
        id: String(item.id),
        name: item.product_name,
        quantity: Math.max(1, Math.round(item.quantity || 1)),
        unit: item.unit || 'item',
        category: mapToCategory(item.category),
        completed: Boolean(item.is_completed),
      }))
    }
  } catch (err) {
    console.warn('Backend list fetch error, using local fallback:', err)
  }
  return [...INITIAL_ITEMS]
}

export async function addShoppingItem(
  item: Omit<ShoppingItem, 'id' | 'completed'>,
): Promise<ShoppingItem> {
  try {
    const res = await fetch('/api/list/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_name: item.name,
        quantity: item.quantity,
        unit: item.unit || 'item',
        category: item.category,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      const created = data.item
      return {
        id: String(created.id),
        name: created.product_name,
        quantity: created.quantity,
        unit: created.unit,
        category: mapToCategory(created.category),
        completed: Boolean(created.is_completed),
      }
    }
  } catch (err) {
    console.warn('Backend add item error:', err)
  }
  return { ...item, id: nextId('item'), completed: false }
}

export async function removeShoppingItem(id: string): Promise<{ id: string }> {
  try {
    const numId = parseInt(id, 10)
    if (!isNaN(numId)) {
      await fetch(`/api/list/item/${numId}`, { method: 'DELETE' })
    }
  } catch (err) {
    console.warn('Backend remove item error:', err)
  }
  return { id }
}

export async function updateItemQuantity(
  id: string,
  quantity: number,
): Promise<{ id: string; quantity: number }> {
  const safeQty = Math.max(1, quantity)
  try {
    const numId = parseInt(id, 10)
    if (!isNaN(numId)) {
      await fetch(`/api/list/item/${numId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: safeQty }),
      })
    }
  } catch (err) {
    console.warn('Backend update quantity error:', err)
  }
  return { id, quantity: safeQty }
}

export async function toggleItemComplete(
  id: string,
  completed: boolean,
): Promise<{ id: string; completed: boolean }> {
  try {
    const numId = parseInt(id, 10)
    if (!isNaN(numId)) {
      await fetch(`/api/list/item/${numId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: completed }),
      })
    }
  } catch (err) {
    console.warn('Backend toggle complete error:', err)
  }
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
  return { status: 'error' }
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
  } catch (err) {
    console.warn('Backend searchProducts error, falling back to local catalog:', err)
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
  } catch (err) {
    console.warn('Backend getSubstitutes error:', err)
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

    // 1. Co-occurrence ("Usually Bought Together")
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

    // 2. Running Low
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

    // 3. Substitutes
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
    console.warn('Backend getSuggestions error, falling back:', err)
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
        category: guessCategory(name),
        quantity: 1,
      })
    }
    if (suggestions.length >= 2) break
  }

  for (const name of SEASONAL_ITEMS) {
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

  return suggestions
}

export async function processVoiceBackend(
  transcript: string,
  contextProduct?: string,
): Promise<{
  success: boolean
  action?: string
  confidence?: number
  needs_clarification?: boolean
  clarifying_question?: string
  spoken_text?: string
  urgency_score?: number
  suggested_product?: string
  raw_item_name?: string
  item?: any
}> {
  const formData = new FormData()
  formData.append('transcript', transcript)
  if (contextProduct) {
    formData.append('context_product', contextProduct)
  }

  const res = await fetch('/api/voice/process', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`Voice process failed with status ${res.status}`)
  }

  return await res.json()
}

function guessCategory(name: string): Category {
  const n = name.toLowerCase()
  if (/(egg|milk|yogurt|cheese|butter|paneer|curd)/.test(n)) return 'dairy'
  if (/(bread|bun|croissant|cake|toast)/.test(n)) return 'bakery'
  if (/(coffee|tea|juice|water|cola|drink)/.test(n)) return 'beverages'
  if (/(banana|apple|berry|berries|mango|potato|onion|tomato|atta|flour)/.test(n)) return 'produce'
  if (/(chip|biscuit|cookie|chocolate|noodle|maggi)/.test(n)) return 'snacks'
  if (/(soap|shampoo|detergent|cleaner|paste)/.test(n)) return 'household'
  return 'other'
}
