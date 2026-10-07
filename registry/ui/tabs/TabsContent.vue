<script setup lang="ts">
import { panelId, tabId, useTabs } from './context'

defineProps<{
  value: string
}>()

const tabs = useTabs()
</script>

<template>
  <div
    v-if="tabs.value.value === value"
    :id="panelId(tabs.baseId, value)"
    role="tabpanel"
    tabindex="0"
    class="sb-tabs-content"
    :aria-labelledby="tabId(tabs.baseId, value)"
  >
    <slot />
  </div>
</template>
