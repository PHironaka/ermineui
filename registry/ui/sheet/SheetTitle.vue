<script setup lang="ts">
import { useDialog } from '../dialog/context'

const sheet = useDialog()
</script>

<template>
  <h2 :id="sheet.titleId" class="sb-sheet-title"><slot /></h2>
</template>
