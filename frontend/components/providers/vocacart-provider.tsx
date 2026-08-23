'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  addShoppingItem,
  getShoppingList,
  getSuggestions,
  removeShoppingItem,
  searchProducts,
  toggleItemComplete,
  updateItemQuantity,
  processVoiceBackend,
  undoLastAction,
  mapToCategory,
  nextId,
  getLocalStoredItems,
  setLocalStoredItems,
  type ActivityEvent,
  type LanguageCode,
  type ParsedItem,
  type Product,
  type SearchFilters,
  type ShoppingItem,
  type Suggestion,
  type VoiceCommandResult,
} from '@/lib/api'
import { getStrings, LANGUAGES, type Strings } from '@/lib/i18n/translations'
import {
  ASSISTANT_PHRASES,
  randomPhrase,
  SEARCH_PHRASES,
} from '@/lib/voice/demo-phrases'
import {
  parseVoiceCommand,
  detectIntent,
  cleanSpokenItemName,
  isClearAllCommand,
  isReadListCommand,
  isTotalBillCommand,
  isUndoCommand,
  isCheckOffCommand,
} from '@/lib/voice/parser'
import { areItemsEquivalent, attachBrandIfPackaged } from '@/lib/voice/bilingual-mapping'
import { matchRecipeBundle } from '@/lib/voice/recipes'
import { checkConversationalQuery } from '@/lib/voice/conversational-responses'
import { formatHindiForTTS } from '@/lib/voice/transliterate'
import {
  createSimulatedRecognizer,
  createSpeechRecognizer,
  isSpeechSupported,
  type Recognizer,
  type RecognizerError,
} from '@/lib/voice/recognition'

export type VoiceStatus =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'success'
  | 'error'
export type Mode = 'assistant' | 'search'

interface SearchState {
  term: string
  filters: SearchFilters
  results: Product[]
  loading: boolean
  error: boolean
  hasSearched: boolean
}

interface VocaCartValue {
  // config
  language: LanguageCode
  setLanguage: (code: LanguageCode) => void
  strings: Strings
  mode: Mode
  setMode: (mode: Mode) => void
  speechSupported: boolean

  // list
  items: ShoppingItem[]
  loadingList: boolean
  removeItem: (id: string) => void
  clearAllItems: () => Promise<void>
  changeQuantity: (id: string, quantity: number) => void
  toggleComplete: (id: string) => void
  addParsedItem: (item: ParsedItem, shouldSpeak?: boolean) => void
  addSuggestion: (s: Suggestion) => void
  undo: () => void

  // suggestions
  suggestions: Suggestion[]
  loadingSuggestions: boolean

  // history
  history: ActivityEvent[]

  // voice
  voiceStatus: VoiceStatus
  voiceError: RecognizerError | null
  partialTranscript: string
  lastResult: VoiceCommandResult | null
  startListening: () => void
  startSample: () => void
  stopListening: () => void
  resetVoice: () => void
  clarifyingQuestion: string | null
  confirmClarification: () => void
  dismissClarification: () => void

  // search
  search: SearchState
  runSearch: (term: string, filters?: SearchFilters) => void
}

const VocaCartContext = createContext<VocaCartValue | null>(null)

const emptySearch: SearchState = {
  term: '',
  filters: {},
  results: [],
  loading: false,
  error: false,
  hasSearched: false,
}

