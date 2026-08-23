"use client"

import { AnimatePresence, motion } from "motion/react"
import { Check, Globe, Minus, PackageSearch, Plus, RefreshCw, Waves } from "lucide-react"

import { Panel } from "@/components/shared/panel"
import { useVocaCart } from "@/components/providers/vocacart-provider"
import type { ActivityKind } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const KIND_META: Record<ActivityKind, { icon: typeof Plus; tint: string }> = {
  add: { icon: Plus, tint: "text-success" },
  remove: { icon: Minus, tint: "text-destructive" },
  update: { icon: RefreshCw, tint: "text-foreground" },
  complete: { icon: Check, tint: "text-success" },
  search: { icon: PackageSearch, tint: "text-voice" },
  language: { icon: Globe, tint: "text-voice" },
}

function timeAgo(ts: number): string {
  const diff = Math.round((Date.now() - ts) / 1000)
  if (diff < 5) return "just now"
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export function ActivityTimeline() {
  const { strings, history } = useVocaCart()

  return (
    <Panel
      icon={<Waves className="size-4" />}
      title={strings.activityTitle}
      subtitle={strings.activitySub}
    >
      {history.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Your spoken actions will appear here.
        </p>
      ) : (
        <ol className="relative flex flex-col">
          <span
            aria-hidden
            className="absolute bottom-2 left-[15px] top-2 w-px bg-border"
          />
          <AnimatePresence initial={false}>
            {history.map((event) => {
              const meta = KIND_META[event.kind]
              return (
                <motion.li
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  className="relative flex items-center gap-3 py-2"
                >
                  <span
                    className={cn(
                      "z-10 grid size-8 shrink-0 place-items-center rounded-full border border-border bg-surface",
                      meta.tint,
                    )}
                  >
                    <meta.icon className="size-3.5" />
                  </span>
                  <p className="flex-1 text-pretty text-sm">{event.text}</p>
                  <time className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {timeAgo(event.timestamp)}
                  </time>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ol>
      )}
    </Panel>
  )
}
