'use client'

import { AnimatePresence, motion } from 'motion/react'

import { CATEGORY_META } from '@/components/shared/category-meta'
import { ShoppingItemRow } from '@/components/shopping-list/shopping-item'
import type { Category, ShoppingItem } from '@/lib/api/types'

interface CategoryGroupProps {
  category: Category
  items: ShoppingItem[]
}

export function CategoryGroup({ category, items }: CategoryGroupProps) {
  const meta = CATEGORY_META[category]
  const remaining = items.filter((i) => !i.completed).length

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="border-t border-border/70 first:border-t-0"
    >
      <header className="flex items-center gap-2.5 pb-1 pt-4">
        <span className="grid size-7 place-items-center rounded-lg bg-voice/12 text-voice">
          <meta.Icon className="size-4" />
        </span>
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {meta.label}
        </h3>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground/70">
          {remaining}/{items.length}
        </span>
      </header>
      <ul className="divide-y divide-border/50">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <ShoppingItemRow key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </ul>
    </motion.section>
  )
}
