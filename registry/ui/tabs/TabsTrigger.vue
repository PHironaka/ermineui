<script setup lang="ts">
import { computed } from 'vue'
import { panelId, tabId, useTabs } from './context'

const props = defineProps<{
  value: string
  disabled?: boolean
}>()

const tabs = useTabs()
const selected = computed(() => tabs.value.value === props.value)
</script>

<template>
  <button
    :id="tabId(tabs.baseId, value)"
    type="button"
    role="tab"
    class="sb-tabs-trigger"
    :aria-selected="selected"
    :aria-controls="panelId(tabs.baseId, value)"
    :tabindex="selected ? 0 : -1"
    :data-state="selected ? 'active' : 'inactive'"
    :disabled="disabled"
    @click="tabs.select(value)"
  >
    <slot />
  </button>
</template>
