import { NextRequest, NextResponse } from 'next/server'
import { addStoreItem } from '@/lib/api/list-store'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = addStoreItem({
      product_name: body.product_name,
      quantity: body.quantity,
      unit: body.unit,
      category: body.category,
    })
    return NextResponse.json({ success: true, item })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
