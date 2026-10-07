<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from 'vue'
import { useFloating, type Align, type Side } from '../../lib/floating'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { hexToHsv, hsvToHex, normalizeHex, type Hsv } from './color'

// Attributes such as id and aria-invalid go to the button, so <Label for="..."> works.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Colours offered as one-press choices, as hex codes. */
    presets?: readonly string[]
    /** Submit the value with a form under this name. */
    name?: string
    disabled?: boolean
    /** Accessible name of the button. */
    label?: string
    side?: Side
    align?: Align
    sideOffset?: number
  }>(),
  { presets: () => [], label: 'Colour', side: 'bottom', align: 'start', sideOffset: 4 },
)

/** The colour as '#rrggbb'. */
const value = defineModel<string>({ default: '#2a78d6' })
const open = defineModel<boolean>('open', { default: false })

const anchor = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)
const area = ref<HTMLElement | null>(null)
const contentId = useId()

// Kept alongside the hex value: black, white and greys have no hue of their own, and without this
// the hue slider would snap back to red every time the colour passed through one of them.
const hsv = ref<Hsv>(hexToHsv(value.value))
const text = ref(value.value)

watch(value, (next) => {
  if (normalizeHex(next) !== hsvToHex(hsv.value)) hsv.value = hexToHsv(next)
  text.value = normalizeHex(next) ?? next
})

function set(next: Partial<Hsv>) {
  hsv.value = { ...hsv.value, ...next }
  value.value = hsvToHex(hsv.value)
}

const clamp = (number: number) => Math.max(0, Math.min(number, 1))
const hueColor = computed(() => hsvToHex({ h: hsv.value.h, s: 1, v: 1 }))

let dragging = false
function pick(event: PointerEvent) {
  const box = area.value?.getBoundingClientRect()
  if (!box) return
  set({ s: clamp((event.clientX - box.left) / box.width), v: clamp(1 - (event.clientY - box.top) / box.height) })
}

function onAreaDown(event: PointerEvent) {
  dragging = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  pick(event)
}

function onAreaKeydown(event: KeyboardEvent) {
  const step = event.shiftKey ? 0.1 : 0.01
  if (event.key === 'ArrowLeft') set({ s: clamp(hsv.value.s - step) })
  else if (event.key === 'ArrowRight') set({ s: clamp(hsv.value.s + step) })
  else if (event.key === 'ArrowUp') set({ v: clamp(hsv.value.v + step) })
  else if (event.key === 'ArrowDown') set({ v: clamp(hsv.value.v - step) })
  else return
  event.preventDefault()
}

function commitText() {
  const hex = normalizeHex(text.value)
  // Something that is not a colour is put back to the current one when the field is left.
  if (hex) value.value = hex
  else text.value = value.value
}

// Picking a colour from anywhere on the screen. Only some browsers have it (Chrome and Edge on
// desktop at the time of writing); the button is left out everywhere else.
const canPickFromScreen = ref(false)
onMounted(() => {
  canPickFromScreen.value = 'EyeDropper' in window
})

