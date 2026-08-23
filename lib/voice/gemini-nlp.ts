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

// Brand associations for common packaged groceries
const BRAND_ASSOCIATIONS: Record<string, string> = {
  milk: 'Amul Milk',
  doodh: 'Amul Milk',
  dudh: 'Amul Milk',
  butter: 'Amul Butter',
  makhan: 'Amul Butter',
  cheese: 'Amul Cheese',
  paneer: 'Amul Paneer',
  curd: 'Mother Dairy Curd',
  dahi: 'Mother Dairy Curd',
  atta: 'Aashirvaad Atta',
  flour: 'Aashirvaad Atta',
  salt: 'Tata Salt',
  namak: 'Tata Salt',
  tea: 'Tata Tea',
  chai: 'Tata Tea',
  coffee: 'Nescafe Coffee',
  bread: 'Britannia Bread',
  biscuit: 'Parle-G Biscuits',
  biscuits: 'Parle-G Biscuits',
  noodles: 'Maggi Noodles',
  maggi: 'Maggi Noodles',
  oil: 'Fortune Oil',
  tel: 'Fortune Oil',
  toothpaste: 'Colgate Toothpaste',
  soap: 'Dettol Soap',
  detergent: 'Surf Excel Detergent',
}

const PRODUCE_KEYWORDS = new Set([
  'tomato', 'tamatar', 'potato', 'aloo', 'aalu', 'onion', 'pyaz', 'apple', 'seb',
  'banana', 'kela', 'orange', 'santra', 'grapes', 'angoor', 'mango', 'aam',
  'ginger', 'adrak', 'garlic', 'lehsun', 'chilli', 'mirchi', 'lemon', 'nimbu',
  'cucumber', 'kheera', 'carrot', 'gajar', 'coriander', 'dhaniya', 'spinach', 'palak',
])

const SYSTEM_PROMPT = `You are VocaCart AI, an expert bilingual (Hindi, Hinglish, English) voice grocery assistant.
Analyze the user's voice command and extract structured grocery actions.

Return JSON adhering to this exact schema:
{
  "action": "ADD_ITEM" | "REMOVE_ITEM" | "CLEAR_ALL" | "READ_LIST" | "TOTAL_BILL" | "CHECK_OFF" | "RECIPE_BUNDLE" | "GENERAL_CHAT" | "SEARCH",
  "items": [
    {
      "product_name": "Product name with Company/Brand if applicable (e.g. Amul Milk, Tata Salt, Maggi Noodles, Britannia Bread) or pure generic name for fresh produce/fruits/vegetables (e.g. Tomato, Potato, Apple, Onion)",
      "brand": "Company/Brand name if applicable (e.g. Amul, Tata, Fortune, Britannia, Nestle) or empty string for fresh fruits/vegetables",
      "quantity": number (default 1),
      "unit": "packet" | "kg" | "g" | "litre" | "bottle" | "box" | "piece" | "item",
      "category": "produce" | "dairy" | "bakery" | "snacks" | "beverages" | "household" | "other"
    }
  ],
  "spoken_text": "A friendly voice reply in the user's spoken language mentioning company/brand for packaged items and generic name for fruits/veggies.",
  "confidence": 0.95
}

Rules:
1. Brand/Company Name Rule: If the item is a packaged product (e.g., Milk -> Amul Milk, Salt -> Tata Salt, Bread -> Britannia Bread, Noodles -> Maggi Noodles, Atta -> Aashirvaad Atta), include the company name in product_name and spoken_text. For fresh fruits and vegetables (Tomato, Potato, Apple, Onion, Banana, etc.), do NOT include any company name.
2. Produce vs Derivative: Raw fruits/vegetables should NOT match processed derivatives (like Apple Juice or Tomato Sauce) unless explicitly requested.
3. Hindi Numbers: ek=1, do=2, teen=3, char=4, paanch=5, aadha=0.5.
4. If the user asks general questions or small talk, set action to "GENERAL_CHAT".
5. If the user says "remove all" or "saare items hata do", set action to "CLEAR_ALL".`

function attachBrandIfPackaged(itemName: string): string {
  const lower = itemName.toLowerCase().trim()
  // Check if it is a fresh fruit or vegetable
  if (PRODUCE_KEYWORDS.has(lower) || Array.from(PRODUCE_KEYWORDS).some(p => lower.includes(p))) {
    return itemName
  }

  // Check if brand is already present
  if (/(amul|tata|fortune|aashirvaad|britannia|maggi|nestle|parle|surf|dettol|colgate|mother dairy)/i.test(lower)) {
    return itemName
  }

  // Lookup default brand
  for (const [k, branded] of Object.entries(BRAND_ASSOCIATIONS)) {
    if (lower === k || lower.includes(k)) {
      return branded
    }
  }

  return itemName
}

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
            product_name: i.product_name,
            quantity: Math.max(1, Math.round(Number(i.quantity) || 1)),
            unit: i.unit || 'item',
            category: i.category || 'other',
            brand: i.brand,
          })),
          spoken_text: parsed.spoken_text || 'Updated item in your list.',
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
    const brandedName = attachBrandIfPackaged(cleanName)
    return {
      success: true,
      action: 'REMOVE_ITEM',
      items: [
        {
          product_name: brandedName,
          quantity: 1,
          unit: 'item',
          category: 'other',
        },
      ],
      spoken_text: isHindiMode ? `${brandedName} hata diya gaya hai.` : `Removed ${brandedName} from your list.`,
      confidence: 0.9,
    }
  }

  // Default Add Items
  const itemsToAdd = localParsed.items.length > 0
    ? localParsed.items.map((i) => {
        const cleanName = cleanSpokenItemName(i.name) || i.name
        const brandedName = attachBrandIfPackaged(cleanName)
        return {
          product_name: brandedName,
          quantity: i.quantity || 1,
          unit: i.unit || 'item',
          category: i.category || 'other',
        }
      })
    : [
        {
          product_name: attachBrandIfPackaged(cleanSpokenItemName(cleanTranscript) || cleanTranscript),
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