export function VocaCartProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en')
  const [mode, setMode] = useState<Mode>('assistant')
  const [speechSupported, setSpeechSupported] = useState(false)

  // Clean empty initial cart
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loadingList, setLoadingList] = useState(true)

  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)

  const [history, setHistory] = useState<ActivityEvent[]>([])

  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle')
  const [voiceError, setVoiceError] = useState<RecognizerError | null>(null)
  const [partialTranscript, setPartialTranscript] = useState('')
  const [lastResult, setLastResult] = useState<VoiceCommandResult | null>(null)
  const [clarifyingQuestion, setClarifyingQuestion] = useState<string | null>(null)
  const [lastSuggestedProduct, setLastSuggestedProduct] = useState<string>('')

  const [search, setSearch] = useState<SearchState>(emptySearch)

  const recognizerRef = useRef<Recognizer | null>(null)
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isProcessingRef = useRef<boolean>(false)

  const strings = useMemo(() => getStrings(language), [language])

  // --- Primary Natural/Neural Voice Persona ---
  const getPrimaryIndianVoice = useCallback((isHindi: boolean): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
    const voices = window.speechSynthesis.getVoices()
    if (!voices || voices.length === 0) return null

    // Strictly filter out non-Hindi / non-English voices (prevents Android Google Español bug)
    const validVoices = voices.filter(
      (v) =>
        !v.lang.startsWith('es') &&
        !v.lang.startsWith('pt') &&
        !v.lang.startsWith('fr') &&
        !v.lang.startsWith('de') &&
        !v.lang.startsWith('it') &&
        !v.lang.startsWith('zh') &&
        !v.lang.startsWith('ja') &&
        !v.lang.startsWith('ru') &&
        !/español|spanish|portugu|french|deutsch|italian/i.test(v.name)
    )

    const pool = validVoices.length > 0 ? validVoices : voices

    if (isHindi) {
      // 1. Exact Hindi voices (Google हिन्दी, Microsoft Swara, Microsoft Madhur, Apple Lekha, hi-IN)
      const exactHindi = pool.find(
        (v) =>
          (v.lang === 'hi-IN' || v.lang === 'hi_IN' || v.lang.startsWith('hi')) &&
          /hindi|हिन्दी|swara|madhur|kalpana|lekha|google/i.test(v.name + ' ' + v.lang)
      )
      if (exactHindi) return exactHindi

      const anyHindi = pool.find(
        (v) =>
          v.lang.startsWith('hi') ||
          /(\bhi-in\b|swara|madhur|kalpana|lekha|हिन्दी|hindi)/i.test(v.name + ' ' + v.lang)
      )
      if (anyHindi) return anyHindi

      // Fallback to Indian English (strictly en-IN)
      const indianEn = pool.find(
        (v) => (v.lang === 'en-IN' || v.lang === 'en_IN' || /neerja|prabhat|rishi|india/i.test(v.name)) && v.lang.startsWith('en')
      )
      if (indianEn) return indianEn
    } else {
      // English: Female version of the original first speaker (Microsoft Zira, Microsoft Jenny, Google US English, Samantha, Microsoft Aria)
      const femaleEnglishVoice = pool.find(
        (v) =>
          v.lang.startsWith('en') &&
          /zira|jenny|aria|samantha|female|karen|victoria|google us english/i.test(v.name)
      )
      if (femaleEnglishVoice) return femaleEnglishVoice

      const standardEnglishVoice = pool.find((v) => v.lang === 'en-US' || v.lang.startsWith('en'))
      if (standardEnglishVoice) return standardEnglishVoice
    }

    // Strict Safe Fallback: Only return an English or Hindi voice, NEVER Spanish
    return pool.find((v) => v.lang.startsWith('en') || v.lang.startsWith('hi')) || pool[0] || null
  }, [])

  // iOS Safari Audio / TTS Unlock Helper
  const unlockAudioForIOS = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.resume()
      // Create and cancel a silent utterance to unlock the Web Audio/TTS context on iOS Safari
      const utterance = new SpeechSynthesisUtterance('')
      utterance.volume = 0
      window.speechSynthesis.speak(utterance)
    } catch {}
  }, [])

  // --- Single Human-Fluent Bilingual TTS (Text to Speech) Helper ---
  const speakText = useCallback(
    (text?: string, urgency = 0.2) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return

      try {
        window.speechSynthesis.cancel()
        window.speechSynthesis.resume()

        setTimeout(() => {
          const isHindi =
            /(karo|karein|kar|hata|hatao|hatado|daal|daalo|daaldo|chahiye|hai|hain|tha|thi|the|samaan|saman|kaise|kaisi|kaun|kya|batao|bataiye|doodh|dudh|tamatar|aloo|aalu|pyaz|seb|kela|chawal|pani|paani|namak|cheeni|shakkar|tel|mirch|dhaniya|adrak|lahsun|anda|ande|jod|jodo|joddo|kam|aur|poora|saare|saara|sab|sabhi|khali|le|lo|lelo|dedo|nikal|nikalo|bache|rakho|mat|bilkul|badhiya|alvida|shukriya|dhanyawad|namaste)/i.test(
              text
            )

          const voice = getPrimaryIndianVoice(isHindi)
          const isNativeHindiVoice = Boolean(
            voice &&
              (voice.lang === 'hi-IN' ||
                voice.lang === 'hi_IN' ||
                voice.lang.startsWith('hi') ||
                /hindi|swara|madhur|kalpana|lekha|हिन्दी/i.test(voice.name))
          )

          // Format Hindi text with Devanagari so native Hindi voice pronounces it with 100% native diction
          const textToSpeak = isHindi && isNativeHindiVoice ? formatHindiForTTS(text) : text

          const utterance = new SpeechSynthesisUtterance(textToSpeak)

          if (voice) {
            utterance.voice = voice
            utterance.lang = isHindi ? (voice.lang || 'hi-IN') : (voice.lang || 'en-US')
          } else {
            utterance.lang = isHindi ? 'hi-IN' : 'en-US'
          }

          // Crisp, fast, natural human speech rate (1.15x for Hindi, 1.18x for English)
          utterance.rate = isHindi ? 1.15 : (urgency > 0.65 ? 1.25 : 1.18)
          utterance.pitch = 1.0
          utterance.volume = 1.0

          window.speechSynthesis.speak(utterance)
        }, 10)
      } catch (err) {
        console.warn('Speech synthesis error:', err)
      }
    },
    [getPrimaryIndianVoice]
  )

  // Pre-load voices on mount for prompt TTS
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
  }, [])

  // --- init & refresh from LocalStorage ---
  const refreshAll = useCallback(async () => {
    try {
      const saved = getLocalStoredItems()
      setItems(saved)
      setLoadingList(false)
      const sug = await getSuggestions(saved)
      setSuggestions(sug)
      setLoadingSuggestions(false)
    } catch (err) {
      console.warn('Refresh error:', err)
    }
  }, [])

  useEffect(() => {
    setSpeechSupported(isSpeechSupported())
    refreshAll()
  }, [refreshAll])

  // Auto-sync items state to localStorage
  useEffect(() => {
    if (!loadingList) {
      setLocalStoredItems(items)
      getSuggestions(items).then(setSuggestions)
    }
  }, [items, loadingList])

  const pushHistory = useCallback((kind: ActivityEvent['kind'], text: string) => {
    setHistory((prev) =>
      [{ id: nextId('act'), kind, text, timestamp: Date.now() }, ...prev].slice(0, 25),
    )
  }, [])

  // --- list mutations with Persistent State ---
  const addParsedItem = useCallback(
    async (parsed: ParsedItem, shouldSpeak = true) => {
      const baseName = cleanSpokenItemName(parsed.name) || parsed.name
      const cleanName = attachBrandIfPackaged(baseName)

      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => areItemsEquivalent(i.name, cleanName))
        if (existingIndex !== -1) {
          const updated = [...prev]
          const newQty = updated[existingIndex].quantity + parsed.quantity
          updated[existingIndex] = { ...updated[existingIndex], quantity: newQty }
          pushHistory('update', `Updated ${updated[existingIndex].name} to ${newQty} ${parsed.unit || 'items'}`)
          if (shouldSpeak) {
            speakText(`Added ${parsed.quantity} more ${cleanName}. Total is now ${newQty}.`)
          }
          return updated
        } else {
          const newItem: ShoppingItem = {
            id: nextId('item'),
            name: cleanName,
            quantity: parsed.quantity,
            unit: parsed.unit,
            category: parsed.category,
            completed: false,
          }
          pushHistory('add', `Added ${parsed.quantity} × ${cleanName}`)
          if (shouldSpeak) {
            speakText(`Added ${parsed.quantity} ${cleanName}`)
          }
          return [newItem, ...prev]
        }
      })

      // Background API sync
      addShoppingItem({
        name: cleanName,
        quantity: parsed.quantity,
        unit: parsed.unit,
        category: parsed.category,
      }).catch(() => {})
    },
    [pushHistory, speakText],
  )

  const addSuggestion = useCallback(
    (s: Suggestion) => {
      addParsedItem({
        name: s.itemName,
        quantity: s.quantity ?? 1,
        category: s.category,
      }, true)
      setSuggestions((prev) => prev.filter((x) => x.id !== s.id))
    },
    [addParsedItem],
  )

  const removeItem = useCallback(
    async (id: string) => {
      setItems((prev) => {
        const target = prev.find((i) => String(i.id) === String(id))
        if (target) pushHistory('remove', `Removed ${target.name}`)
        return prev.filter((i) => String(i.id) !== String(id))
      })
      removeShoppingItem(id).catch(() => {})
    },
    [pushHistory],
  )

  const clearAllItems = useCallback(
    async (isHindi = false) => {
      setItems([])
      setLocalStoredItems([])
      pushHistory('remove', isHindi ? 'Saare items hata diye' : 'Cleared all items from cart')
      const reply = isHindi
        ? 'Aapki list se saare items hata diye gaye hain.'
        : 'Cleared all items from your cart.'
      speakText(reply)
      try {
        fetch('/api/list', { method: 'DELETE' }).catch(() => {})
      } catch {}
    },
    [pushHistory, speakText],
  )

  const changeQuantity = useCallback(
    async (id: string, quantity: number) => {
      const q = Math.max(1, quantity)
      setItems((prev) => prev.map((i) => (String(i.id) === String(id) ? { ...i, quantity: q } : i)))
      updateItemQuantity(id, q).catch(() => {})
    },
    [],
  )

  const toggleComplete = useCallback(
    async (id: string) => {
      setItems((prev) =>
        prev.map((i) => {
          if (String(i.id) === String(id)) {
            const next = !i.completed
            if (next) pushHistory('complete', `Checked off ${i.name}`)
            toggleItemComplete(id, next).catch(() => {})
            return { ...i, completed: next }
          }
          return i
        }),
      )
    },
    [pushHistory],
  )

  const undo = useCallback(async () => {
    try {
      await undoLastAction()
      pushHistory('update', 'Reverted last action')
      speakText('Pichla action undo kar diya hai.')
    } catch (err) {
      console.warn('Undo error:', err)
    }
  }, [pushHistory, speakText])

  // --- search ---
  const runSearch = useCallback(
    async (term: string, filters: SearchFilters = {}) => {
      const cleanTerm = cleanSpokenItemName(term) || term
      setSearch({ term: cleanTerm, filters, results: [], loading: true, error: false, hasSearched: true })
      pushHistory('search', `Searched “${cleanTerm.trim() || 'products'}”`)
      try {
        const res = await searchProducts(cleanTerm, filters)
        setSearch({
          term: res.term,
          filters: res.filters,
          results: res.results,
          loading: false,
          error: false,
          hasSearched: true,
        })
      } catch {
        setSearch((prev) => ({ ...prev, loading: false, error: true }))
      }
    },
    [pushHistory],
  )

  // --- Clean Single-Execution Voice Flow ---
  const handleFinal = useCallback(
    async (transcript: string, activeMode: Mode) => {
      if (isProcessingRef.current) return
      isProcessingRef.current = true

      try {
        setPartialTranscript(transcript)
        setVoiceStatus('processing')
        setClarifyingQuestion(null)

        // Strict Dynamic Language Detection: Respond in the exact language the user spoke
        const isHindiSpeech = /\b(karo|karein|kar|hata|hatao|hatado|daal|daalo|daaldo|chahiye|hai|hain|tha|thi|the|samaan|saman|kaise|kaisi|kaun|kya|batao|bataiye|doodh|dudh|tamatar|aloo|aalu|pyaz|seb|kela|chawal|pani|paani|namak|cheeni|shakkar|tel|mirch|dhaniya|adrak|lahsun|anda|ande|jod|jodo|joddo|kam|aur|poora|saare|saara|sab|sabhi|khali|le|lo|lelo|dedo|nikal|nikalo|bache|rakho|mat|bilkul|badhiya|alvida|shukriya|dhanyawad|namaste|dhoondo|dikhao)\b/i.test(
          transcript
        )
        const isEnglishSpeech = /\b(add|remove|delete|clear|empty|list|cart|show|find|search|how|what|who|why|where|can|please|thank|total|bill|cost|price|undo|mark|check)\b/i.test(
          transcript
        )

        const isHindiMode = isHindiSpeech || (language === 'hi' && !isEnglishSpeech)

        // 1. General Chit-Chat & Questions ("How are you?", "Who are you?", "What can you do?", "Tell me a joke")
        const conv = checkConversationalQuery(transcript)
        if (conv.isConversational) {
          const reply = isHindiMode ? conv.replyHindi : conv.replyEnglish
          speakText(reply)
          pushHistory('language', reply)
          setLastResult({ transcript, intent: 'unknown', items: [] })
          setVoiceStatus('success')
          return
        }

        // 2. Task: Remove All Items (Hindi & English)
        if (isClearAllCommand(transcript)) {
          await clearAllItems(isHindiMode)
          setLastResult({ transcript, intent: 'remove', items: [] })
          setVoiceStatus('success')
          return
        }

        // 3. Task: Undo Command
        if (isUndoCommand(transcript)) {
          await undo()
          setLastResult({ transcript, intent: 'update', items: [] })
          setVoiceStatus('success')
          return
        }

        // 4. Task: Read List / What's in my list?
        if (isReadListCommand(transcript)) {
          if (items.length === 0) {
            const resp = isHindiMode ? 'Aapki shopping list abhi khali hai.' : 'Your shopping list is empty.'
            speakText(resp)
          } else {
            const itemSummary = items.map((i) => `${i.quantity} ${i.name}`).join(', ')
            const resp = isHindiMode
              ? `Aapki list mein ${items.length} items hain: ${itemSummary}.`
              : `You have ${items.length} items in your list: ${itemSummary}.`
            speakText(resp)
            pushHistory('language', `Read out ${items.length} items`)
          }
          setLastResult({ transcript, intent: 'unknown', items: [] })
          setVoiceStatus('success')
          return
        }

        // 5. Task: Estimated Total Bill / Cost
        if (isTotalBillCommand(transcript)) {
          if (items.length === 0) {
            speakText(isHindiMode ? 'List khali hai, isliye total zero hai.' : 'Your cart is empty.')
          } else {
            const approxTotal = items.reduce((acc, item) => acc + item.quantity * 85, 0)
            const resp = isHindiMode
              ? `Aapka estimated cart total lagbhag ₹${approxTotal} hai.`
              : `Your estimated cart total is approximately ₹${approxTotal}.`
            speakText(resp)
            pushHistory('language', `Estimated cart total: ₹${approxTotal}`)
          }
          setLastResult({ transcript, intent: 'unknown', items: [] })
          setVoiceStatus('success')
          return
        }

        // 6. Task: Recipe / Meal Ingredients Bundle (e.g. "Chai ka samaan", "Maggi ingredients")
        const matchedBundle = matchRecipeBundle(transcript)
        if (matchedBundle) {
          for (const bundleItem of matchedBundle.items) {
            await addParsedItem(bundleItem, false)
          }
          const spoken = isHindiMode ? matchedBundle.spokenHindi : matchedBundle.spokenEnglish
          speakText(spoken)
          setLastResult({ transcript, intent: 'add', items: matchedBundle.items })
          setVoiceStatus('success')
          return
        }

        // 7. Task: Check Off / Mark as Done ("Doodh le liya", "Mark milk as done")
        const checkOff = isCheckOffCommand(transcript)
        if (checkOff.isCheck && checkOff.itemName) {
          const existing = items.find((i) => areItemsEquivalent(i.name, checkOff.itemName))
          if (existing) {
            await toggleComplete(existing.id)
            const spoken = isHindiMode ? `${existing.name} tick kar diya hai.` : `Marked ${existing.name} as done.`
            speakText(spoken)
          } else {
            speakText(isHindiMode ? `${checkOff.itemName} list mein nahi mila.` : `Could not find ${checkOff.itemName} in list.`)
          }
          setLastResult({ transcript, intent: 'update', items: [] })
          setVoiceStatus('success')
          return
        }

        // 8. Search Mode
        if (activeMode === 'search') {
          const localParsed = parseVoiceCommand(transcript)
          const query = cleanSpokenItemName(localParsed.searchTerm || transcript) || transcript
          runSearch(query, localParsed.filters ?? {})
          setLastResult(localParsed)
          setVoiceStatus('success')
          speakText(isHindiMode ? `${query} ke results dikha raha hoon.` : `Showing results for ${query}.`)
          return
        }

        // 9. Instant Voice Processing (0ms Latency Engine)
        const localParsed = parseVoiceCommand(transcript)
        const detected = detectIntent(transcript)

        if (detected === 'remove') {
          const rawCandidate = localParsed.items[0]?.name || transcript.trim()
          const cleanTarget = attachBrandIfPackaged(cleanSpokenItemName(rawCandidate) || rawCandidate)
          const specifiedQty = localParsed.items[0]?.quantity || 0
          const isPartialRemoval =
            specifiedQty > 0 &&
            !/(all|saare|saara|sab|pura|complete|everything)/i.test(transcript)

          const existing = items.find((i) => areItemsEquivalent(i.name, cleanTarget))

          if (existing) {
            if (isPartialRemoval && existing.quantity > specifiedQty) {
              const newQty = existing.quantity - specifiedQty
              await changeQuantity(existing.id, newQty)
              const unitLabel = existing.unit && existing.unit !== 'item' ? ` ${existing.unit}` : ''
              const spoken = isHindiMode
                ? `${existing.name} ke ${specifiedQty}${unitLabel} kam kar diye. Ab ${newQty}${unitLabel} bache hain.`
                : `Removed ${specifiedQty}${unitLabel} of ${existing.name}. ${newQty}${unitLabel} remaining in your cart.`
              speakText(spoken)
              pushHistory('update', spoken)
            } else {
              await removeItem(existing.id)
              const spoken = isHindiMode
                ? `${existing.name} list se hata diya gaya hai.`
                : `Removed ${existing.name} from your list.`
              speakText(spoken)
              pushHistory('remove', spoken)
            }
          } else {
            speakText(isHindiMode ? `${cleanTarget} list mein nahi mila.` : `Could not find ${cleanTarget} in list.`)
          }
          setLastResult({ transcript, intent: 'remove', items: [] })
          setVoiceStatus('success')
          return
        }

        // ADD_ITEM action (Instant Execution)
        const itemsToAdd = localParsed.items.length > 0
          ? localParsed.items
          : [{ name: attachBrandIfPackaged(cleanSpokenItemName(transcript) || transcript), quantity: 1, unit: 'item', category: 'other' as Category }]

        for (const itm of itemsToAdd) {
          const cleanProdName = attachBrandIfPackaged(cleanSpokenItemName(itm.name) || itm.name)
          await addParsedItem({
            name: cleanProdName,
            quantity: Math.max(1, Math.round(itm.quantity || 1)),
            unit: itm.unit,
            category: itm.category,
          }, false) // Suppress duplicate speech
        }

        const itemDescriptions = itemsToAdd
          .map((i) => {
            const finalName = attachBrandIfPackaged(cleanSpokenItemName(i.name) || i.name)
            return `${i.quantity} ${i.unit && i.unit !== 'item' ? i.unit + ' ' : ''}${finalName}`
          })
          .join(', ')

        const replyText = isHindiMode
          ? `${itemDescriptions} aapki shopping list mein jod diya hai.`
          : `Added ${itemDescriptions} to your cart.`

        speakText(replyText)
        pushHistory('add', replyText)

        setLastResult({
          transcript,
          intent: 'add',
          items: itemsToAdd.map((i) => ({
            name: attachBrandIfPackaged(cleanSpokenItemName(i.name) || i.name),
            quantity: Math.max(1, Math.round(i.quantity || 1)),
            unit: i.unit,
            category: i.category,
          })),
        })

        setVoiceStatus('success')
        return
      } finally {
        isProcessingRef.current = false
        if (successTimer.current) clearTimeout(successTimer.current)
        successTimer.current = setTimeout(() => {
          setVoiceStatus((s) => (s === 'success' ? 'idle' : s))
        }, 2600)
      }
    },
    [
      addParsedItem,
      clearAllItems,
      items,
      language,
      lastSuggestedProduct,
      pushHistory,
      removeItem,
      runSearch,
      speakText,
      toggleComplete,
      undo,
    ],
  )

  const confirmClarification = useCallback(async () => {
    if (!lastSuggestedProduct) return
    try {
      const res = await processVoiceBackend('yes', lastSuggestedProduct)
      setClarifyingQuestion(null)
      setLastSuggestedProduct('')
      if (res.spoken_text) {
        speakText(res.spoken_text, res.urgency_score)
      }
      pushHistory('add', res.spoken_text || `Added ${lastSuggestedProduct}`)
    } catch (err) {
      console.warn('Confirm clarification error:', err)
    }
  }, [lastSuggestedProduct, pushHistory, speakText])

  const dismissClarification = useCallback(() => {
    setClarifyingQuestion(null)
    setLastSuggestedProduct('')
    setVoiceStatus('idle')
  }, [])

  const beginRecognition = useCallback(
    (forceSimulated: boolean) => {
      unlockAudioForIOS()
      const activeMode = mode
      setVoiceError(null)
      setPartialTranscript('')
      setLastResult(null)
      setClarifyingQuestion(null)
      setVoiceStatus('listening')

      const useReal = isSpeechSupported() && !forceSimulated
      const langOption = LANGUAGES.find((l) => l.code === language)
      const phrase = randomPhrase(
        activeMode === 'search' ? SEARCH_PHRASES : ASSISTANT_PHRASES,
      )

      const recognizer = useReal
        ? createSpeechRecognizer(langOption?.bcp47 ?? 'en-US')
        : createSimulatedRecognizer(phrase)
      recognizerRef.current = recognizer

      recognizer.start({
        onPartial: (text) => setPartialTranscript(text),
        onFinal: (text) => handleFinal(text, activeMode),
        onError: (err) => {
          setVoiceError(err)
          setVoiceStatus('error')
        },
      })
    },
    [handleFinal, language, mode, unlockAudioForIOS],
  )

  const startListening = useCallback(() => {
    unlockAudioForIOS()
    if (voiceStatus === 'listening') {
      recognizerRef.current?.stop()
      setVoiceStatus('idle')
      return
    }
    beginRecognition(false)
  }, [beginRecognition, unlockAudioForIOS, voiceStatus])

  const startSample = useCallback(() => {
    unlockAudioForIOS()
    beginRecognition(true)
  }, [beginRecognition, unlockAudioForIOS])

  const stopListening = useCallback(() => {
    recognizerRef.current?.stop()
    setVoiceStatus('idle')
  }, [])

  const resetVoice = useCallback(() => {
    recognizerRef.current?.stop()
    setVoiceStatus('idle')
    setVoiceError(null)
    setPartialTranscript('')
    setClarifyingQuestion(null)
    setLastSuggestedProduct('')
  }, [])

  const setLanguage = useCallback(
    (code: LanguageCode) => {
      setLanguageState(code)
      const label = LANGUAGES.find((l) => l.code === code)?.native ?? code
      pushHistory('language', `Switched language to ${label}`)
    },
    [pushHistory],
  )

  const value: VocaCartValue = {
    language,
    setLanguage,
    strings,
    mode,
    setMode,
    speechSupported,
    items,
    loadingList,
    removeItem,
    clearAllItems,
    changeQuantity,
    toggleComplete,
    addParsedItem,
    addSuggestion,
    undo,
    suggestions,
    loadingSuggestions,
    history,
    voiceStatus,
    voiceError,
    partialTranscript,
    lastResult,
    startListening,
    startSample,
    stopListening,
    resetVoice,
    clarifyingQuestion,
    confirmClarification,
    dismissClarification,
    search,
    runSearch,
  }

  return <VocaCartContext.Provider value={value}>{children}</VocaCartContext.Provider>
}

export function useVocaCart(): VocaCartValue {
  const ctx = useContext(VocaCartContext)
  if (!ctx) throw new Error('useVocaCart must be used within VocaCartProvider')
  return ctx
}
