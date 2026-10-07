<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { lockScroll } from '../../lib/scroll-lock'
import { useDialog } from '../dialog/context'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** The edge of the screen the sheet slides in from. */
    side?: 'top' | 'right' | 'bottom' | 'left'
    /** Show the × button in the corner. */
    showClose?: boolean
    /** Close when the user presses outside the sheet. */
    closeOnOutside?: boolean
    /** Accessible name of the × button. */
    closeLabel?: string
  }>(),
  { side: 'right', showClose: true, closeOnOutside: true, closeLabel: 'Close' },
)

const sheet = useDialog()
const content = ref<HTMLElement | null>(null)

useLayer(content, sheet.open, {
  modal: true,
  loopFocus: true,
  onDismiss: (reason) => {
    if (reason === 'outside' && !props.closeOnOutside) return
    sheet.setOpen(false)
  },
})

watch(
  sheet.open,
  (open, _previous, onCleanup) => {
    if (open) onCleanup(lockScroll())
  },
  { immediate: true },
)
</script>

<template>
  <Portal>
    <Transition name="er-sheet">
      <div v-if="sheet.open.value" class="er-sheet-overlay">
        <div
          ref="content"
          v-bind="$attrs"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          class="er-sheet-content"
          :data-side="side"
          :aria-labelledby="sheet.titleId"
          :aria-describedby="sheet.hasDescription.value ? sheet.descriptionId : undefined"
        >
          <slot />
          <button v-if="showClose" type="button" class="er-sheet-x" :aria-label="closeLabel" @click="sheet.setOpen(false)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Portal>
</template>

<style>
@layer components {
  .er-sheet-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--er-z-overlay);
    background: var(--er-overlay);
    overflow: hidden;
  }

  .er-sheet-content {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--er-background);
    color: var(--er-foreground);
    box-shadow: var(--er-shadow-lg);
    outline: none;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .er-sheet-content[data-side='right'],
  .er-sheet-content[data-side='left'] {
    top: 0;
    bottom: 0;
    width: min(24rem, calc(100% - 3rem));
  }

  .er-sheet-content[data-side='right'] {
    right: 0;
    border-left: 1px solid var(--er-border);
  }

  .er-sheet-content[data-side='left'] {
    left: 0;
    border-right: 1px solid var(--er-border);
  }

  .er-sheet-content[data-side='top'],
  .er-sheet-content[data-side='bottom'] {
    right: 0;
    left: 0;
    max-height: calc(100% - 3rem);
  }

  .er-sheet-content[data-side='top'] {
    top: 0;
    border-bottom: 1px solid var(--er-border);
  }

  .er-sheet-content[data-side='bottom'] {
    bottom: 0;
    border-top: 1px solid var(--er-border);
  }

  .er-sheet-header {
    display: grid;
    gap: 0.5rem;
    padding-right: 1.5rem;
  }

  .er-sheet-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .er-sheet-description {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  /* Pushed to the far end, so actions sit at the bottom of a tall side sheet. */
  .er-sheet-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: auto;
  }

  .er-sheet-x {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: grid;
    place-content: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-muted-foreground);
    cursor: pointer;
    transition: color var(--er-duration);
  }

  .er-sheet-x:hover {
    color: var(--er-foreground);
  }

  .er-sheet-x:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-sheet-x svg {
    width: 1rem;
    height: 1rem;
  }

  .er-sheet-enter-active,
  .er-sheet-leave-active,
  .er-sheet-enter-active .er-sheet-content,
  .er-sheet-leave-active .er-sheet-content {
    transition:
      opacity calc(var(--er-duration) * 1.5) var(--er-ease),
      transform calc(var(--er-duration) * 1.5) var(--er-ease);
  }

  .er-sheet-enter-from,
  .er-sheet-leave-to {
    opacity: 0;
  }

  .er-sheet-enter-from .er-sheet-content[data-side='right'],
  .er-sheet-leave-to .er-sheet-content[data-side='right'] {
    transform: translateX(100%);
  }

  .er-sheet-enter-from .er-sheet-content[data-side='left'],
  .er-sheet-leave-to .er-sheet-content[data-side='left'] {
    transform: translateX(-100%);
  }

  .er-sheet-enter-from .er-sheet-content[data-side='top'],
  .er-sheet-leave-to .er-sheet-content[data-side='top'] {
    transform: translateY(-100%);
  }

  .er-sheet-enter-from .er-sheet-content[data-side='bottom'],
  .er-sheet-leave-to .er-sheet-content[data-side='bottom'] {
    transform: translateY(100%);
  }
}
</style>
