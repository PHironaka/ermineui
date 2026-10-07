<script setup lang="ts">
import { Button } from '../button'
import { useDialog } from '../dialog/context'

const dialog = useDialog()
</script>

<template>
  <Button variant="outline" data-alert-cancel @click="dialog.setOpen(false)"><slot>Cancel</slot></Button>
</template>
