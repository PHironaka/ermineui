<script setup lang="ts">
import { ref } from 'vue'
import { useFloating, type Align, type Side } from '../../lib/floating'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { useHoverCard } from './context'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    side?: Side
    align?: Align
    /** Gap between trigger and card, in px. */
    sideOffset?: number
  }>(),
  { side: 'bottom', align: 'center', sideOffset: 6 },
)

const card = useHoverCard()
const content = ref<HTMLElement | null>(null)

useFloating(card.anchor, content, card.open, props)
useLayer(content, card.open, {
  ignore: () => [card.anchor.value],
  onDismiss: () => card.hide(true),
  // It appears on its own, so it must not pull focus away from wherever the reader is.
  initialFocus: () => false,
  restoreFocus: false,
})
</script>

<template>
  <Portal>
    <Transition name="er-pop">
      <div
        v-if="card.open.value"
        ref="content"
        v-bind="$attrs"
        class="er-floating er-hover-card"
        @pointerenter="card.show()"
        @pointerleave="card.hide()"
        @focusin="card.show()"
        @focusout="card.hide()"
      >
        <slot />
      </div>
    </Transition>
  </Portal>
</template>

<style>
@layer components {
  .er-hover-card {
    width: 18rem;
    padding: 1rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-md);
    background: var(--er-popover);
    color: var(--er-popover-foreground);
    font-size: 0.875rem;
    box-shadow: var(--er-shadow-md);
  }
}
</style>
