import { NextRequest, NextResponse } from 'next/server'
import { updateStoreQuantity, toggleStoreComplete, removeStoreItem } from '@/lib/api/list-store'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    if (body.quantity !== undefined) {
      updateStoreQuantity(id, body.quantity)
    }
    if (body.is_completed !== undefined) {
      toggleStoreComplete(id, body.is_completed)
    }

    return NextResponse.json({ success: true, id, ...body })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    removeStoreItem(id)
    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
