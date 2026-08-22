'use client'

import { motion, useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils'
import type { VoiceStatus } from '@/components/providers/vocacart-provider'

const BAR_COUNT = 28

interface WaveformProps {
  status: VoiceStatus
  className?: string
}

// A row of bars that "breathe" while listening and settle otherwise.
export function Waveform({ status, className }: WaveformProps) {
  const reduce = useReducedMotion()
  const listening = status === 'listening'
  const processing = status === 'processing'

  return (
    <div
      className={cn('flex items-center justify-center gap-[3px]', className)}
      aria-hidden="true"
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const distance = Math.abs(i - (BAR_COUNT - 1) / 2)
        const falloff = 1 - distance / (BAR_COUNT / 1.6)
        const peak = Math.max(0.15, falloff)

        let animate: { height: string[] | string } = { height: '10%' }
        let duration = 0.6
        if (listening && !reduce) {
          animate = {
            height: [
              `${12 + peak * 12}%`,
              `${30 + peak * 70}%`,
              `${18 + peak * 30}%`,
              `${45 + peak * 55}%`,
              `${12 + peak * 12}%`,
            ],
          }
          duration = 0.9 + (distance % 3) * 0.18
        } else if (processing && !reduce) {
          animate = { height: [`${20 + peak * 20}%`, `${40 + peak * 20}%`, `${20 + peak * 20}%`] }
          duration = 1.1
        } else {
          animate = { height: `${10 + peak * 8}%` }
        }

        return (
          <motion.span
            key={i}
            className={cn(
              'w-[3px] rounded-full',
              status === 'error' ? 'bg-destructive/70' : 'bg-voice',
            )}
            initial={{ height: '10%' }}
            animate={animate}
            transition={{
              duration,
              repeat: listening || processing ? Infinity : 0,
              ease: 'easeInOut',
              delay: (distance % 4) * 0.05,
            }}
            style={{ opacity: 0.55 + peak * 0.45 }}
          />
        )
      })}
    </div>
  )
}
