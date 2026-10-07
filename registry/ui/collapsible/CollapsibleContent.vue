<script setup lang="ts">
import { useCollapsible } from './context'

const collapsible = useCollapsible()
</script>

<template>
  <!-- Closed content stays in the page so it can animate, but inert keeps it out of Tab order and screen readers. -->
  <div
    :id="collapsible.contentId"
    class="er-collapsible-content"
    :data-state="collapsible.open.value ? 'open' : 'closed'"
    :inert="!collapsible.open.value"
  >
    <div><slot /></div>
  </div>
</template>
