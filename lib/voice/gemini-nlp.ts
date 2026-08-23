// Gemini 2.5 Flash & NLP Hybrid Voice Understanding Engine

import { GoogleGenAI } from '@google/genai'
import { parseVoiceCommand, detectIntent, cleanSpokenItemName, inferNaturalUnit } from './parser'
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

// Brand associations for generic packaged groceries (used ONLY when user didn't specify a brand)
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
      "product_name": "Exact product name with brand (e.g. if user says 'oreo biscuit', product_name MUST be 'Oreo Biscuits'; if generic 'milk', 'Amul Milk'; if fruit/veggie 'Tomatoes')",
      "brand": "Brand name if present or applicable, else empty string",
      "quantity": number (default 1),
      "unit": "kg" | "g" | "litre" | "ml" | "pack" | "pcs" | "bottle" | "box",
      "category": "produce" | "dairy" | "bakery" | "snacks" | "beverages" | "household" | "other"
    }
  ],
  "spoken_text": "A friendly voice reply in the user's spoken language mentioning quantity, unit, and product name with brand.",
  "confidence": 0.95
}

Rules:
1. Exact Brand Preservation: If the user explicitly mentions a brand (e.g. 'Oreo biscuit', 'Bourbon', 'Mother Dairy milk', 'Lays chips', 'Good Day', 'Patanjali'), preserve that exact brand!
2. Default Brand Rule: If the user says a generic packaged product without a brand (e.g. 'milk' -> Amul Milk, 'salt' -> Tata Salt, 'atta' -> Aashirvaad Atta), attach the standard company name.
3. Fresh Produce: Fruits and vegetables (Tomato, Potato, Apple, Onion, Banana, etc.) have NO brand name.
4. Units: Assign natural grocery units like 'kg' for produce/staples, 'litre' or 'ml' for liquids/milk, 'pack' for biscuits/noodles/bread, 'pcs' for eggs/lemons.
5. If the user says 'remove all [item]' (e.g. 'remove all milk'), action is REMOVE_ITEM for that item, NOT CLEAR_ALL.`

function attachBrandIfPackaged(itemName: string): string {
  const lower = itemName.toLowerCase().trim()
  
  // 1. Fresh fruits or vegetables -> strictly NO brand prefix
  if (PRODUCE_KEYWORDS.has(lower) || Array.from(PRODUCE_KEYWORDS).some((p) => lower.includes(p))) {
    return itemName
  }

  // 2. Check if a brand is already explicitly mentioned by the user
  // (e.g. Oreo, Bourbon, Hide & Seek, Good Day, Parle, Britannia, Sunfeast, Mother Dairy, Nestle, Lays, Cadbury, etc.)
  if (
    /(oreo|bourbon|hide & seek|good day|marie|monaco|krackjack|parle|britannia|sunfeast|amul|mother dairy|safal|nestle|tata|fortune|aashirvaad|maggi|knorr|top ramen|yippee|lays|kurkure|bingo|haldiram|bikaji|balaji|cadbury|dairy milk|kitkat|snickers|lipton|taj mahal|red label|wagh bakri|society|nescafe|bru|colgate|pepsodent|sensodyne|close up|dettol|lifebuoy|dove|pears|lux|surf|ariel|tide|vim|pril|harpic|lizol|dabar|patanjali|everest|mdh|catch|saffola|dhara|gemini)/i.test(
      lower
    )
  ) {
    return itemName // Keep exact user specified brand!
  }

  // 3. Fallback to default brand ONLY if user gave a generic packaged product
  for (const [k, branded] of Object.entries(BRAND_ASSOCIATIONS)) {
    if (lower === k || lower.split(/\s+/).includes(k)) {
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
            unit: i.unit || inferNaturalUnit(i.product_name),
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
        unit: i.unit || inferNaturalUnit(i.name),
        category: i.category || 'other',
      })),
      spoken_text: isHindiMode ? bundle.spokenHindi : bundle.spokenEnglish,
      confidence: 0.95,
    }
  }

  // C. General Add / Remove parsing
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
        const unitToUse = inferNaturalUnit(brandedName, i.unit)
        return {
          product_name: brandedName,
          quantity: i.quantity || 1,
          unit: unitToUse,
          category: i.category || 'other',
        }
      })
    : [
        {
          product_name: attachBrandIfPackaged(cleanSpokenItemName(cleanTranscript) || cleanTranscript),
          quantity: 1,
          unit: inferNaturalUnit(cleanTranscript),
          category: 'other',
        },
      ]

  const itemDescriptions = itemsToAdd
    .map((i) => `${i.quantity} ${i.unit !== 'item' ? i.unit + ' ' : ''}${i.product_name}`)
    .join(', ')

  const spoken = isHindiMode
    ? `${itemDescriptions} aapki shopping list mein jod diya hai.`
    : `Added ${itemDescriptions} to your cart.`

  return {
    success: true,
    action: 'ADD_ITEM',
    items: itemsToAdd,
    spoken_text: spoken,
    confidence: 0.92,
  }
}
