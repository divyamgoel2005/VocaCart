import { NextResponse } from 'next/server'
import { getStoreItems, clearStoreItems } from '@/lib/api/list-store'

export async function GET() {
  const items = getStoreItems()
  return NextResponse.json({
    total_items: items.length,
    categories: {},
    raw_items: items,
  })
}

export async function DELETE() {
  clearStoreItems()
  return NextResponse.json({
    success: true,
    message: 'Shopping list cleared successfully',
  })
}
