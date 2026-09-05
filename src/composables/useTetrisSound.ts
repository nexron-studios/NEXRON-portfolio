import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import type { TetrisEventName } from '@/composables/useTetrisGame'

/**
 * The game's sound, synthesised rather than loaded.
 *
 * Short oscillator envelopes through the Web Audio API: no files under
 * `public/`, no request, nothing to license. It is deliberately chiptune —
 * a handful of blips is what a Tetris in a portfolio dialog wants, and a set
 * of studio samples would be a download nobody asked for.
 *
 * The context is created on the first sound and not before. Browsers refuse
 * to start audio without a user gesture, and a context built at mount time
 * would be born suspended and stay silent for the rest of the session.
 */

/** Quiet by default: this thing opens inside somebody's portfolio. */
const DEFAULT_VOLUME = 0.3
/** Ceiling on the master gain, so 100 % on the slider is still civil. */
const MASTER_CEILING = 0.22

interface ToneProps {
  /** Hertz. A second value sweeps from the first to it. */
  from: number
  to?: number
  /** Seconds. */
  duration: number
  type?: OscillatorType
  /** Relative loudness within the master gain, 0–1. */
  gain?: number
  /** Seconds to wait before it starts — how chords are arpeggiated. */
  delay?: number
}

/**
 * One entry per game event. A clear is handled separately, because how many
 * rows went decides how much of a fanfare it gets.
 */
const TONES: Partial<Record<TetrisEventName, ToneProps[]>> = {
  move: [{ from: 320, duration: 0.035, type: 'square', gain: 0.35 }],
  rotate: [{ from: 480, to: 560, duration: 0.05, type: 'square', gain: 0.4 }],
  drop: [{ from: 260, to: 90, duration: 0.14, type: 'sawtooth', gain: 0.5 }],
  lock: [{ from: 150, to: 110, duration: 0.08, type: 'triangle', gain: 0.45 }],
  start: [
    { from: 392, duration: 0.07, type: 'square', gain: 0.4 },
    { from: 587, duration: 0.09, type: 'square', gain: 0.4, delay: 0.07 }
  ],
  gameover: [
    { from: 392, duration: 0.12, type: 'triangle', gain: 0.5 },
    { from: 311, duration: 0.12, type: 'triangle', gain: 0.5, delay: 0.11 },
    { from: 233, duration: 0.28, type: 'triangle', gain: 0.5, delay: 0.22 }
  ]
}

/** A quiet clear and a loud one — two notes against a rising four. */
const CLEAR_TONES: ToneProps[] = [
  { from: 523, duration: 0.09, type: 'square', gain: 0.45 },
  { from: 784, duration: 0.12, type: 'square', gain: 0.45, delay: 0.08 }
]

const BIG_CLEAR_TONES: ToneProps[] = [
  { from: 523, duration: 0.08, type: 'square', gain: 0.5 },
  { from: 659, duration: 0.08, type: 'square', gain: 0.5, delay: 0.07 },
  { from: 784, duration: 0.08, type: 'square', gain: 0.5, delay: 0.14 },
  { from: 1046, duration: 0.3, type: 'square', gain: 0.55, delay: 0.21 }
]

export const useTetrisSound = () => {
  const volume = useStorage('nexron.tetris.volume', DEFAULT_VOLUME)
  const isMuted = useStorage('nexron.tetris.muted', false)

  const isAudible = computed(() => !isMuted.value && volume.value > 0)

  let context: AudioContext | null = null

  /**
   * Returns null where Web Audio is unavailable or refused. Every caller
   * treats that as "no sound", never as an error — a portfolio easter egg
   * does not get to complain about a browser policy.
   */
  const ensureContext = (): AudioContext | null => {
    if (context) {
      // Autoplay policy can suspend it again when the tab is backgrounded.
      if (context.state === 'suspended') void context.resume()
      return context
    }

    const Constructor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (!Constructor) return null

    try {
      context = new Constructor()
    } catch (error) {
      console.warn('tetris.audio_unavailable', { error })
      return null
    }

    return context
  }

  const playTone = (tone: ToneProps): void => {
    const audio = ensureContext()
    if (!audio) return

    const startAt = audio.currentTime + (tone.delay ?? 0)
    const endAt = startAt + tone.duration
    const peak = MASTER_CEILING * volume.value * (tone.gain ?? 1)

    const oscillator = audio.createOscillator()
    const envelope = audio.createGain()

    oscillator.type = tone.type ?? 'square'
    oscillator.frequency.setValueAtTime(tone.from, startAt)
    if (tone.to !== undefined) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, tone.to), endAt)
    }

    // A gain that jumps to its peak clicks; a few milliseconds of attack and a
    // ramp down to near-zero is the whole difference between a note and a pop.
    envelope.gain.setValueAtTime(0.0001, startAt)
    envelope.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), startAt + 0.008)
    envelope.gain.exponentialRampToValueAtTime(0.0001, endAt)

    oscillator.connect(envelope)
    envelope.connect(audio.destination)

    oscillator.start(startAt)
    oscillator.stop(endAt + 0.02)
    // Chrome keeps the node graph alive until the source ends; disconnecting
    // afterwards is what stops a long game accumulating thousands of them.
    oscillator.onended = () => {
      oscillator.disconnect()
      envelope.disconnect()
    }
  }

  const playEvent = (type: TetrisEventName, clearedRows = 0): void => {
    if (!isAudible.value) return

    if (type === 'clear') {
      const tones = clearedRows >= 3 ? BIG_CLEAR_TONES : CLEAR_TONES
      tones.forEach(playTone)
      return
    }

    TONES[type]?.forEach(playTone)
  }

  const toggleMuted = (): void => {
    isMuted.value = !isMuted.value
  }

  const dispose = (): void => {
    void context?.close()
    context = null
  }

  return { volume, isMuted, isAudible, playEvent, toggleMuted, dispose }
}
