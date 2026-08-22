'use client'

import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, HelpCircle, Search, Check, X, Mic } from 'lucide-react'

import { CATEGORY_META } from '@/components/shared/category-meta'
import { useVocaCart } from '@/components/providers/vocacart-provider'
import { cn } from '@/lib/utils'

export function CommandTranscript() {
  const {
    voiceStatus,
    partialTranscript,
    lastResult,
    strings,
    clarifyingQuestion,
    confirmClarification,
    dismissClarification,
    startListening,
  } = useVocaCart()

  const showLive =
    (voiceStatus === 'listening' || voiceStatus === 'processing') &&
    partialTranscript.length > 0

  const showResult =
    voiceStatus === 'success' && lastResult && lastResult.transcript.length > 0

  return (
    <div className="min-h-[92px] w-full max-w-xl">
      <AnimatePresence mode="wait">
        {clarifyingQuestion && (
          <motion.div
            key="clarification"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-voice/40 bg-voice/10 px-5 py-4 text-center shadow-lg"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-voice">
              <HelpCircle className="size-4" />
              <span>Catalog Match &amp; Clarification</span>
            </div>
            <p className="text-pretty text-base font-medium text-foreground">
              {clarifyingQuestion}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={confirmClarification}
                className="inline-flex items-center gap-1.5 rounded-full bg-voice px-4 py-1.5 text-xs font-semibold text-voice-foreground transition-transform hover:scale-105"
              >
                <Check className="size-3.5" />
                Yes, add it
              </button>
              <button
                type="button"
                onClick={startListening}
                className="inline-flex items-center gap-1.5 rounded-full border border-voice/40 bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-voice hover:text-voice"
              >
                <Mic className="size-3.5 text-voice" />
                Say &quot;Yes&quot;
              </button>
              <button
                type="button"
                onClick={dismissClarification}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="size-3" />
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {showLive && !clarifyingQuestion && (
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-center"
          >
            <p className="text-pretty text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
              “{partialTranscript}
              <motion.span
                className="ml-0.5 inline-block h-5 w-[2px] translate-y-0.5 bg-voice align-middle"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              />
              ”
            </p>
          </motion.div>
        )}

        {showResult && lastResult && !clarifyingQuestion && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-pretty text-center text-lg font-medium text-muted-foreground sm:text-xl">
              “{lastResult.transcript}”
            </p>

            {lastResult.intent === 'search' ? (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-voice/15 px-3 py-1 text-sm font-medium text-voice">
                  <Search className="size-3.5" />
                  {lastResult.searchTerm || 'products'}
                </span>
                {lastResult.filters?.maxPrice && (
                  <FilterChip>
                    {'under '}
                    {lastResult.filters.currency ?? '₹'}
                    {lastResult.filters.maxPrice}
                  </FilterChip>
                )}
                {lastResult.filters?.organic && <FilterChip>organic</FilterChip>}
                {lastResult.filters?.brand && (
                  <FilterChip>{lastResult.filters.brand}</FilterChip>
                )}
                {lastResult.filters?.size && <FilterChip>{lastResult.filters.size}</FilterChip>}
              </div>
            ) : (
              lastResult.items.length > 0 && (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {strings.interpreted}
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {lastResult.items.map((item, i) => {
                      const meta = CATEGORY_META[item.category] || CATEGORY_META.other
                      return (
                        <motion.span
                          key={`${item.name}-${i}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + i * 0.08 }}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium"
                        >
                          <span className="grid size-5 place-items-center rounded-full bg-voice/15 text-voice">
                            <meta.Icon className="size-3" />
                          </span>
                          <span className="tabular-nums text-voice">{item.quantity}×</span>
                          {item.name}
                        </motion.span>
                      )
                    })}
                  </div>
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground',
      )}
    >
      <ArrowRight className="size-3 text-voice" />
      {children}
    </span>
  )
}
