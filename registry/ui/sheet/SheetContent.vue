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
    <Transition name="sb-sheet">
      <div v-if="sheet.open.value" class="sb-sheet-overlay">
        <div
          ref="content"
          v-bind="$attrs"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          class="sb-sheet-content"
          :data-side="side"
          :aria-labelledby="sheet.titleId"
          :aria-describedby="sheet.hasDescription.value ? sheet.descriptionId : undefined"
        >
          <slot />
          <button v-if="showClose" type="button" class="sb-sheet-x" :aria-label="closeLabel" @click="sheet.setOpen(false)">
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
  .sb-sheet-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--sb-z-overlay);
    background: var(--sb-overlay);
    overflow: hidden;
  }

  .sb-sheet-content {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--sb-background);
    color: var(--sb-foreground);
    box-shadow: var(--sb-shadow-lg);
    outline: none;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .sb-sheet-content[data-side='right'],
  .sb-sheet-content[data-side='left'] {
    top: 0;
    bottom: 0;
    width: min(24rem, calc(100% - 3rem));
  }

  .sb-sheet-content[data-side='right'] {
    right: 0;
    border-left: 1px solid var(--sb-border);
  }

  .sb-sheet-content[data-side='left'] {
    left: 0;
    border-right: 1px solid var(--sb-border);
  }

  .sb-sheet-content[data-side='top'],
  .sb-sheet-content[data-side='bottom'] {
    right: 0;
    left: 0;
    max-height: calc(100% - 3rem);
  }

  .sb-sheet-content[data-side='top'] {
    top: 0;
    border-bottom: 1px solid var(--sb-border);
  }

  .sb-sheet-content[data-side='bottom'] {
    bottom: 0;
    border-top: 1px solid var(--sb-border);
  }

  .sb-sheet-header {
    display: grid;
    gap: 0.5rem;
    padding-right: 1.5rem;
  }

  .sb-sheet-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .sb-sheet-description {
    margin: 0;
    color: var(--sb-muted-foreground);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  /* Pushed to the far end, so actions sit at the bottom of a tall side sheet. */
  .sb-sheet-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: auto;
  }

  .sb-sheet-x {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: grid;
    place-content: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: 0;
    border-radius: var(--sb-radius-sm);
    background: transparent;
    color: var(--sb-muted-foreground);
    cursor: pointer;
    transition: color var(--sb-duration);
  }

  .sb-sheet-x:hover {
    color: var(--sb-foreground);
  }

  .sb-sheet-x:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-sheet-x svg {
    width: 1rem;
    height: 1rem;
  }

  .sb-sheet-enter-active,
  .sb-sheet-leave-active,
  .sb-sheet-enter-active .sb-sheet-content,
  .sb-sheet-leave-active .sb-sheet-content {
    transition:
      opacity calc(var(--sb-duration) * 1.5) var(--sb-ease),
      transform calc(var(--sb-duration) * 1.5) var(--sb-ease);
  }

  .sb-sheet-enter-from,
  .sb-sheet-leave-to {
    opacity: 0;
  }

  .sb-sheet-enter-from .sb-sheet-content[data-side='right'],
  .sb-sheet-leave-to .sb-sheet-content[data-side='right'] {
    transform: translateX(100%);
  }

  .sb-sheet-enter-from .sb-sheet-content[data-side='left'],
  .sb-sheet-leave-to .sb-sheet-content[data-side='left'] {
    transform: translateX(-100%);
  }

  .sb-sheet-enter-from .sb-sheet-content[data-side='top'],
  .sb-sheet-leave-to .sb-sheet-content[data-side='top'] {
    transform: translateY(-100%);
  }

  .sb-sheet-enter-from .sb-sheet-content[data-side='bottom'],
  .sb-sheet-leave-to .sb-sheet-content[data-side='bottom'] {
    transform: translateY(100%);
  }
}
</style>
