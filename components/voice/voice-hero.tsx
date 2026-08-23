'use client'

import { AnimatePresence, motion } from 'motion/react'
import { MicOff, Search, Sparkles, Volume2, WifiOff } from 'lucide-react'

import { useVocaCart } from '@/components/providers/vocacart-provider'
import { CommandTranscript } from '@/components/voice/command-transcript'
import { VoiceOrb } from '@/components/voice/voice-orb'
import { Waveform } from '@/components/voice/waveform'
import { cn } from '@/lib/utils'

export function VoiceHero() {
  const {
    strings,
    mode,
    setMode,
    voiceStatus,
    voiceError,
    startListening,
    startSample,
    speechSupported,
  } = useVocaCart()

  const statusText = () => {
    switch (voiceStatus) {
      case 'listening':
        return strings.listening
      case 'processing':
        return strings.processing
      case 'success':
        return strings.success
      case 'error':
        return strings.errorGeneric
      default:
        return strings.tapToSpeak
    }
  }

  const permissionDenied = voiceError === 'permission-denied'

  return (
    <section
      className="flex flex-col items-center gap-6 text-center"
      aria-label="Voice command area"
    >
      {/* greeting */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {strings.greeting}
        </p>
        <h1 className="text-balance font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
          {strings.prompt}
        </h1>
      </div>

      {/* mode toggle */}
      <div
        role="tablist"
        aria-label="Voice mode"
        className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1"
      >
        <ModeButton
          active={mode === 'assistant'}
          onClick={() => setMode('assistant')}
          icon={<Sparkles className="size-4" />}
        >
          {strings.assistantMode}
        </ModeButton>
        <ModeButton
          active={mode === 'search'}
          onClick={() => setMode('search')}
          icon={<Search className="size-4" />}
        >
          {strings.searchMode}
        </ModeButton>
      </div>

      {/* orb */}
      <VoiceOrb
        status={voiceStatus}
        onClick={startListening}
        label={statusText()}
        permissionDenied={permissionDenied}
      />

      {/* status + waveform */}
      <div className="flex h-12 flex-col items-center justify-center gap-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={voiceStatus}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={cn(
              'flex items-center gap-2 text-sm font-medium',
              voiceStatus === 'success' && 'text-success',
              voiceStatus === 'error' && 'text-destructive',
              (voiceStatus === 'idle' || voiceStatus === 'listening' || voiceStatus === 'processing') &&
                'text-muted-foreground',
            )}
          >
            {voiceStatus === 'listening' && <Volume2 className="size-4 text-voice" />}
            {statusText()}
          </motion.p>
        </AnimatePresence>
        {(voiceStatus === 'listening' || voiceStatus === 'processing') && (
          <Waveform status={voiceStatus} className="h-8 w-48" />
        )}
      </div>

      {/* transcript / interpretation */}
      <CommandTranscript />

      {/* hint + error states */}
      <div className="min-h-[44px]">
        <AnimatePresence mode="wait">
          {voiceStatus === 'error' ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mx-auto flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                {permissionDenied ? (
                  <MicOff className="size-4 text-destructive" />
                ) : voiceError === 'network' ? (
                  <WifiOff className="size-4 text-destructive" />
                ) : (
                  <Volume2 className="size-4 text-destructive" />
                )}
                {permissionDenied
                  ? 'Microphone access is blocked'
                  : voiceError === 'network'
                    ? 'Network hiccup reaching speech service'
                    : "I didn't catch that — try again"}
              </p>
              <p className="text-xs text-muted-foreground">
                {permissionDenied
                  ? 'Enable mic permission in your browser, or try a sample command below.'
                  : 'You can retry, or run a sample command to see how it works.'}
              </p>
              <button
                type="button"
                onClick={startSample}
                className="rounded-full bg-voice px-4 py-2 text-sm font-semibold text-voice-foreground outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Try a sample command
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <p className="max-w-md text-pretty text-sm text-muted-foreground">
                {strings.hint}
              </p>
              {!speechSupported && (
                <p className="text-xs text-muted-foreground/70">
                  Live mic isn&apos;t available here — the button runs a realistic sample.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function ModeButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
        active ? 'text-voice-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {active && (
        <motion.span
          layoutId="mode-pill"
          className="absolute inset-0 rounded-full bg-voice"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {icon}
        {children}
      </span>
    </button>
  )
}
