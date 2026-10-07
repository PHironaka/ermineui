<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { lockScroll } from '../../lib/scroll-lock'
import { useDialog } from '../dialog/context'

defineOptions({ inheritAttrs: false })

const dialog = useDialog()
const content = ref<HTMLElement | null>(null)

useLayer(content, dialog.open, {
  modal: true,
  loopFocus: true,
  // A press outside does nothing: the question has to be answered. Escape counts as "cancel".
  onDismiss: (reason) => {
    if (reason === 'escape') dialog.setOpen(false)
  },
  // Focus starts on Cancel, so a stray Enter never confirms something destructive.
  initialFocus: () => content.value?.querySelector<HTMLElement>('[data-alert-cancel]'),
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
    <Transition name="er-alert-dialog">
      <div v-if="dialog.open.value" class="er-alert-dialog-overlay">
        <div
          ref="content"
          v-bind="$attrs"
          role="alertdialog"
          aria-modal="true"
          tabindex="-1"
          class="er-alert-dialog"
          :aria-labelledby="dialog.titleId"
          :aria-describedby="dialog.hasDescription.value ? dialog.descriptionId : undefined"
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Portal>
</template>

<style>
@layer components {
  .er-alert-dialog-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--er-z-overlay);
    display: grid;
    place-items: center;
    padding: 1rem;
    background: var(--er-overlay);
    overflow-y: auto;
  }

  .er-alert-dialog {
    display: grid;
    gap: 0.5rem;
    width: 100%;
    max-width: 28rem;
    padding: 1.5rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
    background: var(--er-background);
    color: var(--er-foreground);
    box-shadow: var(--er-shadow-lg);
    outline: none;
  }

  .er-alert-dialog-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .er-alert-dialog-description {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .er-alert-dialog-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .er-alert-dialog-enter-active,
  .er-alert-dialog-leave-active,
  .er-alert-dialog-enter-active .er-alert-dialog,
  .er-alert-dialog-leave-active .er-alert-dialog {
    transition:
      opacity var(--er-duration) var(--er-ease),
      transform var(--er-duration) var(--er-ease);
  }

  .er-alert-dialog-enter-from,
  .er-alert-dialog-leave-to {
    opacity: 0;
  }

  .er-alert-dialog-enter-from .er-alert-dialog,
  .er-alert-dialog-leave-to .er-alert-dialog {
    transform: scale(0.96);
  }
}
</style>
