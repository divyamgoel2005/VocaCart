// Gemini 2.5 Flash & NLP Hybrid Voice Understanding Engine

import { GoogleGenAI } from '@google/genai'
import { parseVoiceCommand, detectIntent, cleanSpokenItemName } from './parser'
import { areItemsEquivalent } from './bilingual-mapping'
import { matchRecipeBundle } from './recipes'
import { checkConversationalQuery } from './conversational-responses'

export interface ParsedVoiceResult {
  success: boolean
  action:
    | 'ADD_ITEM'
    | 'REMOVE_ITEM'
    | 'CLEAR_ALL'
    | 'READ_LIST'
    | 'TOTAL_BILL'
    | 'CHECK_OFF'
    | 'RECIPE_BUNDLE'
    | 'GENERAL_CHAT'
    | 'SEARCH'
    | 'UNKNOWN'
  items: Array<{
    product_name: string
    quantity: number
    unit: string
    category: string
    brand?: string
  }>
  spoken_text: string
  confidence: number
  urgency_score?: number
}

const SYSTEM_PROMPT = `You are VocaCart AI, an expert bilingual (Hindi, Hinglish, English) voice grocery assistant.
Analyze the user's voice command and extract structured grocery actions.

Return JSON adhering to this exact schema:
{
  "action": "ADD_ITEM" | "REMOVE_ITEM" | "CLEAR_ALL" | "READ_LIST" | "TOTAL_BILL" | "CHECK_OFF" | "RECIPE_BUNDLE" | "GENERAL_CHAT" | "SEARCH",
  "items": [
    {
      "product_name": "Standard English/Hindi grocery name (e.g. Fresh Milk, Tomato, Maggi)",
      "quantity": number (default 1),
      "unit": "packet" | "kg" | "g" | "litre" | "bottle" | "box" | "piece" | "item",
      "category": "produce" | "dairy" | "bakery" | "snacks" | "beverages" | "household" | "other"
    }
  ],
  "spoken_text": "A friendly, concise voice reply in the user's spoken language (Hindi/Hinglish or English).",
  "confidence": 0.95
}

Rules:
1. Pure produce items (Apple/Seb, Orange/Santra, Tomato/Tamatar) should NOT match processed items like Apple Juice or Tomato Sauce unless specifically requested.
2. Hindi numbers (ek=1, do=2, aadha=0.5, teen=3, char=4, paanch=5) must be mapped to numbers.
3. If the user asks a general question ("how are you", "who are you", "recipe suggestions"), set action to "GENERAL_CHAT" and answer conversationally.
4. If the user says "remove all", "saare items hata do", or "clear list", action is "CLEAR_ALL".
5. Keep spoken_text crisp and natural for voice synthesis (TTS).`

export async function processVoiceWithGemini(
  transcript: string,
  apiKey?: string,
): Promise<ParsedVoiceResult> {
  const cleanTranscript = transcript.trim()
  if (!cleanTranscript) {
    return {
      success: false,
      action: 'UNKNOWN',
      items: [],
      spoken_text: "I didn't hear anything. Please tap and speak again.",
      confidence: 0,
    }
  }

  const geminiKey = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

  // 1. Try Gemini GenAI API if key is available
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey })
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Voice Transcript: "${cleanTranscript}"` }],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      })

      const text = response.text
      if (text) {
        const parsed = JSON.parse(text)
        return {
          success: true,
          action: parsed.action || 'ADD_ITEM',
          items: (parsed.items || []).map((i: any) => ({
            product_name: cleanSpokenItemName(i.product_name) || i.product_name,
            quantity: Math.max(1, Math.round(Number(i.quantity) || 1)),
            unit: i.unit || 'item',
            category: i.category || 'other',
            brand: i.brand,
          })),
          spoken_text: parsed.spoken_text || 'Item updated in your list.',
          confidence: Number(parsed.confidence) || 0.95,
        }
      }
    } catch (geminiErr) {
      console.warn('Gemini AI call fallback to local NLP:', geminiErr)
    }
  }

  // 2. High-Precision Local NLP + Bilingual Engine Fallback
  const isHindiMode =
    /(karo|karein|hata|hatao|daal|daalo|chahiye|hai|hain|samaan|kaise|kaun|kya|batao|doodh|tamatar|aalu|pyaz)/i.test(
      cleanTranscript,
    )

  // A. Chit-chat & general Q&A
  const conv = checkConversationalQuery(cleanTranscript)
  if (conv.isConversational) {
    return {
      success: true,
      action: 'GENERAL_CHAT',
      items: [],
      spoken_text: isHindiMode ? conv.replyHindi : conv.replyEnglish,
      confidence: 0.95,
    }
  }

  // B. Recipe bundle (e.g. "Chai ka samaan")
  const bundle = matchRecipeBundle(cleanTranscript)
  if (bundle) {
    return {
      success: true,
      action: 'RECIPE_BUNDLE',
      items: bundle.items.map((i) => ({
        product_name: i.name,
        quantity: i.quantity,
        unit: i.unit || 'item',
        category: i.category || 'other',
      })),
      spoken_text: isHindiMode ? bundle.spokenHindi : bundle.spokenEnglish,
      confidence: 0.95,
    }
  }

  // C. Clear all command
  if (/(clear|remove all|delete all|khali karo|saare items hata|sab hata)/i.test(cleanTranscript)) {
    return {
      success: true,
      action: 'CLEAR_ALL',
      items: [],
      spoken_text: isHindiMode
        ? 'Aapki list se saare items hata diye gaye hain.'
        : 'All items have been removed from your list.',
      confidence: 0.98,
    }
  }

  // D. General Add / Remove parsing
  const localParsed = parseVoiceCommand(cleanTranscript)
  const intent = detectIntent(cleanTranscript)

  if (intent === 'remove') {
    const rawName = localParsed.items[0]?.name || cleanTranscript
    const cleanName = cleanSpokenItemName(rawName) || rawName
    return {
      success: true,
      action: 'REMOVE_ITEM',
      items: [
        {
          product_name: cleanName,
          quantity: 1,
          unit: 'item',
          category: 'other',
        },
      ],
      spoken_text: isHindiMode ? `${cleanName} hata diya gaya hai.` : `Removed ${cleanName} from your list.`,
      confidence: 0.9,
    }
  }

  // Default Add Items
  const itemsToAdd = localParsed.items.length > 0
    ? localParsed.items.map((i) => ({
        product_name: cleanSpokenItemName(i.name) || i.name,
        quantity: i.quantity || 1,
        unit: i.unit || 'item',
        category: i.category || 'other',
      }))
    : [
        {
          product_name: cleanSpokenItemName(cleanTranscript) || cleanTranscript,
          quantity: 1,
          unit: 'item',
          category: 'other',
        },
      ]

  const itemNames = itemsToAdd.map((i) => `${i.quantity > 1 ? i.quantity + ' ' : ''}${i.product_name}`).join(', ')
  const spoken = isHindiMode
    ? `${itemNames} aapki shopping list mein jod diya hai.`
    : `Added ${itemNames} to your cart.`

  return {
    success: true,
    action: 'ADD_ITEM',
    items: itemsToAdd,
    spoken_text: spoken,
    confidence: 0.92,
  }
}
