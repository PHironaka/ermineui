<script setup lang="ts">
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '../sheet'

withDefaults(
  defineProps<{
    /** What the actions are for: "Wool throw", "3 photos selected". Read out as the sheet's name even when hidden. */
    title: string
    /** A line under the title, e.g. what cannot be undone. */
    description?: string
    /** Keep the title for screen readers only. */
    hideTitle?: boolean
    /** The words on the button that closes the sheet without doing anything. */
    cancelLabel?: string
  }>(),
  { cancelLabel: 'Cancel' },
)

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <Sheet v-model:open="open">
    <!-- The button that opens the sheet. -->
    <SheetTrigger v-if="$slots.trigger" as-child><slot name="trigger" /></SheetTrigger>
    <SheetContent side="bottom" :show-close="false" class="er-action-sheet">
      <div class="er-action-sheet-head" :data-hidden="hideTitle ? '' : undefined">
        <SheetTitle>{{ title }}</SheetTitle>
        <SheetDescription v-if="description">{{ description }}</SheetDescription>
      </div>
      <!-- ActionSheetItem, one per action. -->
      <div class="er-action-sheet-items"><slot /></div>
      <SheetClose class="er-action-sheet-item er-action-sheet-cancel">{{ cancelLabel }}</SheetClose>
    </SheetContent>
  </Sheet>
</template>

<style>
@layer components {
  /* Narrower than the screen on anything wider than a phone, and clear of the home indicator. */
  .er-sheet-content.er-action-sheet {
    gap: 0.5rem;
    width: min(100%, 28rem);
    margin-inline: auto;
    padding: 0.75rem 0.75rem max(0.75rem, env(safe-area-inset-bottom));
    border: 1px solid var(--er-border);
    border-bottom: 0;
    border-radius: var(--er-radius-xl) var(--er-radius-xl) 0 0;
  }

  .er-action-sheet-head {
    display: grid;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    text-align: center;
  }

  .er-action-sheet-head .er-sheet-title {
    font-size: 0.9375rem;
  }

  .er-action-sheet-head[data-hidden] {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .er-action-sheet-items {
    display: grid;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
    overflow: hidden;
  }

  .er-action-sheet-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    min-height: 3rem;
    padding: 0.5rem 1rem;
    border: 0;
    background: transparent;
    color: var(--er-foreground);
    font: inherit;
    font-size: 1rem;
    text-align: left;
    cursor: pointer;
    transition: background-color var(--er-duration);
  }

  .er-action-sheet-items .er-action-sheet-item + .er-action-sheet-item {
    border-top: 1px solid var(--er-border);
  }

  .er-action-sheet-item:hover {
    background: var(--er-accent);
  }

  .er-action-sheet-item:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: -2px;
  }

  .er-action-sheet-item:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .er-action-sheet-item[data-destructive] {
    color: var(--er-destructive);
  }

  .er-action-sheet-item svg {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
  }

  .er-action-sheet-cancel {
    justify-content: center;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
    font-weight: var(--er-weight-semibold);
  }
}
</style>
