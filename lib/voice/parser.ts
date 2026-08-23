import { CATEGORY_KEYWORDS } from '@/lib/api/mock-data'
import type {
  Category,
  ParsedItem,
  SearchFilters,
  VoiceCommandResult,
  VoiceIntent,
} from '@/lib/api/types'

const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  dozen: 12, couple: 2, few: 3, half: 1,
  // Hinglish / Hindi numbers
  ek: 1, teen: 3, tin: 3, char: 4, chaar: 4, paanch: 5, panch: 5,
  chhe: 6, che: 6, saat: 7, aath: 8, ath: 8, nau: 9, dus: 10, das: 10,
  aadha: 1, adha: 1,
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
  dhoodh: 'Milk',
  dudh: 'Milk',
  doodh: 'Milk',
  makhan: 'Butter',
  makkhan: 'Butter',
  chawal: 'Rice',
  chaaval: 'Rice',
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
  'buy', 'get', 'add', 'me', 'my', 'and', 'also', 'just', 'item', 'items'
])

export function isClearAllCommand(text: string): boolean {
  const t = text.toLowerCase().trim()

  // 1. English Clear All patterns
  if (/\b(remove all|delete all|clear all|clear list|clear cart|empty list|empty cart|remove everything|delete everything|clean list|reset list|drop all|delete all items|remove all items)\b/i.test(t)) {
    return true
  }

  // 2. Hindi / Hinglish Clear All patterns
  if (/(saare|saara|sabhi|sab|pura|poori|poora)\s+(items?|samaan|saman|list|cart|kuch)?\s*(ko)?\s*(hata|nikal|delete|remove|saaf|khali|clear)/i.test(t)) {
    return true
  }
  if (/(list|cart)\s*(ko)?\s*(khali|saaf|empty|clear)\s*(kar|karo|karna|do|kardo)/i.test(t)) {
    return true
  }
  if (/(sab|sabhi|saare|saara)\s*(kuch)?\s*(hatao|hata do|nikalo|nikal do|delete karo|remove karo|hata do na)/i.test(t)) {
    return true
  }
  if (/(kuch|kuch bhi)\s*mat\s*(rakho|rakhna)/i.test(t)) {
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
  if (/(maggi|chips|cookie|biscuit|snack|namkeen|kurkure)/i.test(lower)) return 'snacks'
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

  return { name, quantity, unit, category: classify(name) }
}

export function detectIntent(text: string): VoiceIntent {
  const t = text.toLowerCase()
  if (isClearAllCommand(t)) return 'remove'
  if (isReadListCommand(t)) return 'read_list'
  if (isTotalBillCommand(t)) return 'total_bill'
  if (isUndoCommand(t)) return 'undo'
  if (/\b(find|search|show|look for|dhoondo|dikhao|kya hai)\b/.test(t)) return 'search'
  if (/\b(remove|delete|drop|take out|cancel|hatao|hata do|hata|nikalo|nikal do|mat lena)\b/.test(t)) return 'remove'
  if (/\b(change|update|make it|set|badlo)\b/.test(t)) return 'update'
  if (/\b(add|buy|get|want|need|put|grab|jodo|daalo|daal do|le lo|chahiye|lao)\b/.test(t)) return 'add'
  return 'add'
}

function parseSearch(text: string): { term: string; filters: SearchFilters } {
  const filters: SearchFilters = {}
  let working = text.toLowerCase()

  const priceMatch = working.match(/(?:under|below|less than|upto|up to|se kam)\s*([₹$€£]?)\s*(\d+(?:\.\d+)?)/)
  if (priceMatch) {
    filters.maxPrice = parseFloat(priceMatch[2])
    filters.currency = priceMatch[1] || '₹'
    working = working.replace(priceMatch[0], ' ')
  }

  if (/\borganic\b/.test(working)) {
    filters.organic = true
  }

  const sizeMatch = working.match(/(\d+(?:\.\d+)?)\s?(litre|litres|liter|l|ml|kg|g|gram|grams)\b/)
  if (sizeMatch) {
    filters.size = `${sizeMatch[1]} ${sizeMatch[2]}`
  }

  const brands = ['dove', 'colgate', 'himalaya', 'amul', 'tata', 'nestle', 'fortune', 'aashirvaad', 'patanjali', 'britannia', 'lays', 'kurkure']
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
