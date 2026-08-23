"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "motion/react"
import { PackageSearch, Plus, Search, SearchX, SlidersHorizontal, X } from "lucide-react"

import { Panel } from "@/components/shared/panel"
import { useVocaCart } from "@/components/providers/vocacart-provider"
import type { SearchFilters } from "@/lib/api/types"
import { ProductCard } from "./product-card"

function filterChips(filters: SearchFilters): string[] {
  const chips: string[] = []
  if (filters.organic) chips.push("Organic")
  if (filters.brand) chips.push(filters.brand)
  if (filters.size) chips.push(filters.size)
  if (filters.maxPrice != null) {
    const symbol = filters.currency === "INR" || filters.currency === "₹" ? "₹" : filters.currency === "EUR" ? "€" : "$"
    chips.push(`Under ${symbol}${filters.maxPrice}`)
  }
  return chips
}

export function VoiceSearch() {
  const { strings, search, runSearch, addParsedItem } = useVocaCart()
  const [typedQuery, setTypedQuery] = useState(search.term || "")
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chips = filterChips(search.filters)

  // Sync typed query with external voice search triggers
  useEffect(() => {
    if (search.term && search.term !== typedQuery) {
      setTypedQuery(search.term)
    }
  }, [search.term])

  // Live typing autocomplete
  const handleInputChange = (val: string) => {
    setTypedQuery(val)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    
    if (!val.trim()) return

    debounceTimer.current = setTimeout(() => {
      runSearch(val.trim(), search.filters)
    }, 280)
  }

  const handleAddCustom = (nameToAdd?: string) => {
    const finalName = (nameToAdd || typedQuery).trim()
    if (!finalName) return

    addParsedItem({
      name: finalName,
      quantity: 1,
      category: 'other',
    })
    setTypedQuery("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (typedQuery.trim()) {
      runSearch(typedQuery.trim(), search.filters)
    }
  }

  return (
    <Panel
      icon={<PackageSearch className="size-4" />}
      title={strings.searchTitle}
      subtitle={strings.searchSub}
    >
      {/* Interactive Search & Add Textbox */}
      <form onSubmit={handleSubmit} className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={typedQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type item name (e.g. Milk, Maggi, Atta)..."
            className="w-full rounded-xl border border-border/80 bg-background/60 py-2.5 pl-9 pr-8 text-sm outline-none placeholder:text-muted-foreground/70 transition-all focus:border-voice focus:ring-2 focus:ring-voice/20"
          />
          {typedQuery && (
            <button
              type="button"
              onClick={() => {
                setTypedQuery("")
              }}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <button
          type="button"
          disabled={!typedQuery.trim()}
          onClick={() => handleAddCustom()}
          title="Add as custom item under Other"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-voice px-3.5 py-2.5 text-xs font-semibold text-voice-foreground transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          <Plus className="size-4" />
          <span>Add</span>
        </button>
      </form>

      {/* Filter chips if active */}
      {chips.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <SlidersHorizontal className="size-3 text-muted-foreground" />
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full bg-voice/12 px-2 py-0.5 text-[11px] font-medium text-voice"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Search results & options */}
      {!search.hasSearched && !typedQuery ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <PackageSearch className="size-8 text-muted-foreground/60" />
          <p className="max-w-[17rem] text-pretty text-sm text-muted-foreground">
            Type any item above or speak aloud to search catalog or add custom items to your list.
          </p>
        </div>
      ) : search.loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[76px] animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      ) : search.error ? (
        <p className="py-6 text-center text-sm text-destructive">
          Search is unavailable right now.
        </p>
      ) : search.results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <SearchX className="size-8 text-muted-foreground/70" />
          <p className="text-sm text-muted-foreground">No matching product in catalog.</p>
          {typedQuery.trim() && (
            <button
              type="button"
              onClick={() => handleAddCustom()}
              className="inline-flex items-center gap-1.5 rounded-full bg-voice px-4 py-2 text-xs font-semibold text-voice-foreground transition-transform hover:scale-105"
            >
              <Plus className="size-3.5" />
              Add &quot;{typedQuery.trim()}&quot; under Other
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col gap-3">
            <AnimatePresence initial={false} mode="popLayout">
              {search.results.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </AnimatePresence>
          </ul>

          {/* Quick add custom option at bottom */}
          {typedQuery.trim() && (
            <div className="mt-2 rounded-xl border border-dashed border-border/80 bg-surface/40 p-3.5 text-center">
              <p className="text-xs text-muted-foreground">Not the exact brand or item you wanted?</p>
              <button
                type="button"
                onClick={() => handleAddCustom()}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-voice/15 px-3.5 py-1.5 text-xs font-semibold text-voice transition-colors hover:bg-voice hover:text-voice-foreground"
              >
                <Plus className="size-3.5" />
                Add &quot;{typedQuery.trim()}&quot; as custom item under Other
              </button>
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}
