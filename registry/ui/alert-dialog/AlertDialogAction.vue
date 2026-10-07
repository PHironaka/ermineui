<script setup lang="ts">
import { Button } from '../button'
import { useDialog } from '../dialog/context'

withDefaults(
  defineProps<{
    /** Use "destructive" when confirming deletes something. */
    variant?: 'default' | 'destructive'
  }>(),
  { variant: 'default' },
)

const dialog = useDialog()
</script>

<template>
  <!-- Your own @click runs as well; the dialog closes either way. -->
  <Button :variant="variant" @click="dialog.setOpen(false)"><slot>Continue</slot></Button>
</template>
