'use client'

import { motion } from 'motion/react'
import { ShoppingBasket, Undo2 } from 'lucide-react'

import { useVocaCart } from '@/components/providers/vocacart-provider'
import { CategoryGroup } from '@/components/shopping-list/category-group'
import { Panel } from '@/components/shared/panel'
import { CATEGORY_ORDER } from '@/lib/api/types'

export function ShoppingList() {
  const { items, loadingList, strings, undo } = useVocaCart()

  const total = items.length
  const done = items.filter((i) => i.completed).length

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((i) => i.category === category),
  })).filter((g) => g.items.length > 0)

  return (
    <Panel
      title={strings.cartTitle}
      subtitle={total > 0 ? `${done}/${total} ${strings.items} checked` : undefined}
      icon={<ShoppingBasket className="size-4.5" />}
      action={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={undo}
            title="Undo last action"
            className="flex items-center gap-1 rounded-full border border-border/80 bg-background/50 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-voice hover:text-voice"
          >
            <Undo2 className="size-3.5" />
            <span>Undo</span>
          </button>
          {total > 0 && (
            <div className="flex flex-col items-end">
              <span className="font-display text-2xl font-semibold leading-none tabular-nums">
                {total}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {strings.items}
              </span>
            </div>
          )}
        </div>
      }
    >
      {loadingList ? (
        <ListSkeleton />
      ) : total === 0 ? (
        <EmptyState title={strings.cartEmpty} hint={strings.cartEmptyHint} />
      ) : (
        <div>
          {grouped.map((group) => (
            <CategoryGroup key={group.category} category={group.category} items={group.items} />
          ))}
        </div>
      )}
    </Panel>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3 pt-2" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="size-6 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-1/4 animate-pulse rounded bg-muted/70" />
          </div>
          <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 py-10 text-center"
    >
      <span className="grid size-14 place-items-center rounded-2xl border border-dashed border-border text-muted-foreground">
        <ShoppingBasket className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="mx-auto max-w-[15rem] text-pretty text-sm text-muted-foreground">{hint}</p>
      </div>
    </motion.div>
  )
}
