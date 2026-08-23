'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Mic, MicOff, Sparkles, Volume2 } from 'lucide-react'

import { useVocaCart } from '@/components/providers/vocacart-provider'
import { cn } from '@/lib/utils'

export function MobileVoiceBar() {
  const {
    voiceStatus,
    voiceError,
    startListening,
    startSample,
    speechSupported,
    strings,
    partialTranscript,
  } = useVocaCart()

  const isListening = voiceStatus === 'listening'
  const isProcessing = voiceStatus === 'processing'
  const isError = voiceStatus === 'error'
  const isSuccess = voiceStatus === 'success'

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden pointer-events-none">
      <div className="mx-auto max-w-sm flex items-center justify-between gap-2 rounded-2xl border border-border/80 bg-surface/95 p-2 shadow-2xl backdrop-blur-xl pointer-events-auto transition-all">
        {/* Info & Transcript snippet */}
        <div className="flex-1 min-w-0 px-2">
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1.5"
              >
                <span className="size-2 rounded-full bg-voice animate-ping" />
                <p className="text-xs font-semibold text-voice truncate">
                  {partialTranscript || strings.listening}
                </p>
              </motion.div>
            ) : isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1.5"
              >
                <Volume2 className="size-3.5 text-voice animate-pulse" />
                <p className="text-xs font-semibold text-muted-foreground truncate">
                  {strings.processing}
                </p>
              </motion.div>
            ) : isSuccess ? (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs font-semibold text-success truncate"
              >
                ✓ {strings.success}
              </motion.p>
            ) : isError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1"
              >
                <MicOff className="size-3 text-destructive" />
                <p className="text-xs font-medium text-destructive truncate">
                  {voiceError === 'permission-denied' ? 'Mic Blocked' : 'Try Again'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <Sparkles className="size-3.5 text-voice" />
                <p className="text-xs font-medium text-muted-foreground truncate">
                  Tap mic to speak
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Button */}
        {isError && voiceError === 'permission-denied' ? (
          <button
            type="button"
            onClick={startSample}
            className="flex items-center gap-1.5 rounded-xl bg-voice px-3 py-2 text-xs font-bold text-voice-foreground active:scale-95 transition-transform"
          >
            Try Sample
          </button>
        ) : (
          <button
            type="button"
            onClick={startListening}
            aria-label={isListening ? 'Stop listening' : 'Start speaking'}
            className={cn(
              'relative grid size-12 shrink-0 place-items-center rounded-xl font-bold transition-all active:scale-90 shadow-lg',
              isListening
                ? 'bg-destructive text-destructive-foreground ring-4 ring-destructive/30 animate-pulse'
                : 'bg-voice text-voice-foreground ring-2 ring-voice/40 hover:brightness-110',
            )}
          >
            {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </button>
        )}
      </div>
    </div>
  )
}
