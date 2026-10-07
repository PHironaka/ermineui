<script setup lang="ts">
import { Dialog } from '../dialog'

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <!-- A sheet is a dialog that sits at an edge, so it shares the dialog's state and its parts. -->
  <Dialog v-slot="slotProps" v-model:open="open">
    <slot v-bind="slotProps" />
  </Dialog>
</template>
