<script setup lang="ts">
import { Dialog } from '../dialog'

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <!-- Shares the dialog's state and focus handling; what differs is how it may be closed. -->
  <Dialog v-slot="slotProps" v-model:open="open">
    <slot v-bind="slotProps" />
  </Dialog>
</template>
