<script setup lang="ts">
import { computed, ref } from 'vue'

// id and name go on the first box (so a label can point at it); the rest is shared by every box.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** How many characters the code has. */
    length?: number
    /** "numeric" accepts digits only and shows the number keypad on phones. */
    type?: 'numeric' | 'alphanumeric'
    /** Show dots instead of the characters. */
    mask?: boolean
    disabled?: boolean
    /** Submit the whole code with a form under this name. */
    name?: string
    /** Accessible name of the group of boxes. */
    label?: string
  }>(),
  { length: 6, type: 'numeric', label: 'Verification code' },
)

const emit = defineEmits<{
  /** Every box is filled. */
  complete: [code: string]
}>()

/** The code so far. Shorter than `length` until every box is filled. */
const model = defineModel<string>({ default: '' })

const root = ref<HTMLElement | null>(null)
const allowed = computed(() => (props.type === 'numeric' ? /[^0-9]/g : /[^0-9a-z]/gi))
const chars = computed(() => Array.from({ length: props.length }, (_box, index) => model.value[index] ?? ''))

const box = (index: number) => root.value?.querySelectorAll<HTMLInputElement>('input:not([type="hidden"])')[index]

function focusBox(index: number) {
  const target = box(Math.max(0, Math.min(index, props.length - 1)))
  target?.focus()
  target?.select()
}

/** Writes `text` into the boxes starting at `index` — one typed character, or a whole pasted code. */
function write(index: number, text: string) {
  const clean = text.replace(allowed.value, '')
  if (!clean) return
  const next = chars.value.slice()
  for (let offset = 0; offset < clean.length && index + offset < props.length; offset++) next[index + offset] = clean[offset]!
  // A code has no holes: it ends at the first empty box.
  const firstGap = next.indexOf('')
  const code = (firstGap === -1 ? next : next.slice(0, firstGap)).join('')
  model.value = code
  focusBox(index + clean.length)
  if (code.length === props.length) emit('complete', code)
}

function onInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const typed = input.value
  const existing = chars.value[index] ?? ''
  // The box shows what the model says, whatever was typed (a letter in a numeric code, say).
  input.value = existing
  // Typing into a filled box arrives as old + new; only the new part counts.
  write(index, existing && typed.length > 1 && typed.startsWith(existing) ? typed.slice(1) : typed)
}

function onKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace') {
    event.preventDefault()
    // Clears this box, or steps back and clears the one before when this one is already empty.
    const target = chars.value[index] ? index : index - 1
    if (target >= 0) model.value = model.value.slice(0, target)
    focusBox(target)
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    focusBox(index - 1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    focusBox(Math.min(index + 1, model.value.length))
  }
}

function onPaste(index: number, event: ClipboardEvent) {
  event.preventDefault()
  write(index, event.clipboardData?.getData('text') ?? '')
}
</script>

<template>
  <div ref="root" role="group" class="sb-pin-input" :aria-label="label" :data-disabled="disabled ? '' : undefined">
    <input
      v-for="(char, index) in chars"
      :key="index"
      v-bind="index === 0 ? $attrs : { 'aria-invalid': $attrs['aria-invalid'] as 'true' | undefined, 'aria-describedby': $attrs['aria-describedby'] as string | undefined }"
      :type="mask ? 'password' : 'text'"
      :inputmode="type === 'numeric' ? 'numeric' : 'text'"
      :autocomplete="index === 0 ? 'one-time-code' : 'off'"
      autocapitalize="off"
      spellcheck="false"
      :maxlength="length"
      :aria-label="`Character ${index + 1} of ${length}`"
      :disabled="disabled"
      :value="char"
      @input="onInput(index, $event)"
      @keydown="onKeydown(index, $event)"
      @paste="onPaste(index, $event)"
      @focus="($event.target as HTMLInputElement).select()"
    />
    <input v-if="name" type="hidden" :name="name" :value="model" :disabled="disabled" />
  </div>
</template>

<style>
@layer components {
  .sb-pin-input {
    display: inline-flex;
    gap: 0.5rem;
    max-width: 100%;
  }

  .sb-pin-input input:not([type='hidden']) {
    width: 2.5rem;
    min-width: 0;
    height: 2.75rem;
    padding: 0;
    border: 1px solid var(--sb-input);
    border-radius: var(--sb-radius-md);
    background: var(--sb-input-background);
    color: var(--sb-foreground);
    font-family: inherit;
    font-size: 1.125rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    text-align: center;
    box-shadow: var(--sb-shadow-xs);
    caret-color: transparent;
    transition:
      border-color var(--sb-duration),
      outline-color var(--sb-duration);
  }

  .sb-pin-input input:focus-visible {
    border-color: var(--sb-ring);
    outline: 2px solid color-mix(in oklab, var(--sb-ring) 45%, transparent);
    outline-offset: 0;
  }

  .sb-pin-input input[aria-invalid='true'] {
    border-color: var(--sb-destructive);
  }

  .sb-pin-input[data-disabled] {
    opacity: 0.5;
  }
}
</style>
