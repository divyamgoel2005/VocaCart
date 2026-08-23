import { NextResponse } from 'next/server'
import { FREQUENT_ITEMS, SEASONAL_ITEMS } from '@/lib/api/mock-data'

export async function GET() {
  const frequent = FREQUENT_ITEMS.map((f, i) => ({
    product_id: 100 + i,
    product_name: f.name,
    category: f.category,
    reason: 'frequently_bought',
    confidence: 0.9,
    sale_price: 95,
  }))

  const seasonal = SEASONAL_ITEMS.map((s, i) => ({
    product_id: 200 + i,
    product_name: s.name,
    category: s.category,
    reason: 'seasonal',
    confidence: 0.85,
    sale_price: 120,
  }))

  return NextResponse.json({
    running_low: [
      {
        product_id: 301,
        product_name: 'Fresh Whole Milk',
        category: 'dairy',
        reason: 'running_low',
        days_left: 1,
        confidence: 0.95,
        sale_price: 65,
      },
    ],
    frequently_bought: frequent,
    seasonal: seasonal,
  })
}
