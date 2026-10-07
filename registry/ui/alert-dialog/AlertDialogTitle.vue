<script setup lang="ts">
import { useDialog } from '../dialog/context'

const dialog = useDialog()
</script>

<template>
  <h2 :id="dialog.titleId" class="er-alert-dialog-title"><slot /></h2>
</template>
