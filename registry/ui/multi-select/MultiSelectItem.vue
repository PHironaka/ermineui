<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, useId } from 'vue'
import { useMultiSelect } from './context'

const props = defineProps<{
  value: string
  disabled?: boolean
  /** Text to filter on and show in the tag. Defaults to the item's text. */
  textValue?: string
}>()

const select = useMultiSelect()
const el = ref<HTMLElement | null>(null)
const id = useId()

const selected = computed(() => select.values.value.includes(props.value))
const visible = computed(() => select.matches(select.labels.get(props.value) ?? ''))

function register() {
  select.labels.set(props.value, props.textValue ?? el.value?.textContent?.trim() ?? props.value)
}

onMounted(register)
onUpdated(register)
onBeforeUnmount(() => select.labels.delete(props.value))

function onPointerMove() {
  if (!props.disabled) select.activeId.value = id
}
</script>

<template>
  <div
    v-show="visible"
    :id="id"
    ref="el"
    role="option"
    class="sb-multi-select-item"
    :aria-selected="selected"
    :aria-disabled="disabled || undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-hidden="visible ? undefined : ''"
    :data-active="select.activeId.value === id ? '' : undefined"
    @click="!disabled && select.toggle(value)"
    @pointermove="onPointerMove"
  >
    <span class="sb-multi-select-box" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
    <span><slot /></span>
  </div>
</template>
