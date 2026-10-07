<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, useId } from 'vue'
import { useCombobox } from './context'

const props = defineProps<{
  value: string
  disabled?: boolean
  /** Text to filter on and show in the input. Defaults to the item's text. */
  textValue?: string
}>()

const combobox = useCombobox()
const el = ref<HTMLElement | null>(null)
const id = useId()

const selected = computed(() => combobox.value.value === props.value)
const visible = computed(() => combobox.matches(combobox.labels.get(props.value) ?? ''))

function register() {
  combobox.labels.set(props.value, props.textValue ?? el.value?.textContent?.trim() ?? props.value)
}

onMounted(register)
onUpdated(register)
onBeforeUnmount(() => combobox.labels.delete(props.value))

function choose() {
  if (!props.disabled) combobox.select(props.value)
}

function onPointerMove() {
  if (!props.disabled) combobox.activeId.value = id
}
</script>

<template>
  <div
    v-show="visible"
    :id="id"
    ref="el"
    role="option"
    class="er-combobox-item"
    :aria-selected="selected"
    :aria-disabled="disabled || undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-hidden="visible ? undefined : ''"
    :data-active="combobox.activeId.value === id ? '' : undefined"
    @click="choose"
    @pointermove="onPointerMove"
  >
    <span><slot /></span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  </div>
</template>
