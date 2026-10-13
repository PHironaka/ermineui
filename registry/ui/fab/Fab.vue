<script setup lang="ts">
import { ref, useId, useSlots } from 'vue'
import { useLayer } from '../../lib/layer'
import { provideFab } from './context'

withDefaults(
  defineProps<{
    /** What the button does: "New message". Its accessible name, and the words shown with `extended`. */
    label: string
    /** Show the label beside the icon, as a pill. */
    extended?: boolean
    /** Float over the page in a corner. Turn off to place it yourself. */
    fixed?: boolean
    position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  }>(),
  { fixed: true, position: 'bottom-right' },
)

const emit = defineEmits<{
  /** The button was pressed and it has no actions to open. */
  click: [event: MouseEvent]
}>()

/** Whether the stack of actions is showing. */
const open = defineModel<boolean>('open', { default: false })

const slots = useSlots()
const root = ref<HTMLElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const menuId = useId()

provideFab({ close: () => (open.value = false) })

useLayer(menu, open, {
  onDismiss: () => (open.value = false),
  ignore: () => [root.value],
  loopFocus: true,
})

function press(event: MouseEvent) {
  if (slots.actions) open.value = !open.value
  else emit('click', event)
}
</script>

<template>
  <div ref="root" class="er-fab" :data-fixed="fixed ? '' : undefined" :data-position="position" :data-state="open ? 'open' : 'closed'">
    <!-- FabAction, one per action. Filling this slot turns the button into one that opens them. -->
    <Transition name="er-fab-actions">
      <div v-if="$slots.actions && open" :id="menuId" ref="menu" class="er-fab-actions" role="group" :aria-label="label" tabindex="-1">
        <slot name="actions" />
      </div>
    </Transition>
    <button
      type="button"
      class="er-fab-button"
      :data-extended="extended ? '' : undefined"
      :aria-label="extended ? undefined : label"
      :aria-expanded="$slots.actions ? open : undefined"
      :aria-controls="$slots.actions && open ? menuId : undefined"
      @click="press"
    >
      <!-- The icon. A plus when left empty. -->
      <span class="er-fab-icon">
        <slot>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        </slot>
      </span>
      <span v-if="extended">{{ label }}</span>
    </button>
  </div>
</template>

<style>
@layer components {
  .er-fab {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
  }

  /* Clear of the home indicator and the rounded corners; raise --er-fab-offset to sit above a bottom nav. */
  .er-fab[data-fixed] {
    position: fixed;
    right: max(1rem, env(safe-area-inset-right));
    bottom: calc(max(1rem, env(safe-area-inset-bottom)) + var(--er-fab-offset, 0px));
    z-index: 20;
  }

  .er-fab[data-fixed][data-position='bottom-left'] {
    right: auto;
    left: max(1rem, env(safe-area-inset-left));
    align-items: flex-start;
  }

  .er-fab[data-fixed][data-position='bottom-center'] {
    right: auto;
    left: 50%;
    align-items: center;
    transform: translateX(-50%);
  }

  .er-fab[data-position='bottom-left'] {
    align-items: flex-start;
  }

  .er-fab[data-position='bottom-center'] {
    align-items: center;
  }

  .er-fab-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-width: 3.5rem;
    height: 3.5rem;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: var(--er-primary);
    color: var(--er-primary-foreground);
    box-shadow: var(--er-shadow-lg);
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      transform var(--er-duration);
  }

  .er-fab-button[data-extended] {
    padding: 0 1.25rem 0 1rem;
  }

  .er-fab-button:hover {
    background: color-mix(in oklab, var(--er-primary) 88%, var(--er-background));
  }

  .er-fab-button:active {
    transform: scale(0.96);
  }

  .er-fab-button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-fab-icon {
    display: grid;
    place-items: center;
    transition: transform 200ms var(--er-ease);
  }

  .er-fab-icon svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  /* Open: the plus turns into a cross, which is what pressing it again does. */
  .er-fab[data-state='open'] .er-fab-icon {
    transform: rotate(45deg);
  }

  .er-fab-actions {
    display: flex;
    flex-direction: column;
    align-items: inherit;
    gap: 0.5rem;
    outline: none;
  }

  .er-fab-action {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    height: 2.5rem;
    padding: 0 0.875rem;
    border: 1px solid var(--er-border);
    border-radius: 999px;
    background: var(--er-popover);
    color: var(--er-popover-foreground);
    box-shadow: var(--er-shadow-md);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color var(--er-duration);
  }

  .er-fab-action:hover {
    background: var(--er-accent);
  }

  .er-fab-action:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-fab-action svg {
    width: 1.125rem;
    height: 1.125rem;
  }

  .er-fab-actions-enter-active,
  .er-fab-actions-leave-active {
    transition:
      opacity var(--er-duration),
      transform 200ms var(--er-ease);
  }

  .er-fab-actions-enter-from,
  .er-fab-actions-leave-to {
    opacity: 0;
    transform: translateY(0.5rem);
  }

  @media (prefers-reduced-motion: reduce) {
    .er-fab-icon,
    .er-fab-button,
    .er-fab-actions-enter-active,
    .er-fab-actions-leave-active {
      transition: none;
    }
  }
}
</style>
