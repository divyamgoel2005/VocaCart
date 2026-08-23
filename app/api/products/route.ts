import { NextRequest, NextResponse } from 'next/server'
import { searchLiveGroceryProducts } from '@/lib/api/grocery-catalog'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const brand = searchParams.get('brand') || ''
  const maxPrice = Number(searchParams.get('max_price') || 0)

  try {
    let results = await searchLiveGroceryProducts(q || 'fresh grocery', 16)

    if (brand) {
      results = results.filter((p) => p.brand.toLowerCase().includes(brand.toLowerCase()))
    }
    if (maxPrice > 0) {
      results = results.filter((p) => p.price <= maxPrice)
    }

    return NextResponse.json({
      items: results.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        sub_category: p.quantity || 'Standard Pack',
        sale_price: p.price,
        image_url: p.imageUrl,
        category: p.category,
        stock_status: p.inStock ? 'in_stock' : 'out_of_stock',
        rating: p.rating || 4.5,
      })),
      total: results.length,
    })
  } catch (err: any) {
    return NextResponse.json({ items: [], total: 0, error: String(err) })
  }
}
