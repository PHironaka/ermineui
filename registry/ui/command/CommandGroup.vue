<script setup lang="ts">
import { computed, useId } from 'vue'
import { provideCommandGroup, useCommand } from './context'

defineProps<{
  heading: string
}>()

const command = useCommand()
const id = useId()
provideCommandGroup(id)

// A group with nothing left to show takes its heading away with it.
const visible = computed(() => [...command.entries.values()].some((entry) => entry.group === id && command.matches(entry.text)))
</script>

<template>
  <div v-show="visible" role="group" :aria-labelledby="`${id}-heading`">
    <div :id="`${id}-heading`" class="er-command-heading">{{ heading }}</div>
    <slot />
  </div>
</template>
