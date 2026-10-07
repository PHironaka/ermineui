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
    <Transition name="sb-alert-dialog">
      <div v-if="dialog.open.value" class="sb-alert-dialog-overlay">
        <div
          ref="content"
          v-bind="$attrs"
          role="alertdialog"
          aria-modal="true"
          tabindex="-1"
          class="sb-alert-dialog"
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
  .sb-alert-dialog-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--sb-z-overlay);
    display: grid;
    place-items: center;
    padding: 1rem;
    background: var(--sb-overlay);
    overflow-y: auto;
  }

  .sb-alert-dialog {
    display: grid;
    gap: 0.5rem;
    width: 100%;
    max-width: 28rem;
    padding: 1.5rem;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-lg);
    background: var(--sb-background);
    color: var(--sb-foreground);
    box-shadow: var(--sb-shadow-lg);
    outline: none;
  }

  .sb-alert-dialog-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .sb-alert-dialog-description {
    margin: 0;
    color: var(--sb-muted-foreground);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .sb-alert-dialog-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .sb-alert-dialog-enter-active,
  .sb-alert-dialog-leave-active,
  .sb-alert-dialog-enter-active .sb-alert-dialog,
  .sb-alert-dialog-leave-active .sb-alert-dialog {
    transition:
      opacity var(--sb-duration) var(--sb-ease),
      transform var(--sb-duration) var(--sb-ease);
  }

  .sb-alert-dialog-enter-from,
  .sb-alert-dialog-leave-to {
    opacity: 0;
  }

  .sb-alert-dialog-enter-from .sb-alert-dialog,
  .sb-alert-dialog-leave-to .sb-alert-dialog {
    transform: scale(0.96);
  }
}
</style>
