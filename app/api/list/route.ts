import { NextResponse } from 'next/server'
import { INITIAL_ITEMS } from '@/lib/api/mock-data'

let listItems = [...INITIAL_ITEMS].map((item, idx) => ({
  id: idx + 1,
  product_name: item.name,
  quantity: item.quantity,
  unit: item.unit || 'item',
  category: item.category,
  is_completed: item.completed,
}))

export async function GET() {
  return NextResponse.json({
    success: true,
    count: listItems.length,
    raw_items: listItems,
  })
}
