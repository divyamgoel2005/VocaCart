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
  let silenceTimer: ReturnType<typeof setTimeout> | null = null

  // On iOS Safari / WebKit, prefer en-IN for Indian English & bilingual speech
  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

  const targetLang = isIOS && lang === 'en-US' ? 'en-IN' : lang

  return {
    start(callbacks) {
      if (!Impl) {
        callbacks.onError('not-supported')
        return
      }
      hasFinalized = false
      lastCapturedText = ''
      recognition = new Impl()
      recognition.lang = targetLang
      // iOS WebKit benefits from continuous mode with debounce to avoid premature cut-off mid-sentence
      recognition.continuous = Boolean(isIOS)
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      const finalizeText = (text: string) => {
        if (hasFinalized) return
        hasFinalized = true
        if (silenceTimer) clearTimeout(silenceTimer)
        callbacks.onFinal(text.trim())
        try {
          recognition?.stop()
        } catch {
          /* noop */
        }
      }

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
          callbacks.onPartial?.(combined)

          // Adaptive silence debounce on iOS to avoid cutting off mid-sentence
          if (isIOS) {
            if (silenceTimer) clearTimeout(silenceTimer)
            silenceTimer = setTimeout(() => {
              finalizeText(lastCapturedText)
            }, 1200)
          }
        }

        if (final && !isIOS && !hasFinalized) {
          finalizeText(final)
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
          finalizeText(lastCapturedText)
          return
        }

        callbacks.onError(map[event.error] ?? 'unknown')
      }

      recognition.onend = () => {
        // iOS Safari Fix: On iOS, finalize transcript on end
        if (!hasFinalized && lastCapturedText.trim()) {
          finalizeText(lastCapturedText)
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
        if (silenceTimer) clearTimeout(silenceTimer)
        if (!hasFinalized && lastCapturedText.trim()) {
          hasFinalized = true
          callbacks?.onFinal?.(lastCapturedText.trim())
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
