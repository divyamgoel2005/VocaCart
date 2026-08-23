import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = {
      id: Date.now(),
      product_name: body.product_name || 'Grocery Item',
      quantity: Number(body.quantity || 1),
      unit: body.unit || 'item',
      category: body.category || 'other',
      is_completed: false,
    }
    return NextResponse.json({ success: true, item })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
