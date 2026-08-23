"use client"

import { AnimatePresence, motion } from "motion/react"

import { AppHeader } from "@/components/shared/app-header"
import { VoiceHero } from "@/components/voice/voice-hero"
import { ShoppingList } from "@/components/shopping-list/shopping-list"
import { SmartPicks } from "@/components/suggestions/smart-picks"
import { VoiceSearch } from "@/components/search/voice-search"
import { ActivityTimeline } from "@/components/history/activity-timeline"
import { MobileVoiceBar } from "@/components/voice/mobile-voice-bar"
import { useVocaCart } from "@/components/providers/vocacart-provider"

export function CommandCenter() {
  const { mode } = useVocaCart()

  return (
    <div className="vignette min-h-dvh flex flex-col justify-between">
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl px-3 pb-32 pt-4 sm:px-6 sm:pb-24 lg:pb-16 lg:pt-8 flex-1">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-5">
          {/* Left — shopping list (order 2 on mobile) */}
          <div className="order-2 lg:order-1 lg:sticky lg:top-20">
            <ShoppingList />
          </div>

          {/* Center — voice centerpiece (order 1 on mobile) */}
          <div className="order-1 lg:order-2 lg:pt-2">
            <VoiceHero />
          </div>

          {/* Right — search / suggestions + activity (order 3 on mobile) */}
          <div className="order-3 flex flex-col gap-5 lg:order-3 lg:sticky lg:top-20">
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                >
                  {mode === "search" ? <VoiceSearch /> : <SmartPicks />}
                </motion.div>
              </AnimatePresence>
            </div>
            <ActivityTimeline />
          </div>
        </div>
      </main>

      {/* Floating Thumb Voice Action Bar for Mobile Viewports */}
      <MobileVoiceBar />
    </div>
  )
}
