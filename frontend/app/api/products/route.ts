import { NextRequest, NextResponse } from 'next/server'
import { PRODUCT_CATALOG } from '@/lib/api/mock-data'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').toLowerCase().trim()
  const brand = (searchParams.get('brand') || '').toLowerCase().trim()
  const maxPrice = Number(searchParams.get('max_price') || 0)

  let results = PRODUCT_CATALOG.filter((p) => {
    const haystack = `${p.name} ${p.brand} ${p.category}`.toLowerCase()
    const matchesQ = q ? q.split(/\s+/).some((w) => haystack.includes(w)) : true
    const matchesBrand = brand ? p.brand.toLowerCase().includes(brand) : true
    const matchesPrice = maxPrice > 0 ? p.price <= maxPrice : true
    return matchesQ && matchesBrand && matchesPrice
  })

  return NextResponse.json({
    items: results.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      sub_category: p.size,
      sale_price: p.price,
      category: p.category,
      stock_status: 'in_stock',
      rating: p.rating || 4.5,
    })),
    total: results.length,
  })
}
