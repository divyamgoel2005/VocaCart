"use client"

import { AnimatePresence, motion } from "motion/react"
import { Sparkles } from "lucide-react"

import { Panel } from "@/components/shared/panel"
import { useVocaCart } from "@/components/providers/vocacart-provider"
import { SuggestionCard } from "./suggestion-card"

export function SmartPicks() {
  const { strings, suggestions, loadingSuggestions } = useVocaCart()

  return (
    <Panel
      icon={<Sparkles className="size-4" />}
      title={strings.smartPicks}
      subtitle={strings.smartPicksSub}
    >
      {loadingSuggestions ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[68px] animate-pulse rounded-xl bg-muted/60"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-6 text-center text-sm text-muted-foreground"
        >
          {strings.noSuggestions}
        </motion.p>
      ) : (
        <ul className="flex flex-col gap-3">
          <AnimatePresence initial={false} mode="popLayout">
            {suggestions.map((s, i) => (
              <SuggestionCard key={s.id} suggestion={s} index={i} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Panel>
  )
}
