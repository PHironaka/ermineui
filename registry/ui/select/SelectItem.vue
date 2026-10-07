<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'
import { useSelect } from './context'

const props = defineProps<{
  value: string
  disabled?: boolean
  /** Label shown in the trigger. Defaults to the item's text. */
  textValue?: string
}>()

const select = useSelect()
const el = ref<HTMLElement | null>(null)
const selected = computed(() => select.value.value === props.value)

function register() {
  select.labels.set(props.value, props.textValue ?? el.value?.textContent?.trim() ?? props.value)
}

onMounted(register)
onUpdated(register)
onBeforeUnmount(() => select.labels.delete(props.value))

function choose() {
  if (!props.disabled) select.select(props.value)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  choose()
}

function onPointerMove(event: PointerEvent) {
  if (!props.disabled) (event.currentTarget as HTMLElement).focus({ preventScroll: true })
}
</script>

<template>
  <div
    ref="el"
    role="option"
    tabindex="-1"
    class="sb-select-item"
    :aria-selected="selected"
    :aria-disabled="disabled || undefined"
    :data-disabled="disabled ? '' : undefined"
    @click="choose"
    @keydown="onKeydown"
    @pointermove="onPointerMove"
  >
    <span><slot /></span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  </div>
</template>
