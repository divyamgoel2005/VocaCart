import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
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
    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
