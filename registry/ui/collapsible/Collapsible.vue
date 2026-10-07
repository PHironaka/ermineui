<script setup lang="ts">
import { toRef, useId } from 'vue'
import { provideCollapsible } from './context'

const props = defineProps<{
  disabled?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

provideCollapsible({
  open,
  toggle: () => {
    if (!props.disabled) open.value = !open.value
  },
  disabled: toRef(props, 'disabled'),
  contentId: useId(),
})
</script>

<template>
  <div class="sb-collapsible" :data-state="open ? 'open' : 'closed'">
    <slot :open="open" />
  </div>
</template>

<style>
@layer components {
  /* Animates to the content's own height: a grid row going from 0fr to 1fr needs no measuring. */
  .sb-collapsible-content {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows var(--sb-duration) var(--sb-ease);
  }

  .sb-collapsible-content[data-state='open'] {
    grid-template-rows: 1fr;
  }

  .sb-collapsible-content > div {
    min-height: 0;
    overflow: hidden;
    /* Hidden outright once it has closed, so its text cannot be selected or found while out of sight. */
    visibility: hidden;
    transition: visibility 0s linear var(--sb-duration);
  }

  .sb-collapsible-content[data-state='open'] > div {
    visibility: visible;
    transition-delay: 0s;
  }
}
</style>
