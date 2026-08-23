'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, Mic, MicOff, CircleAlert } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { VoiceStatus } from '@/components/providers/vocacart-provider'

interface VoiceOrbProps {
  status: VoiceStatus
  onClick: () => void
  label: string
  permissionDenied?: boolean
}

const ringColor: Record<VoiceStatus, string> = {
  idle: 'bg-voice/20',
  listening: 'bg-voice/25',
  processing: 'bg-voice/15',
  success: 'bg-success/25',
  error: 'bg-destructive/20',
}

const coreColor: Record<VoiceStatus, string> = {
  idle: 'bg-voice text-voice-foreground',
  listening: 'bg-voice text-voice-foreground',
  processing: 'bg-voice/90 text-voice-foreground',
  success: 'bg-success text-success-foreground',
  error: 'bg-destructive text-destructive-foreground',
}

export function VoiceOrb({ status, onClick, label, permissionDenied }: VoiceOrbProps) {
  const reduce = useReducedMotion()
  const listening = status === 'listening'
  const processing = status === 'processing'

  const CoreIcon = () => {
    if (status === 'success') return <Check className="size-9" strokeWidth={2.5} />
    if (status === 'error')
      return permissionDenied ? (
        <MicOff className="size-9" strokeWidth={2.2} />
      ) : (
        <CircleAlert className="size-9" strokeWidth={2.2} />
      )
    return <Mic className="size-9" strokeWidth={2.2} />
  }

  return (
    <div className="relative flex size-56 items-center justify-center sm:size-64">
      {/* pulsing rings while listening */}
      <AnimatePresence>
        {listening &&
          !reduce &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className={cn('absolute rounded-full', ringColor[status])}
              style={{ width: '100%', height: '100%' }}
              initial={{ scale: 0.7, opacity: 0.5 }}
              animate={{ scale: 1.35, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.1,
                repeat: Infinity,
                delay: i * 0.7,
                ease: 'easeOut',
              }}
            />
          ))}
      </AnimatePresence>

      {/* ambient halo */}
      <motion.span
        className={cn('absolute rounded-full blur-2xl', ringColor[status])}
        style={{ width: '78%', height: '78%' }}
        animate={
          reduce
            ? {}
            : {
                scale: listening ? [1, 1.12, 1] : [1, 1.05, 1],
                opacity: listening ? [0.6, 0.9, 0.6] : [0.4, 0.6, 0.4],
              }
        }
        transition={{ duration: listening ? 1.6 : 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* rotating arc while processing */}
      {processing && (
        <motion.span
          className="absolute rounded-full border-2 border-transparent border-t-voice border-r-voice/40"
          style={{ width: '86%', height: '86%' }}
          animate={reduce ? {} : { rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* thin static ring */}
      <span className="absolute size-[86%] rounded-full border border-border" />

      {/* core button */}
      <motion.button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={listening}
        className={cn(
          'relative z-10 flex size-32 items-center justify-center rounded-full shadow-2xl shadow-black/40 outline-none transition-colors sm:size-36',
          'focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background',
          coreColor[status],
        )}
        whileTap={{ scale: 0.94 }}
        whileHover={reduce ? {} : { scale: 1.03 }}
        animate={
          listening && !reduce
            ? { scale: [1, 1.06, 1] }
            : { scale: 1 }
        }
        transition={
          listening
            ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }
            : { type: 'spring', stiffness: 320, damping: 20 }
        }
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={status === 'success' || status === 'error' ? status : 'mic'}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <CoreIcon />
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
