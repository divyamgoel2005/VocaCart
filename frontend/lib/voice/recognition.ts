// Thin wrapper around the browser SpeechRecognition API with a graceful
// simulated fallback. The rest of the app only depends on the `Recognizer`
// interface, so a real backend / streaming STT can be substituted later.

export type RecognizerError =
  | 'not-supported'
  | 'permission-denied'
  | 'no-speech'
  | 'network'
  | 'unknown'

export interface RecognizerCallbacks {
  onPartial?: (text: string) => void
  onFinal: (text: string) => void
  onError: (error: RecognizerError) => void
  onEnd?: () => void
}

export interface Recognizer {
  start: (callbacks: RecognizerCallbacks) => void
  stop: () => void
}

function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null
}

export function isSpeechSupported(): boolean {
  return getSpeechRecognition() !== null
}

export function createSpeechRecognizer(lang = 'en-US'): Recognizer {
  const Impl = getSpeechRecognition()
  let recognition: any = null
  let hasFinalized = false
  let lastCapturedText = ''

  return {
    start(callbacks) {
      if (!Impl) {
        callbacks.onError('not-supported')
        return
      }
      hasFinalized = false
      lastCapturedText = ''
      recognition = new Impl()
      recognition.lang = lang
      recognition.continuous = false
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      recognition.onresult = (event: any) => {
        let interim = ''
        let final = ''
        for (let i = 0; i < event.results.length; i++) {
          const chunk = event.results[i]
          if (chunk.isFinal) final += chunk[0].transcript + ' '
          else interim += chunk[0].transcript + ' '
        }

        const combined = (final + interim).trim()
        if (combined) {
          lastCapturedText = combined
        }

        if (interim && !hasFinalized) {
          callbacks.onPartial?.(interim.trim())
        }
        if (final && !hasFinalized) {
          hasFinalized = true
          callbacks.onFinal(final.trim())
          try {
            recognition?.stop()
          } catch {
            /* noop */
          }
        }
      }

      recognition.onerror = (event: any) => {
        const map: Record<string, RecognizerError> = {
          'not-allowed': 'permission-denied',
          'service-not-allowed': 'permission-denied',
          'no-speech': 'no-speech',
          network: 'network',
        }

        // On iOS Safari, if recognition fires no-speech but we captured interim words, finalize it!
        if (event.error === 'no-speech' && lastCapturedText.trim() && !hasFinalized) {
          hasFinalized = true
          callbacks.onFinal(lastCapturedText.trim())
          return
        }

        callbacks.onError(map[event.error] ?? 'unknown')
      }

      recognition.onend = () => {
        // iOS Safari Fix: On iOS, isFinal is frequently never set to true before onend fires.
        // If recognition ended and we have captured transcript that was not finalized, finalize it now!
        if (!hasFinalized && lastCapturedText.trim()) {
          hasFinalized = true
          callbacks.onFinal(lastCapturedText.trim())
        }
        callbacks.onEnd?.()
      }

      try {
        recognition.start()
      } catch {
        callbacks.onError('unknown')
      }
    },
    stop() {
      try {
        if (!hasFinalized && lastCapturedText.trim()) {
          hasFinalized = true
          callbacks.onFinal(lastCapturedText.trim())
        }
        recognition?.stop()
      } catch {
        /* noop */
      }
    },
  }
}

/**
 * Demo-friendly recognizer that "hears" a provided phrase by streaming it
 * word-by-word. Used when the browser API is unavailable (e.g. inside a
 * sandboxed preview) so the experience is always demonstrable.
 */
export function createSimulatedRecognizer(phrase: string): Recognizer {
  let timers: ReturnType<typeof setTimeout>[] = []

  return {
    start(callbacks) {
      const words = phrase.split(' ')
      let assembled = ''

      words.forEach((word, idx) => {
        const delay = 140 * (idx + 1)
        const t = setTimeout(() => {
          assembled = assembled ? `${assembled} ${word}` : word
          if (idx < words.length - 1) {
            callbacks.onPartial?.(assembled)
          } else {
            callbacks.onFinal(assembled)
            callbacks.onEnd?.()
          }
        }, delay)
        timers.push(t)
      })
    },
    stop() {
      timers.forEach(clearTimeout)
      timers = []
    },
  }
}
