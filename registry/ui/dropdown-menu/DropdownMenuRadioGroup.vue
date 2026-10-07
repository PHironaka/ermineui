<script setup lang="ts">
import { provideDropdownMenuRadio } from './context'

const value = defineModel<string>()

provideDropdownMenuRadio({
  value,
  select: (next) => {
    value.value = next
  },
})
</script>

<template>
  <div role="group" class="er-menu-group"><slot /></div>
</template>
