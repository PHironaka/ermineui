<script setup lang="ts">
import { computed } from 'vue'
import { useToggleGroup } from './context'

const props = defineProps<{
  value: string
  disabled?: boolean
}>()

const group = useToggleGroup()
const on = computed(() => group.isOn(props.value))
const single = computed(() => group.type.value === 'single')
</script>

<template>
  <button
    type="button"
    class="er-toggle-group-item"
    :role="single ? 'radio' : undefined"
    :aria-checked="single ? on : undefined"
    :aria-pressed="single ? undefined : on"
    :tabindex="single && group.tabStop.value !== value ? -1 : 0"
    :disabled="disabled || group.disabled.value"
    :data-state="on ? 'on' : 'off'"
    :data-value="value"
    @click="group.toggle(value)"
  >
    <slot />
  </button>
</template>
