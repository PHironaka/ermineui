<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatTime, spokenTime } from './time'

const props = withDefaults(
  defineProps<{
    /** The file to play. Leave out and put <source> elements in the default slot to offer several formats. */
    src?: string
    kind?: 'video' | 'audio'
    /** Accessible name: what this is a recording of. Shown above the controls of an audio player. */
    title: string
    /** A picture to show before a video starts. */
    poster?: string
    /** Speeds offered on the speed button, in order. */
    speeds?: readonly number[]
    /** How much to load before play is pressed. */
    preload?: 'none' | 'metadata' | 'auto'
    /** Needed to load captions, or the file itself, from another site. */
    crossorigin?: 'anonymous' | 'use-credentials'
    loop?: boolean
  }>(),
  { kind: 'video', speeds: () => [0.5, 1, 1.25, 1.5, 2], preload: 'metadata' },
)

const emit = defineEmits<{
  play: []
  pause: []
  ended: []
  /** The file could not be played. */
  error: []
}>()

const root = ref<HTMLElement | null>(null)
const media = ref<HTMLMediaElement | null>(null)

const playing = ref(false)
const waiting = ref(false)
const failed = ref(false)
const current = ref(0)
const duration = ref(0)
const buffered = ref(0)
const volume = ref(1)
const muted = ref(false)
const speed = ref(1)
const hasCaptions = ref(false)
const captions = ref(false)
const fullscreen = ref(false)
/** Controls fade from a playing video after a few seconds without the pointer or a key. */
const idle = ref(false)
let idleTimer: ReturnType<typeof setTimeout> | undefined

const percent = computed(() => (duration.value ? (current.value / duration.value) * 100 : 0))
const canFullscreen = ref(false)

function captionTracks() {
  return Array.from(media.value?.textTracks ?? []).filter((track) => track.kind === 'captions' || track.kind === 'subtitles')
}

function readTracks() {
  const tracks = captionTracks()
  hasCaptions.value = tracks.length > 0
  captions.value = tracks.some((track) => track.mode === 'showing')
}

function toggle() {
  const el = media.value
  if (!el) return
  // play() is refused when the browser has not seen a press yet; a press on the button is one, so this only fails on a broken file.
  if (el.paused) void el.play().catch(() => undefined)
  else el.pause()
}

function seek(seconds: number) {
  const el = media.value
  if (!el || !Number.isFinite(el.duration)) return
  el.currentTime = Math.max(0, Math.min(seconds, el.duration))
  current.value = el.currentTime
}

function setVolume(next: number) {
  const el = media.value
  if (!el) return
  el.volume = Math.max(0, Math.min(next, 1))
  el.muted = el.volume === 0
}

function toggleMute() {
  const el = media.value
  if (!el) return
  el.muted = !el.muted
  // Unmuting something whose volume is at nothing would still be silent.
  if (!el.muted && el.volume === 0) el.volume = 0.5
}

function nextSpeed() {
  const el = media.value
  if (!el) return
  const index = props.speeds.indexOf(speed.value)
  el.playbackRate = props.speeds[(index + 1) % props.speeds.length] ?? 1
}

function toggleCaptions() {
  const tracks = captionTracks()
  const show = !captions.value
  // The first track is the one shown; offer a menu of your own if there are several languages.
  tracks.forEach((track, index) => (track.mode = show && index === 0 ? 'showing' : 'disabled'))
  captions.value = show
}

async function toggleFullscreen() {
  if (!root.value) return
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await root.value.requestFullscreen()
  } catch {
    // iPhones only let the video element itself go full screen, with the phone's own controls.
    ;(media.value as (HTMLMediaElement & { webkitEnterFullscreen?: () => void }) | null)?.webkitEnterFullscreen?.()
  }
}

function onFullscreenChange() {
  fullscreen.value = document.fullscreenElement === root.value
}

function wake() {
  idle.value = false
  clearTimeout(idleTimer)
  if (playing.value && props.kind === 'video') idleTimer = setTimeout(() => (idle.value = true), 2500)
}

function onProgress() {
  const el = media.value
  if (!el || !el.buffered.length) return
  buffered.value = el.duration ? (el.buffered.end(el.buffered.length - 1) / el.duration) * 100 : 0
}

/** The shortcuts people know from other players. They only apply while the player itself has focus. */
function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (event.altKey || event.ctrlKey || event.metaKey) return
  wake()
  // Sliders and buttons keep their own keys: arrows on a slider, Space and Enter on a button.
  const onControl = target.matches('input, button')
  const key = event.key.toLowerCase()
  if (key === 'k' || (key === ' ' && !onControl)) toggle()
  else if (key === 'm') toggleMute()
  else if (key === 'f' && props.kind === 'video') void toggleFullscreen()
  else if (key === 'c' && hasCaptions.value) toggleCaptions()
  else if (key === 'arrowright' && !target.matches('input')) seek(current.value + 5)
  else if (key === 'arrowleft' && !target.matches('input')) seek(current.value - 5)
  else return
  event.preventDefault()
}

