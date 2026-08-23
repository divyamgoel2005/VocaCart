import { CATEGORY_KEYWORDS } from '@/lib/api/mock-data'
import { attachBrandIfPackaged } from './bilingual-mapping'
import type {
  Category,
  ParsedItem,
  SearchFilters,
  VoiceCommandResult,
  VoiceIntent,
} from '@/lib/api/types'

const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, to: 2, too: 2, tu: 2, do: 2,
  three: 3, tree: 3, tin: 3, teen: 3, four: 4, for: 4, char: 4, chaar: 4,
  five: 5, paanch: 5, panch: 5, six: 6, chhe: 6, che: 6,
  seven: 7, saat: 7, eight: 8, ate: 8, aath: 8, ath: 8,
  nine: 9, nau: 9, ten: 10, dus: 10, das: 10,
  eleven: 11, twelve: 12, dozen: 12, couple: 2, few: 3, half: 1,
  ek: 1, aadha: 1, adha: 1,
}

const UNIT_WORDS = [
  'bottle', 'bottles', 'pack', 'packs', 'packet', 'packets', 'can', 'cans',
  'litre', 'litres', 'liter', 'liters', 'l', 'kg', 'kilo', 'kilos', 'kilogram',
  'gram', 'grams', 'g', 'ml', 'loaf', 'loaves', 'dozen', 'box', 'boxes',
  'bag', 'bags', 'piece', 'pieces', 'pcs', 'bunch', 'jar', 'jars', 'pouch', 'pouches',
  // Hinglish units
  'dabba', 'dabbe', 'thela', 'theli', 'gaddi'
]

const PHONETIC_CORRECTIONS: Record<string, string> = {
  mangi: 'Maggi Noodles',
  magi: 'Maggi Noodles',
  meggi: 'Maggi Noodles',
  meggie: 'Maggi Noodles',
  maggy: 'Maggi Noodles',
  dhoodh: 'Milk',
  dudh: 'Milk',
  doodh: 'Milk',
  dude: 'Milk',
  dooth: 'Milk',
  dhud: 'Milk',
  makhan: 'Butter',
  makkhan: 'Butter',
  chawal: 'Rice',
  chaaval: 'Rice',
  chawul: 'Rice',
  anda: 'Eggs',
  ande: 'Eggs',
  paani: 'Water',
  pani: 'Water',
  chai: 'Tea',
  chay: 'Tea',
  chaai: 'Tea',
  chini: 'Sugar',
  cheeni: 'Sugar',
  namak: 'Salt',
  tel: 'Cooking Oil',
  biskit: 'Biscuits',
  biscut: 'Biscuits',
  biscutts: 'Biscuits',
  'parle-g': 'Parle-G Biscuits',
  'parleg': 'Parle-G Biscuits',
  parle: 'Parle-G Biscuits',
  oreo: 'Oreo Biscuits',
  bourbon: 'Bourbon Biscuits',
  'good day': 'Good Day Biscuits',
  tamater: 'Tomatoes',
  tomater: 'Tomatoes',
  tamatar: 'Tomatoes',
  allu: 'Potatoes',
  aalu: 'Potatoes',
  aloo: 'Potatoes',
  alu: 'Potatoes',
  piyaz: 'Onions',
  piaz: 'Onions',
  pyaj: 'Onions',
  pyaz: 'Onions',
  seb: 'Apples',
  kela: 'Bananas',
  adrak: 'Ginger',
  lahsun: 'Garlic',
  lasun: 'Garlic',
  dhaniya: 'Coriander',
  mirch: 'Green Chillies',
  mirchi: 'Green Chillies',
}

// Complete list of Hindi & English particles, helper verbs, postpositions, and conjunctions
export const HINDI_STOP_WORDS = new Set([
  // Hindi postpositions & particles
  'ko', 'ka', 'ki', 'ke', 'kar', 'karein', 'karo', 'karna', 'karke',
  'se', 'me', 'mein', 'par', 'pe', 'bhi', 'toh', 'to', 'hi', 'wala',
  'wali', 'wale', 'sa', 'si', 'se',
  // Hindi auxiliary verbs
  'do', 'de', 'dena', 'dedo', 'lo', 'le', 'lena', 'lelo', 'lana', 'lao',
  'daal', 'daalo', 'daalna', 'jodo', 'jod', 'rakho', 'rakh', 'hatao', 'hata',
  'hatana', 'nikalo', 'nikal', 'nikalna', 'chahiye', 'hai', 'hain', 'tha',
  'the', 'thi', 'aur', 'karna', 'hoga', 'hogi', 'aao',
  // English filler words
  'of', 'the', 'some', 'please', 'a', 'an', 'i', 'want', 'need', 'to',
  'buy', 'get', 'add', 'me', 'my', 'and', 'also', 'just', 'item', 'items', 'all'
])

