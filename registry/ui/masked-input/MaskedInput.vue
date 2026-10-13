<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '../input'
import { applyMask, caretAfter, digitsOnly, unmask } from './mask'

const props = defineProps<{
  /** The shape of the finished text: `#` is a digit, `A` a letter, `*` either. See mask.ts for ready-made ones. */
  mask: string
}>()

/** What was typed, without the spaces, slashes and brackets the mask adds: '4242424242424242', not '4242 4242 …'. */
const model = defineModel<string>({ default: '' })

const shown = computed(() => applyMask(unmask(model.value, props.mask), props.mask))

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  // How many real characters sit before the caret; the caret goes back after that many once the text is laid out again.
  const before = unmask(input.value.slice(0, input.selectionStart ?? input.value.length), props.mask).length
  const raw = unmask(input.value, props.mask)
  const masked = applyMask(raw, props.mask)
  model.value = raw
  input.value = masked
  // Typing at the end keeps the caret at the end, past any separator that was just added.
  const caret = before >= raw.length ? masked.length : caretAfter(masked, props.mask, before)
  input.setSelectionRange(caret, caret)
}
</script>

<template>
  <Input :model-value="shown" :inputmode="digitsOnly(mask) ? 'numeric' : undefined" :maxlength="mask.length" @input="onInput" />
</template>
