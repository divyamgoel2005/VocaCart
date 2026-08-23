import { NextRequest, NextResponse } from 'next/server'
import { processVoiceWithGemini } from '@/lib/voice/gemini-nlp'

export async function POST(req: NextRequest) {
  try {
    let transcript = ''
    let contextProduct = ''

    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData()
      transcript = String(formData.get('transcript') || '')
      contextProduct = String(formData.get('context_product') || '')
    } else {
      const body = await req.json()
      transcript = body.transcript || ''
      contextProduct = body.previous_context || body.context_product || ''
    }

    if (!transcript.trim()) {
      return NextResponse.json({
        success: false,
        confidence: 0,
        spoken_text: 'Please speak a grocery item or command.',
      })
    }

    const result = await processVoiceWithGemini(transcript)

    const firstItem = result.items[0] || null

    return NextResponse.json({
      success: result.success,
      action: result.action,
      intent: result.action,
      items: result.items,
      item: firstItem,
      raw_item_name: firstItem?.product_name || transcript,
      suggested_product: firstItem?.product_name || '',
      spoken_text: result.spoken_text,
      confidence: result.confidence,
      needs_clarification: false,
      urgency_score: result.urgency_score || 0.2,
    })
  } catch (err: any) {
    console.error('API /api/voice/process error:', err)
    return NextResponse.json(
      {
        success: false,
        spoken_text: 'Sorry, I encountered an error processing your voice command.',
        error: String(err?.message || err),
      },
      { status: 500 },
    )
  }
}