export function inferNaturalUnit(name: string, userUnit?: string): string {
  if (userUnit && userUnit !== 'item' && userUnit !== 'items') {
    const u = userUnit.toLowerCase().trim()
    if (u === 'kilos' || u === 'kilo' || u === 'kilogram') return 'kg'
    if (u === 'litres' || u === 'liters' || u === 'liter' || u === 'l') return 'litre'
    if (u === 'packets' || u === 'packet' || u === 'packs') return 'pack'
    if (u === 'pieces' || u === 'piece') return 'pcs'
    if (u === 'bottles') return 'bottle'
    if (u === 'boxes') return 'box'
    return u
  }

  const lower = name.toLowerCase()

  // Fresh produce, vegetables, fruits, flours, grains, sugar, salt
  if (
    /(tomato|tamatar|potato|aloo|onion|pyaz|apple|seb|mango|aam|banana|kela|grape|angoor|orange|santra|carrot|gajar|cucumber|kheera|atta|flour|rice|chawal|dal|salt|namak|sugar|cheeni|vegetable|fruit)/i.test(
      lower
    )
  ) {
    return 'kg'
  }

  // Liquids (Milk, Oil, Water, Juices, Cleaners)
  if (/(milk|doodh|dudh|oil|tel|ghee|water|pani|juice|shampoo|cleaner|lizol|harpic|detergent)/i.test(lower)) {
    return 'litre'
  }

  // Biscuits, Bread, Noodles, Butter, Cheese, Tea, Coffee, Chips
  if (
    /(biscuit|oreo|parle|bourbon|good day|cookie|bread|noodle|maggi|butter|makhan|cheese|paneer|curd|dahi|tea|chai|coffee|chips|namkeen|soap|dettol)/i.test(
      lower
    )
  ) {
    return 'pack'
  }

  // Countables
  if (/(egg|anda|ande|lemon|nimbu|coconut)/i.test(lower)) {
    return 'pcs'
  }

  return 'pack'
}

export function isClearAllCommand(text: string): boolean {
  const t = text.toLowerCase().trim()

  // 1. If a specific grocery item is mentioned (e.g. "remove all the milk", "remove all apples", "delete all eggs", "saara doodh hata do", "saare tamatar hata do"),
  // this is a TARGETED item removal, NOT a full cart clear!
  const hasSpecificGrocery = /\b(milk|doodh|dudh|butter|makhan|cheese|paneer|curd|dahi|tomato|tamatar|potato|aloo|onion|pyaz|apple|seb|banana|kela|bread|atta|salt|namak|tea|chai|coffee|maggi|oil|biscuit|biscuits|oreo|parle|rice|chawal|dal|eggs|anda|ande|lemon|nimbu|sugar|cheeni|soap|detergent)\b/i.test(t)
  if (hasSpecificGrocery) {
    return false
  }

  // 2. Direct exact short phrases (Hindi, English, Hinglish)
  if (/^(cart empty|empty cart|clear cart|cart clear|clean cart|cart clean|list empty|empty list|clear list|list clear|cart khali|khali cart|list khali|khali list|sab hata do|sab delete|delete all|clear all|remove all|empty all)$/i.test(t)) {
    return true
  }

  // 3. English Clear / Empty Cart Patterns
  const englishClearPatterns = [
    /\b(remove|delete|clear|empty|clean|drop|wipe|reset)\s+(all\s+)?(the\s+)?(cart|list|items?|everything)\b/i,
    /\b(remove|delete|clear|empty|clean|drop|wipe|reset)\s+(all|everything)\b/i,
    /\b(empty|clear|clean|reset)\s+(the\s+)?(cart|list)\b/i,
    /\b(cart|list)\s+(empty|clear|clean|reset)\b/i,
    /\b(remove|delete)\s+(the\s+)?(cart|list)\b/i,
    /\bclear\s*all\b/i,
    /\bempty\s*all\b/i,
    /\bdelete\s*all\b/i,
    /\bremove\s*all\b/i,
  ]
  if (englishClearPatterns.some((pattern) => pattern.test(t))) {
    return true
  }

  // 4. Hindi / Hinglish Clear / Empty Cart Patterns
  const hindiClearPatterns = [
    /(cart|list|samaan|saman|items?)\s*(ko)?\s*(khali|empty|saaf|clear|delete|remove|hata|hatao)/i,
    /(khali|empty|saaf|clear)\s+(kar|karo|karna|do|kardo|karein|kar do|kijiye)/i,
    /(saare|saara|sabhi|sab|pura|puri|poori|poora)\s+(items?|samaan|saman|list|cart|kuch)?\s*(ko)?\s*(hata|nikal|delete|remove|saaf|khali|clear|empty)/i,
    /^(sab|sabhi|saare|saara|poora|pura)\s*(kuch)?\s*(hatao|hata do|hata|nikalo|nikal do|delete karo|delete kar do|remove karo|remove kar do|khali karo|khali kar do|empty karo|empty kar do)$/i,
    /(kuch|kuch bhi)\s*mat\s*(rakho|rakhna)/i,
    /(cart|list)\s*(se)?\s*(sab|saara|saare|poora|sab kuch)\s*(hata|nikal|delete|remove)/i,
  ]
  if (hindiClearPatterns.some((pattern) => pattern.test(t))) {
    return true
  }

  return false
}

