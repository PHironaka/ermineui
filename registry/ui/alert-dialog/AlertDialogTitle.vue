<script setup lang="ts">
import { useDialog } from '../dialog/context'

const dialog = useDialog()
</script>

<template>
  <h2 :id="dialog.titleId" class="sb-alert-dialog-title"><slot /></h2>
</template>
