<script setup lang="ts">
defineProps<{
  /** Accessible name. Needed when the button holds only an icon; it is also shown as a tooltip. */
  label?: string
  /** For a button that stays on, such as Bold: whether it is on. Leave out for one that just does something. */
  pressed?: boolean
  disabled?: boolean
}>()
</script>

<template>
  <button type="button" class="er-toolbar-button" :aria-label="label" :title="label" :aria-pressed="pressed === undefined ? undefined : pressed" :disabled="disabled">
    <slot />
  </button>
</template>
