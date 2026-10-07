<script setup lang="ts">
import { useRadioGroup } from './context'

defineProps<{
  value: string
  disabled?: boolean
}>()

const group = useRadioGroup()
</script>

<template>
  <input
    type="radio"
    class="sb-radio"
    :name="group.name.value"
    :value="value"
    :checked="group.value.value === value"
    :disabled="disabled || group.disabled.value"
    @change="group.select(value)"
  />
</template>
