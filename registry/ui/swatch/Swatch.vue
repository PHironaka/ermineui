<script setup lang="ts">
import { computed } from 'vue'
import { useSwatchGroup } from './context'

const props = defineProps<{
  value: string
  /** Any CSS colour. With one, the swatch is a round dot of that colour and `label` names it. */
  color?: string
  /** Accessible name. Needed for a colour; otherwise the text inside is used. */
  label?: string
  /** Sold out, or not made in this combination: shown struck through and cannot be chosen. */
  unavailable?: boolean
}>()

const group = useSwatchGroup()
const on = computed(() => group.value.value === props.value)
const name = computed(() => {
  const text = props.label ?? (props.color ? props.value : undefined)
  // Without a label the text inside names the radio button, and being disabled says the rest.
  return props.unavailable && text ? `${text}, not available` : text
})
</script>

<template>
  <label
    class="er-swatch"
    :data-state="on ? 'on' : 'off'"
    :data-color="color ? '' : undefined"
    :data-unavailable="unavailable ? '' : undefined"
    :style="color ? { '--er-swatch-color': color } : undefined"
    :title="color ? (label ?? value) : undefined"
  >
    <input
      type="radio"
      :name="group.name.value"
      :value="value"
      :checked="on"
      :disabled="unavailable || group.disabled.value"
      :aria-label="name"
      @change="group.select(value)"
    />
    <slot v-if="!color">{{ label ?? value }}</slot>
  </label>
</template>
