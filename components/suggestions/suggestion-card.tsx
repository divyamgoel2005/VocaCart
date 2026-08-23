'use client'

import { motion } from 'motion/react'
import { Leaf, Plus, Repeat2, Sparkles, TriangleAlert } from 'lucide-react'

import { useVocaCart } from '@/components/providers/vocacart-provider'
import type { Suggestion, SuggestionKind } from '@/lib/api/types'
import { cn } from '@/lib/utils'

const KIND_META: Record<
  SuggestionKind,
  { icon: typeof Leaf; tint: string; ring: string; label: string }
> = {
  low: { icon: TriangleAlert, tint: 'text-amber-400', ring: 'bg-amber-500/15', label: 'Running Low' },
  substitute: { icon: Repeat2, tint: 'text-sky-400', ring: 'bg-sky-500/15', label: 'Substitute' },
  seasonal: { icon: Leaf, tint: 'text-success', ring: 'bg-success/15', label: 'In Season' },
  frequent: { icon: Sparkles, tint: 'text-voice', ring: 'bg-voice/15', label: 'Bought Together' },
}

export function SuggestionCard({ suggestion, index }: { suggestion: Suggestion; index: number }) {
  const { addSuggestion, strings } = useVocaCart()
  const meta = KIND_META[suggestion.kind] || KIND_META.frequent

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 320, damping: 30 }}
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-3.5 transition-colors hover:border-border"
    >
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', meta.ring, meta.tint)}>
        <meta.icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        {/* Product Name */}
        <p className="truncate text-sm font-semibold text-foreground">
          {suggestion.itemName}
        </p>

        {/* Brand & Price Info */}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {suggestion.brand ? `${suggestion.brand} · ` : ''}
          {suggestion.price ? `₹${suggestion.price.toFixed(2)} · ` : ''}
          <span className="capitalize">{suggestion.category}</span>
        </p>

        {/* Reason / Trigger Badge */}
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground/90">
          <span className={cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium text-[10px]', meta.ring, meta.tint)}>
            {meta.label}
          </span>
          <span className="truncate text-[11px]">{suggestion.reason || suggestion.message}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => addSuggestion(suggestion)}
        aria-label={`${strings.add} ${suggestion.itemName}`}
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-voice px-3 py-1.5 text-xs font-semibold text-voice-foreground outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Plus className="size-3.5" />
        {strings.add}
      </button>
    </motion.li>
  )
}
