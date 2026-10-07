<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { lockScroll } from '../../lib/scroll-lock'
import { useDialog } from './context'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Show the × button in the corner. */
    showClose?: boolean
    /** Close when the user presses outside the dialog. Turn off for decisions that must be made. */
    closeOnOutside?: boolean
    /** Accessible name of the × button. */
    closeLabel?: string
  }>(),
  { showClose: true, closeOnOutside: true, closeLabel: 'Close' },
)

const dialog = useDialog()
const content = ref<HTMLElement | null>(null)

useLayer(content, dialog.open, {
  modal: true,
  loopFocus: true,
  onDismiss: (reason) => {
    if (reason === 'outside' && !props.closeOnOutside) return
    dialog.setOpen(false)
  },
})

watch(
  dialog.open,
  (open, _previous, onCleanup) => {
    if (open) onCleanup(lockScroll())
  },
  { immediate: true },
)
</script>

<template>
  <Portal>
    <Transition name="sb-dialog">
      <div v-if="dialog.open.value" class="sb-dialog-overlay">
        <div
          ref="content"
          v-bind="$attrs"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          class="sb-dialog-content"
          :aria-labelledby="dialog.titleId"
          :aria-describedby="dialog.hasDescription.value ? dialog.descriptionId : undefined"
        >
          <slot />
          <button
            v-if="showClose"
            type="button"
            class="sb-dialog-x"
            :aria-label="closeLabel"
            @click="dialog.setOpen(false)"
          >
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
  /* The overlay is also the scroll container, so a tall dialog scrolls instead of being cut off. */
  .sb-dialog-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--sb-z-overlay);
    display: grid;
    place-items: center;
    padding: 1rem;
    background: var(--sb-overlay);
    overflow-y: auto;
  }

  .sb-dialog-content {
    position: relative;
    display: grid;
    gap: 1rem;
    width: 100%;
    max-width: 32rem;
    padding: 1.5rem;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-lg);
    background: var(--sb-background);
    color: var(--sb-foreground);
    box-shadow: var(--sb-shadow-lg);
    outline: none;
  }

  .sb-dialog-header {
    display: grid;
    gap: 0.5rem;
    padding-right: 1.5rem;
  }

  .sb-dialog-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .sb-dialog-description {
    margin: 0;
    color: var(--sb-muted-foreground);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .sb-dialog-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .sb-dialog-x {
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

  .sb-dialog-x:hover {
    color: var(--sb-foreground);
  }

  .sb-dialog-x:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-dialog-x svg {
    width: 1rem;
    height: 1rem;
  }

  .sb-dialog-enter-active,
  .sb-dialog-leave-active,
  .sb-dialog-enter-active .sb-dialog-content,
  .sb-dialog-leave-active .sb-dialog-content {
    transition:
      opacity var(--sb-duration) var(--sb-ease),
      transform var(--sb-duration) var(--sb-ease);
  }

  .sb-dialog-enter-from,
  .sb-dialog-leave-to {
    opacity: 0;
  }

  .sb-dialog-enter-from .sb-dialog-content,
  .sb-dialog-leave-to .sb-dialog-content {
    transform: scale(0.96);
  }
}
</style>
