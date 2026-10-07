import { effectScope, reactive, watch } from 'vue'

/**
 * Interface sounds made with the Web Audio API. Nothing is downloaded: each sound is a recipe of
 * one or more short tones, played by the browser's own oscillators.
 */

interface Tone {
  /** Pitch in hertz at the start of the tone. */
  freq: number
  /** Pitch to slide to by the end. Leave out for a steady note. */
  to?: number
  /** When the tone starts, in seconds after the sound begins. */
  at?: number
  /** How long it lasts, in seconds. */
  duration: number
  /** Loudness from 0 to 1, before the overall volume is applied. */
  gain?: number
  /** Wave shape: sine is soft and round, triangle a little brighter, square is buzzy. */
  type?: OscillatorType
}

/** The sounds on offer. Edit the recipes, or add your own: every name here works with v-sound and playSound. */
const SOUNDS = {
  /** A crisp, neutral press. The default for buttons. */
  click: [{ freq: 1100, to: 700, duration: 0.045, gain: 0.5 }],
  /** Softer and lower than click, for secondary actions. */
  tap: [{ freq: 520, to: 380, duration: 0.05, gain: 0.45 }],
  /** A rising bubble, for adding or opening something. */
  pop: [{ freq: 320, to: 760, duration: 0.07, gain: 0.5 }],
  /** Barely there. For hover, or stepping through a list. */
  tick: [{ freq: 1800, duration: 0.012, gain: 0.18, type: 'triangle' }],
  /** Two rising notes: something was switched on. */
  on: [
    { freq: 520, duration: 0.06, gain: 0.4 },
    { freq: 780, at: 0.055, duration: 0.08, gain: 0.4 },
  ],
  /** Two falling notes: something was switched off. */
  off: [
    { freq: 780, duration: 0.06, gain: 0.4 },
    { freq: 520, at: 0.055, duration: 0.08, gain: 0.4 },
  ],
  /** A short rising chord: it worked. */
  success: [
    { freq: 523.25, duration: 0.09, gain: 0.35 },
    { freq: 659.25, at: 0.07, duration: 0.09, gain: 0.35 },
    { freq: 783.99, at: 0.14, duration: 0.16, gain: 0.35 },
  ],
  /** Two low, flat notes: it did not work. */
  error: [
    { freq: 220, duration: 0.11, gain: 0.4, type: 'triangle' },
    { freq: 174.61, at: 0.1, duration: 0.18, gain: 0.4, type: 'triangle' },
  ],
  /** A bright two-note chime, for something arriving. */
  notify: [
    { freq: 880, duration: 0.09, gain: 0.35 },
    { freq: 1174.66, at: 0.08, duration: 0.2, gain: 0.3 },
  ],
} satisfies Record<string, Tone[]>

export type SoundName = keyof typeof SOUNDS
export const soundNames = Object.keys(SOUNDS) as SoundName[]

const STORAGE_KEY = 'sb-sound'

/**
 * Whether sounds play, and how loud. Shared by the whole page and remembered between visits.
 * Bind a switch or slider straight to it, or use <SoundToggle />.
 */
export const soundSettings = reactive({ enabled: true, volume: 0.5 })

let ready = false
/** Reads the saved choice the first time it is needed — in the browser only, never on a server. */
function prepare() {
  if (ready || typeof window === 'undefined') return
  ready = true
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as { enabled?: unknown; volume?: unknown } | null
    if (typeof saved?.enabled === 'boolean') soundSettings.enabled = saved.enabled
    // Someone who has asked their system for less motion has not asked for surprise noises either:
    // sound starts off for them until they turn it on themselves.
    else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) soundSettings.enabled = false
    if (typeof saved?.volume === 'number') soundSettings.volume = Math.max(0, Math.min(saved.volume, 1))
  } catch {
    // Storage can be blocked (private windows, strict settings). The defaults still work.
  }
  // In a scope of its own, so it keeps saving after whichever component happened to trigger this is gone.
  effectScope(true).run(() =>
    watch(
      () => ({ ...soundSettings }),
      (value) => {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
        } catch {
          // Not being able to save the choice is not worth interrupting anyone for.
        }
      },
    ),
  )
}

let context: AudioContext | undefined

/**
 * Writes one sound into an audio graph, starting at `when`. Exported so a sound can be rendered
 * somewhere other than the speakers (an OfflineAudioContext, for tests or for exporting a file).
 */
export function scheduleSound(audio: BaseAudioContext, output: AudioNode, name: SoundName, when = audio.currentTime) {
  for (const tone of SOUNDS[name] as Tone[]) {
    const start = when + (tone.at ?? 0)
    const end = start + tone.duration
    const oscillator = audio.createOscillator()
    const envelope = audio.createGain()

    oscillator.type = tone.type ?? 'sine'
    oscillator.frequency.setValueAtTime(tone.freq, start)
    if (tone.to) oscillator.frequency.exponentialRampToValueAtTime(tone.to, end)

    // A very fast fade in and a smooth fade out. Starting or stopping a tone abruptly makes a harsh click.
    envelope.gain.setValueAtTime(0.0001, start)
    envelope.gain.exponentialRampToValueAtTime(tone.gain ?? 0.4, start + 0.004)
    envelope.gain.exponentialRampToValueAtTime(0.0001, end)

    oscillator.connect(envelope).connect(output)
    oscillator.start(start)
    oscillator.stop(end + 0.01)
  }
}

/** Plays a sound now, unless sound is switched off. Safe to call anywhere: it does nothing on a server. */
export function playSound(name: SoundName = 'click') {
  prepare()
  if (!soundSettings.enabled || soundSettings.volume <= 0 || typeof window === 'undefined') return
  const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass || !(name in SOUNDS)) return

  try {
    // Created on first use, which is always inside a click or key press: browsers refuse to start audio before one.
    context ??= new AudioContextClass()
    if (context.state === 'suspended') void context.resume()
    const volume = context.createGain()
    volume.gain.value = soundSettings.volume
    volume.connect(context.destination)
    scheduleSound(context, volume, name)
  } catch {
    // A sound that cannot play is never worth breaking the click it decorates.
  }
}

/** For use inside components: `const { play, settings } = useSound()`. */
export function useSound() {
  prepare()
  return { play: playSound, settings: soundSettings }
}