async function pickFromScreen() {
  try {
    const EyeDropper = (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper
    const { sRGBHex } = await new EyeDropper().open()
    value.value = normalizeHex(sRGBHex) ?? value.value
  } catch {
    // Escape was pressed: nothing was picked, and nothing changes.
  }
}

function setOpen(next: boolean) {
  open.value = next && !props.disabled
}

useFloating(anchor, content, open, props)
useLayer(content, open, {
  loopFocus: true,
  ignore: () => [anchor.value],
  onDismiss: () => setOpen(false),
  initialFocus: () => area.value,
})
</script>

<template>
  <button
    ref="anchor"
    v-bind="$attrs"
    type="button"
    class="sb-color-picker"
    aria-haspopup="dialog"
    :aria-expanded="open"
    :aria-controls="open ? contentId : undefined"
    :aria-label="`${label}: ${value}`"
    :disabled="disabled"
    @click="setOpen(!open)"
  >
    <span class="sb-color-picker-swatch" :style="{ background: value }" />
    <!-- The code is always written out, so the choice never depends on being able to see the colour. -->
    <span class="sb-color-picker-value">{{ value }}</span>
  </button>

  <Portal>
    <Transition name="sb-pop">
      <div v-if="open" :id="contentId" ref="content" role="dialog" tabindex="-1" class="sb-floating sb-color-picker-content" :aria-label="label">
        <!-- A two-way slider: left / right is how vivid, up / down is how light. -->
        <div
          ref="area"
          role="slider"
          tabindex="0"
          class="sb-color-picker-area"
          aria-label="Saturation and brightness"
          :aria-valuetext="`Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`"
          :aria-valuenow="Math.round(hsv.s * 100)"
          aria-valuemin="0"
          aria-valuemax="100"
          :style="{ '--sb-color-hue': hueColor }"
          @pointerdown="onAreaDown"
          @pointermove="dragging && pick($event)"
          @pointerup="dragging = false"
          @pointercancel="dragging = false"
          @keydown="onAreaKeydown"
        >
          <span class="sb-color-picker-thumb" :style="{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: value }" />
        </div>
        <input
          type="range"
          class="sb-color-picker-hue"
          min="0"
          max="360"
          aria-label="Hue"
          :value="Math.round(hsv.h)"
          @input="set({ h: Number(($event.target as HTMLInputElement).value) })"
        />
        <div class="sb-color-picker-row">
          <span class="sb-color-picker-swatch" :style="{ background: value }" />
          <input v-model="text" type="text" class="sb-color-picker-hex" aria-label="Hex code" spellcheck="false" autocapitalize="off" maxlength="7" @change="commitText" @keydown.enter.prevent="commitText" />
          <button v-if="canPickFromScreen" type="button" class="sb-color-picker-eyedropper" aria-label="Pick a colour from the screen" title="Pick a colour from the screen" @click="pickFromScreen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m12 6 6 6M14 4l6 6-2.500 2.500-6-6L14 4ZM13 9l-8 8v3h3l8-8" />
            </svg>
          </button>
        </div>
        <div v-if="presets.length" class="sb-color-picker-presets" role="group" aria-label="Preset colours">
          <button
            v-for="preset in presets"
            :key="preset"
            type="button"
            :aria-label="preset"
            :aria-pressed="normalizeHex(preset) === value"
            :style="{ background: preset }"
            @click="value = normalizeHex(preset) ?? value"
          />
        </div>
      </div>
    </Transition>
  </Portal>

  <input v-if="name" type="hidden" :name="name" :value="value" :disabled="disabled" />
</template>

<style>
@layer components {
  .sb-color-picker {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    height: 2.25rem;
    padding: 0 0.75rem 0 0.5rem;
    border: 1px solid var(--sb-input);
    border-radius: var(--sb-radius-md);
    background: var(--sb-input-background);
    color: var(--sb-foreground);
    font-family: var(--sb-font-mono);
    font-size: 0.8125rem;
    box-shadow: var(--sb-shadow-xs);
    cursor: pointer;
  }

  .sb-color-picker:focus-visible {
    border-color: var(--sb-ring);
    outline: 2px solid color-mix(in oklab, var(--sb-ring) 45%, transparent);
    outline-offset: 0;
  }

  .sb-color-picker:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .sb-color-picker-swatch {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: var(--sb-radius-sm);
    box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--sb-foreground) 15%, transparent);
  }

  .sb-color-picker-content {
    display: grid;
    gap: 0.75rem;
    width: 15rem;
    padding: 0.75rem;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-md);
    background: var(--sb-popover);
    color: var(--sb-popover-foreground);
    box-shadow: var(--sb-shadow-md);
  }

  /* White to the hue across, with black rising from the bottom: every tint and shade of one hue. */
  .sb-color-picker-area {
    position: relative;
    height: 9rem;
    border-radius: var(--sb-radius-sm);
    background:
      linear-gradient(to top, #000, transparent),
      linear-gradient(to right, #fff, var(--sb-color-hue));
    cursor: crosshair;
    touch-action: none;
    outline: none;
  }

  .sb-color-picker-area:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-color-picker-thumb {
    position: absolute;
    width: 0.875rem;
    height: 0.875rem;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 1px oklch(0 0 0 / 40%);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .sb-color-picker-hue {
    appearance: none;
    display: block;
    width: 100%;
    height: 0.75rem;
    margin: 0;
    border-radius: 999px;
    background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
    cursor: pointer;
  }

  .sb-color-picker-hue::-webkit-slider-thumb {
    appearance: none;
    width: 0.875rem;
    height: 0.875rem;
    border: 2px solid #fff;
    border-radius: 50%;
    background: transparent;
    box-shadow: 0 0 0 1px oklch(0 0 0 / 40%);
  }

  .sb-color-picker-hue::-moz-range-thumb {
    box-sizing: border-box;
    width: 0.875rem;
    height: 0.875rem;
    border: 2px solid #fff;
    border-radius: 50%;
    background: transparent;
    box-shadow: 0 0 0 1px oklch(0 0 0 / 40%);
  }

  .sb-color-picker-hue::-moz-range-track {
    background: transparent;
  }

  .sb-color-picker-hue:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-color-picker-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .sb-color-picker-hex {
    flex: 1;
    min-width: 0;
    height: 2rem;
    padding: 0 0.5rem;
    border: 1px solid var(--sb-input);
    border-radius: var(--sb-radius-md);
    background: var(--sb-input-background);
    color: var(--sb-foreground);
    font-family: var(--sb-font-mono);
    font-size: 0.8125rem;
  }

  .sb-color-picker-hex:focus-visible {
    border-color: var(--sb-ring);
    outline: 2px solid color-mix(in oklab, var(--sb-ring) 45%, transparent);
    outline-offset: 0;
  }

  .sb-color-picker-eyedropper {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: 1px solid var(--sb-input);
    border-radius: var(--sb-radius-md);
    background: var(--sb-input-background);
    color: var(--sb-foreground);
    cursor: pointer;
  }

  .sb-color-picker-eyedropper:hover {
    background: var(--sb-accent);
  }

  .sb-color-picker-eyedropper:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-color-picker-eyedropper svg {
    width: 1rem;
    height: 1rem;
  }

  .sb-color-picker-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .sb-color-picker-presets button {
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: 0;
    border-radius: var(--sb-radius-sm);
    box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--sb-foreground) 15%, transparent);
    cursor: pointer;
  }

  .sb-color-picker-presets button[aria-pressed='true'] {
    outline: 2px solid var(--sb-foreground);
    outline-offset: 2px;
  }

  .sb-color-picker-presets button:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }
}
</style>
