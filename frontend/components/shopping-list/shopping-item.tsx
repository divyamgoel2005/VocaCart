'use client'

import { motion } from 'motion/react'
import { Check, Minus, Plus, Repeat2, Trash2 } from 'lucide-react'

import { useVocaCart } from '@/components/providers/vocacart-provider'
import type { ShoppingItem as Item } from '@/lib/api/types'
import { cn } from '@/lib/utils'

export function ShoppingItemRow({ item }: { item: Item }) {
  const { toggleComplete, changeQuantity, removeItem } = useVocaCart()

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, height: 0, marginTop: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className="group flex items-start gap-2.5 py-3 border-b border-border/30 last:border-0"
    >
      {/* complete toggle (min 32px touch target) */}
      <button
        type="button"
        onClick={() => toggleComplete(item.id)}
        aria-label={item.completed ? `Mark ${item.name} as not done` : `Check off ${item.name}`}
        aria-pressed={item.completed}
        className={cn(
          'mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90',
          item.completed
            ? 'border-success bg-success text-success-foreground'
            : 'border-muted-foreground/40 text-transparent hover:border-voice',
        )}
      >
        <Check className="size-4" strokeWidth={3} />
      </button>

      {/* name + meta (full multi-line text wrapping for mobile) */}
      <div className="min-w-0 flex-1 pr-1">
        <p
          className={cn(
            'text-[14px] font-medium leading-snug break-words transition-colors',
            item.completed && 'text-muted-foreground line-through',
          )}
        >
          {item.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {item.unit && <span className="rounded bg-surface px-1.5 py-0.5 text-[11px] font-medium">{item.unit}</span>}
          {item.substitute && (
            <span className="inline-flex items-center gap-1 rounded-full bg-voice/10 px-1.5 py-0.5 text-[11px] font-medium text-voice">
              <Repeat2 className="size-3" />
              {item.substitute}
            </span>
          )}
        </div>
      </div>

      {/* quantity stepper (touch friendly) */}
      <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-border bg-background/80 p-0.5 shadow-sm">
        <button
          type="button"
          onClick={() => changeQuantity(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
          aria-label={`Decrease ${item.name} quantity`}
          className="grid size-7 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground active:scale-90 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-5 text-center text-xs font-semibold tabular-nums">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => changeQuantity(item.id, item.quantity + 1)}
          aria-label={`Increase ${item.name} quantity`}
          className="grid size-7 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground active:scale-90 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {/* remove button (always visible on mobile touch screens, hover-reveal on desktop) */}
      <button
        type="button"
        onClick={() => removeItem(item.id)}
        aria-label={`Remove ${item.name}`}
        className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground/60 transition-all hover:bg-destructive/10 hover:text-destructive active:scale-90 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Trash2 className="size-4" />
      </button>
    </motion.li>
  )
}
