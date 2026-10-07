<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useDialog } from '../dialog/context'

const dialog = useDialog()

onMounted(() => {
  dialog.hasDescription.value = true
})
onBeforeUnmount(() => {
  dialog.hasDescription.value = false
})
</script>

<template>
  <p :id="dialog.descriptionId" class="sb-alert-dialog-description"><slot /></p>
</template>