export function isReadListCommand(text: string): boolean {
  const t = text.toLowerCase().trim()
  return (
    /(kya kya hai|kya hai list mein|cart mein kya|list batao|cart batao|kya bacha hai|kya items hain)/i.test(t) ||
    /\b(what is in my list|what's in my list|show list|read list|read my cart|what do i have|list items)\b/i.test(t)
  )
}

export function isTotalBillCommand(text: string): boolean {
  const t = text.toLowerCase().trim()
  return (
    /(kitna kharcha|kitna bill|total kitna|total batao|kitne paise|kitna hua)/i.test(t) ||
    /\b(how much|total bill|total cost|total price|what's my total|estimated bill|cart value)\b/i.test(t)
  )
}

export function isUndoCommand(text: string): boolean {
  const t = text.toLowerCase().trim()
  return (
    /(undo|wapas lo|wapas karo|galti se|revert|cancel last|pichla action)/i.test(t)
  )
}

export function isCheckOffCommand(text: string): { isCheck: boolean; itemName: string } {
  const t = text.toLowerCase().trim()
  const match = t.match(/(?:le liya|kharid liya|khareed liya|tick kar|check off|mark as done|done with|ho gaya)\s*(.*)/i) ||
                t.match(/(.*?)\s*(?:le liya|kharid liya|khareed liya|tick kar do|check off|done|ho gaya)/i)

  if (match && match[1]) {
    const raw = match[1].replace(/\b(ko|ka|ki|ke|bhi)\b/gi, ' ').trim()
    const clean = cleanSpokenItemName(raw)
    if (clean) return { isCheck: true, itemName: clean }
  }
  return { isCheck: false, itemName: '' }
}

export function cleanSpokenItemName(raw: string): string {
  if (!raw) return ''
  
  const tokens = raw
    .trim()
    .replace(/\b(all the|all of the|all|saara|saare|sabhi)\b/gi, ' ')
    .replace(/[^a-zA-Z0-9\s.]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  const filtered = tokens.filter((t) => !HINDI_STOP_WORDS.has(t.toLowerCase()))

  if (filtered.length === 0) {
    return titleCase(raw.trim())
  }
  return titleCase(filtered.join(' '))
}

function classify(name: string): Category {
  const lower = name.toLowerCase()
  for (const word of lower.split(/\s+/)) {
    const singular = word.replace(/s$/, '')
    if (CATEGORY_KEYWORDS[word]) return CATEGORY_KEYWORDS[word]
    if (CATEGORY_KEYWORDS[singular]) return CATEGORY_KEYWORDS[singular]
  }
  if (/(atta|rice|wheat|dal|oil|sugar|salt|spice|masala)/i.test(lower)) return 'produce'
  if (/(milk|curd|paneer|butter|cheese|ghee|doodh)/i.test(lower)) return 'dairy'
  if (/(bread|buns|cake|toast|pav)/i.test(lower)) return 'bakery'
  if (/(maggi|chips|cookie|biscuit|oreo|snack|namkeen|kurkure)/i.test(lower)) return 'snacks'
  if (/(tea|chai|coffee|juice|water|soda|coke|pepsi)/i.test(lower)) return 'beverages'
  if (/(soap|surf|shampoo|paste|cleaner|detergent|harpic|dettol)/i.test(lower)) return 'household'
  return 'other'
}

export function titleCase(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function parseFragment(fragment: string): ParsedItem | null {
  // Pre-clean compound Hindi verb phrases ending in "do"
  const cleanedFragment = fragment
    .replace(/\b(add|remove|delete|update|drop)\s+(kar|karo|hata|hatao|daal|daalo|nikal|nikalo)?\s*do\b/gi, ' ')
    .replace(/\b(kar|karo|hata|hatao|daal|daalo|nikal|nikalo|de|dedo|le|lelo|rakh|rakho|bhej)\s+do\b/gi, ' ')
    .replace(/\b(kardo|hatado|daaldo|nikaldo|dedo|lelo|rakhdo)\b/gi, ' ')

  const rawTokens = cleanedFragment
    .toLowerCase()
    .replace(/[^a-z0-9\s.]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  if (rawTokens.length === 0) return null

  // Apply phonetic corrections
  const tokens = rawTokens.map((t) => (PHONETIC_CORRECTIONS[t] ? PHONETIC_CORRECTIONS[t].toLowerCase() : t))

  let quantity = 1
  let quantityExplicitlyFound = false
  let unit: string | undefined
  const nameParts: string[] = []

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const nextToken = tokens[i + 1]

    if (/^\d+$/.test(token)) {
      if (!quantityExplicitlyFound) {
        quantity = parseInt(token, 10)
        quantityExplicitlyFound = true
      }
      continue
    }

    if (NUMBER_WORDS[token] !== undefined) {
      if (!quantityExplicitlyFound) {
        quantity = NUMBER_WORDS[token]
        quantityExplicitlyFound = true
      }
      continue
    }

    if (token === 'do') {
      const isFollowedByUnitOrNoun = nextToken && !HINDI_STOP_WORDS.has(nextToken)
      if (!quantityExplicitlyFound && isFollowedByUnitOrNoun) {
        quantity = 2
        quantityExplicitlyFound = true
        continue
      } else {
        continue
      }
    }

    if (UNIT_WORDS.includes(token)) {
      unit = token
      continue
    }

    if (HINDI_STOP_WORDS.has(token)) {
      continue
    }

    nameParts.push(token)
  }

  if (nameParts.length === 0) return null

  let rawName = nameParts.join(' ')
  if (PHONETIC_CORRECTIONS[rawName.toLowerCase()]) {
    rawName = PHONETIC_CORRECTIONS[rawName.toLowerCase()]
  }

  const name = cleanSpokenItemName(rawName)
  if (!name) return null

  const brandedName = attachBrandIfPackaged(name)
  const finalUnit = inferNaturalUnit(brandedName, unit)
  return { name: brandedName, quantity, unit: finalUnit, category: classify(brandedName) }
}

export function detectIntent(text: string): VoiceIntent {
  const t = text.toLowerCase()
  if (isClearAllCommand(t)) return 'remove'
  if (isReadListCommand(t)) return 'read_list'
  if (isTotalBillCommand(t)) return 'total_bill'
  if (isUndoCommand(t)) return 'undo'
  if (/\b(find|search|show|look for|dhoondo|dikhao|kya hai)\b/.test(t)) return 'search'
  if (/\b(remove|delete|drop|hata|nikal|hatao|nikalo|hata do|nikal do)\b/.test(t)) return 'remove'
  return 'add'
}

function parseSearch(transcript: string): { term: string; filters: SearchFilters } {
  const working = transcript.toLowerCase()
  const filters: SearchFilters = {}

  if (working.includes('organic') || working.includes('natural')) {
    filters.organic = true
  }

  const priceMatch =
    working.match(/(?:under|below|less than|max|maximum|kam)\s+(?:₹|\$|rs\.?|rupees)?\s*(\d+(?:\.\d+)?)/i) ||
    working.match(/(\d+(?:\.\d+)?)\s*(?:₹|\$|rs\.?|rupees)?\s*(?:se kam|ke andar)/i)
  if (priceMatch) {
    filters.maxPrice = parseFloat(priceMatch[1])
  }

  const sizeMatch = working.match(/(\d+(?:\.\d+)?)\s?(litre|litres|liter|l|ml|kg|g|gram|grams)\b/)
  if (sizeMatch) {
    filters.size = `${sizeMatch[1]} ${sizeMatch[2]}`
  }

  const brands = ['dove', 'colgate', 'himalaya', 'amul', 'tata', 'nestle', 'fortune', 'aashirvaad', 'patanjali', 'britannia', 'lays', 'kurkure', 'oreo']
  for (const b of brands) {
    if (new RegExp(`\\b${b}\\b`).test(working)) {
      filters.brand = b
      break
    }
  }

  const term = cleanSpokenItemName(
    working
      .replace(/\b(find|search|show me|show|look for|do you have|for|me|dhoondo|dikhao)\b/g, ' ')
      .replace(/[₹$€£]/g, ' ')
      .replace(/\s+/g, ' ')
  )

  return { term, filters }
}

export function parseVoiceCommand(transcript: string): VoiceCommandResult {
  const clean = transcript.trim()
  const intent = detectIntent(clean)

  if (intent === 'search') {
    const { term, filters } = parseSearch(clean)
    return { transcript: clean, intent, items: [], searchTerm: term, filters }
  }

  // Multi-item splitting on commas, "and", "aur", "plus", "saath mein", "&"
  const fragments = clean
    .replace(/\bsaath\s+mein\b/gi, ' and ')
    .split(/,|\band\b|\bplus\b|\baur\b|&/i)

  const items = fragments
    .map(parseFragment)
    .filter((x): x is ParsedItem => x !== null)

  if (items.length === 0 && clean.length > 0) {
    const direct = parseFragment(clean)
    if (direct) items.push(direct)
  }

  return { transcript: clean, intent, items }
}
