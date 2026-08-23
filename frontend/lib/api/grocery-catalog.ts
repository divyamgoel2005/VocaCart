// Live Grocery Catalog API Integration (Open Food Facts & Curated Groceries)

import type { Category, Product } from './types'
import { mapToCategory } from './services'
import { PRODUCT_CATALOG } from './mock-data'

export interface LiveProductResult {
  id: string
  name: string
  brand: string
  category: Category
  price: number
  imageUrl?: string
  quantity?: string
  inStock: boolean
  rating: number
}

// In-memory cache for live search speed
const cache = new Map<string, LiveProductResult[]>()

/**
 * Searches real-world grocery items via Open Food Facts API with instant fallback
 */
export async function searchLiveGroceryProducts(
  query: string,
  limit = 12,
): Promise<LiveProductResult[]> {
  const cleanQ = query.toLowerCase().trim()
  if (!cleanQ) return []

  if (cache.has(cleanQ)) {
    return cache.get(cleanQ)!
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2800)

    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      cleanQ,
    )}&search_simple=1&action=process&json=1&page_size=${limit}&fields=code,product_name,brands,categories_tags,image_front_small_url,quantity`

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'VocaCartVoiceAssistant/1.0 (https://github.com/divyamgoel2005/VocaCart)',
      },
    })
    clearTimeout(timeout)

    if (res.ok) {
      const data = await res.json()
      const products: any[] = data.products || []

      if (products.length > 0) {
        const liveItems: LiveProductResult[] = products
          .filter((p) => p.product_name && p.product_name.trim().length > 1)
          .map((p, idx) => {
            const rawCat = (p.categories_tags && p.categories_tags[0]) || ''
            const mappedCat = mapToCategory(rawCat || cleanQ)
            // Estimated price based on category
            const basePrice = mappedCat === 'dairy' ? 65 : mappedCat === 'produce' ? 45 : mappedCat === 'beverages' ? 95 : 120
            const randomVariance = ((idx * 7) % 25)

            return {
              id: p.code || `off-${idx}-${Date.now()}`,
              name: p.product_name.trim(),
              brand: p.brands ? p.brands.split(',')[0].trim() : 'Fresh & Pure',
              category: mappedCat,
              price: basePrice + randomVariance,
              imageUrl: p.image_front_small_url || `https://picsum.photos/seed/${encodeURIComponent(p.product_name)}/200/200`,
              quantity: p.quantity || 'Standard Pack',
              inStock: true,
              rating: Number((4.2 + (idx % 7) * 0.1).toFixed(1)),
            }
          })

        if (liveItems.length > 0) {
          cache.set(cleanQ, liveItems)
          return liveItems
        }
      }
    }
  } catch (err) {
    // Network/timeout fallback to local catalog
  }

  // Local Catalog Match
  const localMatches = PRODUCT_CATALOG.filter((p) => {
    const haystack = `${p.name} ${p.brand} ${p.category}`.toLowerCase()
    return cleanQ.split(/\s+/).some((w) => haystack.includes(w))
  }).map((p) => ({
    id: String(p.id),
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    imageUrl: p.imageUrl,
    inStock: p.inStock,
    rating: p.rating,
  }))

  cache.set(cleanQ, localMatches)
  return localMatches
}
