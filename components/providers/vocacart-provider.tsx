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
import { areItemsEquivalent } from '@/lib/voice/bilingual-mapping'
import { matchRecipeBundle } from '@/lib/voice/recipes'
import { checkConversationalQuery } from '@/lib/voice/conversational-responses'
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
  addParsedItem: (item: ParsedItem) => void
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

  // --- TTS (Text to Speech) Helper ---
  const speakText = useCallback((text?: string, urgency = 0.2) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return
    try {
      window.speechSynthesis.cancel()
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = urgency > 0.65 ? 1.15 : 1.0
        utterance.pitch = 1.0
        window.speechSynthesis.speak(utterance)
      }, 60)
    } catch (err) {
      console.warn('Speech synthesis error:', err)
    }
  }, [])

  // Pre-load voices on mount for prompt TTS
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
    }
  }, [])

  // --- init & refresh ---
  const refreshAll = useCallback(async () => {
    try {
      const list = await getShoppingList()
      setItems(list)
      setLoadingList(false)
      const sug = await getSuggestions(list)
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

  const pushHistory = useCallback((kind: ActivityEvent['kind'], text: string) => {
    setHistory((prev) =>
      [{ id: nextId('act'), kind, text, timestamp: Date.now() }, ...prev].slice(0, 25),
    )
  }, [])

  const refreshSuggestions = useCallback((current: ShoppingItem[]) => {
    getSuggestions(current).then(setSuggestions)
  }, [])

  // --- list mutations with Deduplication ---
  const addParsedItem = useCallback(
    async (parsed: ParsedItem) => {
      const cleanName = cleanSpokenItemName(parsed.name) || parsed.name
      const existing = items.find((i) => areItemsEquivalent(i.name, cleanName))

      if (existing) {
        const newQty = existing.quantity + parsed.quantity
        setItems((prev) =>
          prev.map((i) => (i.id === existing.id ? { ...i, quantity: newQty } : i)),
        )
        pushHistory('update', `Updated ${existing.name} to ${newQty} ${parsed.unit || existing.unit || 'items'}`)
        speakText(`Added ${parsed.quantity} more ${cleanName}. Total is now ${newQty}.`)

        try {
          await updateItemQuantity(existing.id, newQty)
          const updatedList = await getShoppingList()
          setItems(updatedList)
          refreshSuggestions(updatedList)
        } catch (err) {
          console.warn('Update quantity error:', err)
        }
      } else {
        const optimistic: ShoppingItem = {
          id: nextId('item'),
          name: cleanName,
          quantity: parsed.quantity,
          unit: parsed.unit,
          category: parsed.category,
          completed: false,
        }
        setItems((prev) => [optimistic, ...prev])
        pushHistory('add', `Added ${parsed.quantity} × ${cleanName}`)
        speakText(`Added ${parsed.quantity} ${cleanName}`)

        try {
          await addShoppingItem(optimistic)
          const updatedList = await getShoppingList()
          setItems(updatedList)
          refreshSuggestions(updatedList)
        } catch (err) {
          console.warn('Add item error:', err)
        }
      }
    },
    [items, pushHistory, refreshSuggestions, speakText],
  )

  const addSuggestion = useCallback(
    (s: Suggestion) => {
      addParsedItem({
        name: s.itemName,
        quantity: s.quantity ?? 1,
        category: s.category,
      })
      setSuggestions((prev) => prev.filter((x) => x.id !== s.id))
    },
    [addParsedItem],
  )

  const removeItem = useCallback(
    async (id: string) => {
      const target = items.find((i) => i.id === id)
      if (target) pushHistory('remove', `Removed ${target.name}`)
      setItems((prev) => prev.filter((i) => i.id !== id))
      try {
        await removeShoppingItem(id)
        const updatedList = await getShoppingList()
        setItems(updatedList)
        refreshSuggestions(updatedList)
      } catch (err) {
        console.warn('Remove item error:', err)
      }
    },
    [items, pushHistory, refreshSuggestions],
  )

  const clearAllItems = useCallback(async () => {
    const currentItems = [...items]
    if (currentItems.length === 0) {
      speakText('Aapki shopping list pehle se hi khali hai.')
      return
    }

    setItems([])
    pushHistory('remove', 'Removed all items from list')
    speakText('Aapki list se saare items hata diye gaye hain.')

    try {
      await Promise.allSettled(currentItems.map((item) => removeShoppingItem(item.id)))
      const updatedList = await getShoppingList()
      setItems(updatedList)
      refreshSuggestions(updatedList)
    } catch (err) {
      console.warn('Clear all items error:', err)
    }
  }, [items, pushHistory, refreshSuggestions, speakText])

  const changeQuantity = useCallback(
    async (id: string, quantity: number) => {
      const q = Math.max(1, quantity)
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: q } : i)))
      try {
        await updateItemQuantity(id, q)
      } catch (err) {
        console.warn('Change quantity error:', err)
      }
    },
    [],
  )

  const toggleComplete = useCallback(
    async (id: string) => {
      const target = items.find((i) => i.id === id)
      const next = !target?.completed
      if (target && next) pushHistory('complete', `Checked off ${target.name}`)
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed: next } : i)))
      try {
        await toggleItemComplete(id, next)
      } catch (err) {
        console.warn('Toggle complete error:', err)
      }
    },
    [items, pushHistory],
  )

  const undo = useCallback(async () => {
    try {
      await undoLastAction()
      await refreshAll()
      pushHistory('update', 'Reverted last action')
      speakText('Pichla action undo kar diya hai.')
    } catch (err) {
      console.warn('Undo error:', err)
    }
  }, [pushHistory, refreshAll, speakText])

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

        const isHindiMode =
          language === 'hi' ||
          language === 'hinglish' ||
          /(karo|karein|hata|hatao|daal|daalo|chahiye|hai|hain|samaan|kaise|kaun|kya|batao)/i.test(transcript)

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
          await clearAllItems()
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
            await addParsedItem(bundleItem)
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
            speakText(`Could not find ${checkOff.itemName} in list`)
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
          speakText(`Showing results for ${query}`)
          return
        }

        // 9. General Voice Adding & Removing
        const localParsed = parseVoiceCommand(transcript)
        const detected = detectIntent(transcript)

        // Multiple items in single utterance
        if (localParsed.items.length > 1 && detected === 'add') {
          for (const parsedItem of localParsed.items) {
            await addParsedItem(parsedItem)
          }
          const itemNames = localParsed.items
            .map((x) => `${x.quantity > 1 ? x.quantity + ' ' : ''}${x.name}`)
            .join(', ')
          const spoken = isHindiMode
            ? `${itemNames} aapki list mein jod diye gaye hain.`
            : `Added ${itemNames} to your list.`
          speakText(spoken)
          setLastResult(localParsed)
          setVoiceStatus('success')
          return
        }

        // Backend Voice Processing
        try {
          const backendRes = await processVoiceBackend(transcript, lastSuggestedProduct)

          if (backendRes.success && !backendRes.needs_clarification) {
            const act = backendRes.action || 'ADD_ITEM'
            const cleanProdName = backendRes.item
              ? cleanSpokenItemName(backendRes.item.product_name) || backendRes.item.product_name
              : ''

            if (backendRes.spoken_text) {
              speakText(backendRes.spoken_text, backendRes.urgency_score)
            }
            pushHistory(act.includes('REMOVE') ? 'remove' : 'add', backendRes.spoken_text || `Processed ${act}`)

            if (backendRes.item) {
              setLastResult({
                transcript,
                intent: act.includes('REMOVE') ? 'remove' : 'add',
                items: [
                  {
                    name: cleanProdName,
                    quantity: Math.max(1, Math.round(backendRes.item.quantity || 1)),
                    unit: backendRes.item.unit,
                    category: mapToCategory(backendRes.item.category),
                  },
                ],
              })
            } else {
              setLastResult(localParsed)
            }

            const updatedList = await getShoppingList()
            setItems(updatedList)
            refreshSuggestions(updatedList)
            setVoiceStatus('success')
          } else {
            // Local fallback if backend confidence was low or custom item
            const rawCandidate =
              backendRes.suggested_product ||
              backendRes.raw_item_name ||
              localParsed.items[0]?.name ||
              transcript.trim()
            const itemNameToUse = cleanSpokenItemName(rawCandidate) || rawCandidate

            if (detected === 'remove') {
              const existing = items.find(i => areItemsEquivalent(i.name, itemNameToUse))
              if (existing) {
                await removeShoppingItem(existing.id)
                const spoken = isHindiMode ? `${existing.name} hata diya gaya hai.` : `Removed ${existing.name}.`
                speakText(spoken)
                pushHistory('remove', spoken)
              } else {
                speakText(`Could not find ${itemNameToUse} in list`)
              }
            } else {
              const qty = localParsed.items[0]?.quantity || 1
              const unit = localParsed.items[0]?.unit || 'item'
              const cat = mapToCategory(localParsed.items[0]?.category || 'other')

              const existing = items.find(i => areItemsEquivalent(i.name, itemNameToUse))

              if (existing) {
                const newQty = existing.quantity + qty
                await updateItemQuantity(existing.id, newQty)
                const spoken = isHindiMode
                  ? `${itemNameToUse} ke ${qty} aur jod diye. Ab total ${newQty} hain.`
                  : `Added ${qty} more ${itemNameToUse}. Total is now ${newQty}.`
                speakText(spoken)
                pushHistory('update', spoken)

                setLastResult({
                  transcript,
                  intent: 'update',
                  items: [{ name: existing.name, quantity: newQty, unit: existing.unit, category: existing.category }],
                })
              } else {
                await addShoppingItem({
                  name: itemNameToUse,
                  quantity: qty,
                  unit: unit,
                  category: cat,
                })

                const spoken = isHindiMode
                  ? `${qty > 1 ? qty + ' ' : ''}${itemNameToUse} list mein jod diya hai.`
                  : `Added ${qty > 1 ? qty + ' ' : ''}${itemNameToUse} to your list.`
                speakText(spoken)
                pushHistory('add', spoken)

                setLastResult({
                  transcript,
                  intent: 'add',
                  items: [{ name: itemNameToUse, quantity: qty, unit, category: cat }],
                })
              }
            }

            const updatedList = await getShoppingList()
            setItems(updatedList)
            refreshSuggestions(updatedList)
            setVoiceStatus('success')
          }
        } catch (backendErr) {
          console.warn('Backend voice processing fallback:', backendErr)

          if (detected === 'remove') {
            const targetName = cleanSpokenItemName(localParsed.items[0]?.name || transcript.trim())
            const existing = items.find(i => areItemsEquivalent(i.name, targetName))
            if (existing) {
              await removeShoppingItem(existing.id)
              const spoken = isHindiMode ? `${existing.name} hata diya gaya hai.` : `Removed ${existing.name}.`
              speakText(spoken)
              pushHistory('remove', `Removed ${existing.name}`)
            }
          } else if (localParsed.items.length > 0) {
            for (const item of localParsed.items) {
              await addParsedItem(item)
            }
          } else if (transcript.trim()) {
            const cleanItem = cleanSpokenItemName(transcript.trim()) || transcript.trim()
            await addParsedItem({
              name: cleanItem,
              quantity: 1,
              category: 'other',
            })
          }
          setLastResult(localParsed)
          setVoiceStatus('success')
        }
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
      refreshSuggestions,
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
      const updatedList = await getShoppingList()
      setItems(updatedList)
      refreshSuggestions(updatedList)
      pushHistory('add', res.spoken_text || `Added ${lastSuggestedProduct}`)
    } catch (err) {
      console.warn('Confirm clarification error:', err)
    }
  }, [lastSuggestedProduct, pushHistory, refreshSuggestions, speakText])

  const dismissClarification = useCallback(() => {
    setClarifyingQuestion(null)
    setLastSuggestedProduct('')
    setVoiceStatus('idle')
  }, [])

  const beginRecognition = useCallback(
    (forceSimulated: boolean) => {
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
    [handleFinal, language, mode],
  )

  const startListening = useCallback(() => {
    if (voiceStatus === 'listening') {
      recognizerRef.current?.stop()
      setVoiceStatus('idle')
      return
    }
    beginRecognition(false)
  }, [beginRecognition, voiceStatus])

  const startSample = useCallback(() => {
    beginRecognition(true)
  }, [beginRecognition])

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
