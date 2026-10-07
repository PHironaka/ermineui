<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useDialog } from '../dialog/context'

const sheet = useDialog()

onMounted(() => {
  sheet.hasDescription.value = true
})
onBeforeUnmount(() => {
  sheet.hasDescription.value = false
})
</script>

<template>
  <p :id="sheet.descriptionId" class="er-sheet-description"><slot /></p>
</template>