onMounted(() => {
  const el = media.value
  if (!el) return
  canFullscreen.value = props.kind === 'video' && (document.fullscreenEnabled || 'webkitEnterFullscreen' in el)
  // The file's details can be in before Vue is listening for them.
  if (el.readyState >= 1) duration.value = el.duration
  volume.value = el.volume
  muted.value = el.muted
  readTracks()
  el.textTracks.addEventListener('addtrack', readTracks)
  el.textTracks.addEventListener('change', readTracks)
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onBeforeUnmount(() => {
  clearTimeout(idleTimer)
  media.value?.textTracks.removeEventListener('addtrack', readTracks)
  media.value?.textTracks.removeEventListener('change', readTracks)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})

defineExpose({ media, toggle, seek })
</script>

<template>
  <div
    ref="root"
    class="er-media-player"
    role="group"
    :aria-label="title"
    :data-kind="kind"
    :data-state="playing ? 'playing' : 'paused'"
    :data-idle="idle ? '' : undefined"
    :data-fullscreen="fullscreen ? '' : undefined"
    @keydown="onKeydown"
    @pointermove="wake"
    @focusin="wake"
  >
    <p v-if="kind === 'audio'" class="er-media-player-title">{{ title }}</p>
    <!-- The browser's own controls stay off: the ones below replace them. -->
    <component
      :is="kind"
      ref="media"
      class="er-media-player-media"
      :src="src"
      :poster="kind === 'video' ? poster : undefined"
      :preload="preload"
      :crossorigin="crossorigin"
      :loop="loop"
      playsinline
      @click="toggle"
      @play="((playing = true), wake(), emit('play'))"
      @pause="((playing = false), wake(), emit('pause'))"
      @ended="emit('ended')"
      @timeupdate="current = media?.currentTime ?? 0"
      @durationchange="duration = media?.duration ?? 0"
      @progress="onProgress"
      @waiting="waiting = true"
      @playing="waiting = false"
      @canplay="waiting = false"
      @volumechange="((volume = media?.volume ?? 1), (muted = media?.muted ?? false))"
      @ratechange="speed = media?.playbackRate ?? 1"
      @error="((failed = true), emit('error'))"
    >
      <!-- <source> elements for several formats, and <track> elements for captions. -->
      <slot />
    </component>

    <p v-if="failed" class="er-media-player-error" role="alert"><slot name="error">This recording could not be played.</slot></p>

    <div class="er-media-player-controls">
      <button type="button" class="er-media-player-button" :aria-label="playing ? 'Pause' : 'Play'" @click="toggle">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path v-if="playing" d="M7 5h3.500v14H7ZM13.500 5H17v14h-3.500Z" />
          <path v-else d="M8 5.500v13l11-6.500Z" />
        </svg>
      </button>

      <span class="er-media-player-time" aria-hidden="true">{{ formatTime(current) }}</span>
      <input
        class="er-media-player-seek"
        type="range"
        min="0"
        :max="duration || 0"
        step="any"
        :value="current"
        aria-label="Seek"
        :aria-valuetext="`${spokenTime(current)} of ${spokenTime(duration)}`"
        :style="{ '--er-media-played': `${percent}%`, '--er-media-buffered': `${buffered}%` }"
        @input="seek(Number(($event.target as HTMLInputElement).value))"
      />
      <span class="er-media-player-time" aria-hidden="true">{{ formatTime(duration) }}</span>

      <button type="button" class="er-media-player-button" :aria-label="muted || volume === 0 ? 'Unmute' : 'Mute'" @click="toggleMute">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 9.500v5h3.500L12 18.500v-13L7.500 9.500Z" />
          <path v-if="muted || volume === 0" d="M16 9.500l5 5M21 9.500l-5 5" />
          <path v-else d="M15.500 9a4 4 0 0 1 0 6M18 6.500a7.500 7.500 0 0 1 0 11" />
        </svg>
      </button>
      <input
        class="er-media-player-volume"
        type="range"
        min="0"
        max="1"
        step="0.05"
        :value="muted ? 0 : volume"
        aria-label="Volume"
        :aria-valuetext="`${Math.round((muted ? 0 : volume) * 100)}%`"
        :style="{ '--er-media-played': `${(muted ? 0 : volume) * 100}%`, '--er-media-buffered': '0%' }"
        @input="setVolume(Number(($event.target as HTMLInputElement).value))"
      />

      <button v-if="speeds.length > 1" type="button" class="er-media-player-button er-media-player-speed" :aria-label="`Playback speed, ${speed} times`" @click="nextSpeed">{{ speed }}×</button>
      <button v-if="hasCaptions" type="button" class="er-media-player-button" aria-label="Captions" :aria-pressed="captions" @click="toggleCaptions">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM10.500 10.500a2 2 0 1 0 0 3M17 10.500a2 2 0 1 0 0 3" />
        </svg>
      </button>
      <button v-if="canFullscreen" type="button" class="er-media-player-button" :aria-label="fullscreen ? 'Leave full screen' : 'Full screen'" @click="toggleFullscreen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path v-if="fullscreen" d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
          <path v-else d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style>
@layer components {
  .er-media-player {
    position: relative;
    display: grid;
    width: 100%;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
    background: var(--er-card);
    color: var(--er-card-foreground);
    overflow: hidden;
  }

  .er-media-player-title {
    margin: 0;
    padding: 0.75rem 1rem 0;
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
    line-height: 1.25rem;
  }

  .er-media-player[data-kind='video'] .er-media-player-media {
    display: block;
    width: 100%;
    max-height: 100%;
    background: #000;
    cursor: pointer;
  }

  /* An audio element with no controls of its own takes up no room, which is what is wanted. */
  .er-media-player[data-kind='audio'] .er-media-player-media {
    display: none;
  }

  .er-media-player[data-fullscreen] {
    border: 0;
    border-radius: 0;
    background: #000;
    align-content: center;
  }

  .er-media-player-error {
    margin: 0;
    padding: 0.75rem 1rem 0;
    color: var(--er-destructive);
    font-size: 0.875rem;
  }

  .er-media-player-controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.5rem;
  }

  /* Over a video the controls sit on the picture, light on dark whatever the theme, and step aside while it plays. */
  .er-media-player[data-kind='video'] .er-media-player-controls {
    position: absolute;
    inset: auto 0 0;
    background: linear-gradient(to top, oklch(0 0 0 / 75%), transparent);
    color: #fff;
    padding-top: 1.5rem;
    transition: opacity 200ms;
  }

  .er-media-player[data-kind='video'][data-idle]:not(:focus-within) .er-media-player-controls {
    opacity: 0;
  }

  .er-media-player[data-kind='video'][data-idle]:not(:focus-within) {
    cursor: none;
  }

  .er-media-player-button {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    min-width: 2.25rem;
    height: 2.25rem;
    padding: 0 0.375rem;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 0.8125rem;
    font-weight: var(--er-weight-semibold);
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    transition: background-color var(--er-duration);
  }

  .er-media-player-button:hover {
    background: color-mix(in oklab, currentColor 14%, transparent);
  }

  .er-media-player-button:focus-visible,
  .er-media-player-controls input:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 1px;
  }

  /* Switched on (captions): underlined, as well as saying so to screen readers. */
  .er-media-player-button[aria-pressed='true'] {
    box-shadow: inset 0 -2px 0 currentColor;
  }

  .er-media-player-button svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .er-media-player-time {
    flex-shrink: 0;
    min-width: 2.25rem;
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    text-align: center;
  }

  .er-media-player-controls input[type='range'] {
    appearance: none;
    flex: 1;
    min-width: 2rem;
    height: 1.25rem;
    margin: 0;
    border-radius: 999px;
    /* How much has played, how much more has loaded, and the rest. */
    background: linear-gradient(to right, currentColor var(--er-media-played), color-mix(in oklab, currentColor 45%, transparent) var(--er-media-played), color-mix(in oklab, currentColor 45%, transparent) max(var(--er-media-played), var(--er-media-buffered)), color-mix(in oklab, currentColor 22%, transparent) max(var(--er-media-played), var(--er-media-buffered))) center / 100% 0.25rem no-repeat;
    color: inherit;
    cursor: pointer;
  }

  .er-media-player-controls input[type='range']::-webkit-slider-thumb {
    appearance: none;
    width: 0.75rem;
    height: 0.75rem;
    border: 0;
    border-radius: 50%;
    background: currentColor;
  }

  .er-media-player-controls input[type='range']::-moz-range-thumb {
    width: 0.75rem;
    height: 0.75rem;
    border: 0;
    border-radius: 50%;
    background: currentColor;
  }

  .er-media-player-controls input[type='range']::-moz-range-track {
    background: transparent;
  }

  .er-media-player-controls .er-media-player-volume {
    flex: 0 1 4rem;
  }

  /* Where there is no room, the volume slider goes first: the mute button and the device's own buttons remain. */
  .er-media-player {
    container-type: inline-size;
  }

  @container (max-width: 26rem) {
    .er-media-player-volume,
    .er-media-player-speed {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .er-media-player-controls {
      transition: none;
    }
  }
}
</style>
