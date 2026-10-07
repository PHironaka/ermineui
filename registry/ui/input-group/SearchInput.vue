<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '../input'
import InputGroup from './InputGroup.vue'

// Attributes such as id, placeholder and aria-label belong on the input itself.
defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    clearLabel?: string
  }>(),
  { clearLabel: 'Clear search' },
)

const model = defineModel<string>({ default: '' })
const root = ref<HTMLElement | null>(null)

function clear() {
  model.value = ''
  root.value?.querySelector('input')?.focus()
}

function onKeydown(event: KeyboardEvent) {
  // Escape empties the field first; only an already empty field lets Escape through (to close a dialog, say).
  if (event.key !== 'Escape' || !model.value) return
  event.preventDefault()
  event.stopPropagation()
  clear()
}
</script>

<template>
  <div ref="root" class="er-search-input" @keydown="onKeydown">
    <InputGroup>
      <template #prefix>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.500-3.500" />
        </svg>
      </template>
      <Input v-bind="$attrs" v-model="model" type="search" />
      <template v-if="model" #suffix>
        <button type="button" class="er-input-group-button" :aria-label="clearLabel" @click="clear">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </template>
    </InputGroup>
  </div>
</template>
