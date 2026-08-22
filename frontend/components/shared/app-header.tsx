"use client"

import { motion } from "motion/react"
import { AudioLines } from "lucide-react"

import { LanguageSwitcher } from "@/components/language/language-switcher"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            className="grid size-9 place-items-center rounded-xl bg-voice text-voice-foreground"
          >
            <AudioLines className="size-5" />
          </motion.span>
          <div className="leading-none">
            <p className="font-display text-lg font-semibold tracking-tight">
              VocaCart
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Voice Shopping Command Center
            </p>
          </div>
        </div>

        <LanguageSwitcher />
      </div>
    </header>
  )
}
