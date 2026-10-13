<script setup lang="ts">
import { computed } from 'vue'
import { useSegmentedControl } from './context'

const props = defineProps<{
  value: string
  /** Accessible name. Needed when the segment holds only an icon; otherwise the text inside is used. */
  label?: string
  disabled?: boolean
}>()

const group = useSegmentedControl()
const on = computed(() => group.value.value === props.value)
</script>

<template>
  <label class="er-segmented-control-item" :data-state="on ? 'on' : 'off'">
    <input
      type="radio"
      :name="group.name.value"
      :value="value"
      :checked="on"
      :disabled="disabled || group.disabled.value"
      :aria-label="label"
      @change="group.select(value)"
    />
    <slot>{{ label ?? value }}</slot>
  </label>
</template>
