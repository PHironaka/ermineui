<script setup lang="ts">
import { DropdownMenuContent } from '../dropdown-menu'
</script>

<template>
  <!-- The dropdown menu's own panel, opening down and to the right of the pointer. -->
  <DropdownMenuContent side="bottom" align="start" :side-offset="2">
    <slot />
  </DropdownMenuContent>
</template>
