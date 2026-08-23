// Shared Shopping List Data Store for Serverless Routes & Fallback

export interface StoredShoppingItem {
  id: number | string
  product_name: string
  quantity: number
  unit: string
  category: string
  is_completed: boolean
}

let IN_MEMORY_ITEMS: StoredShoppingItem[] = [
  {
    id: 1,
    product_name: 'Organic Whole Milk',
    quantity: 2,
    unit: 'bottles',
    category: 'dairy',
    is_completed: false,
  },
  {
    id: 2,
    product_name: 'Fresh Farm Tomatoes',
    quantity: 1,
    unit: 'kg',
    category: 'produce',
    is_completed: false,
  },
  {
    id: 3,
    product_name: 'Brown Eggs',
    quantity: 1,
    unit: 'dozen',
    category: 'dairy',
    is_completed: true,
  },
]

export function getStoreItems(): StoredShoppingItem[] {
  return [...IN_MEMORY_ITEMS]
}

export function addStoreItem(item: {
  product_name: string
  quantity?: number
  unit?: string
  category?: string
}): StoredShoppingItem {
  const existing = IN_MEMORY_ITEMS.find(
    (i) => i.product_name.toLowerCase() === item.product_name.toLowerCase(),
  )

  if (existing) {
    existing.quantity += item.quantity || 1
    return existing
  }

  const newItem: StoredShoppingItem = {
    id: Date.now(),
    product_name: item.product_name,
    quantity: Math.max(1, Math.round(item.quantity || 1)),
    unit: item.unit || 'item',
    category: item.category || 'other',
    is_completed: false,
  }

  IN_MEMORY_ITEMS = [newItem, ...IN_MEMORY_ITEMS]
  return newItem
}

export function removeStoreItem(id: number | string): boolean {
  const strId = String(id)
  IN_MEMORY_ITEMS = IN_MEMORY_ITEMS.filter((i) => String(i.id) !== strId)
  return true
}

export function clearStoreItems(): void {
  IN_MEMORY_ITEMS = []
}

export function updateStoreQuantity(id: number | string, qty: number): boolean {
  const strId = String(id)
  const target = IN_MEMORY_ITEMS.find((i) => String(i.id) === strId)
  if (target) {
    target.quantity = Math.max(1, Math.round(qty))
    return true
  }
  return false
}

export function toggleStoreComplete(id: number | string, completed: boolean): boolean {
  const strId = String(id)
  const target = IN_MEMORY_ITEMS.find((i) => String(i.id) === strId)
  if (target) {
    target.is_completed = completed
    return true
  }
  return false
}
