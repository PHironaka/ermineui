<script setup lang="ts">
import { ref } from 'vue'
import { useFloating, type Align, type Side } from '../../lib/floating'
import { Portal } from '../../lib/primitive'
import { useTooltip } from './context'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    side?: Side
    align?: Align
    /** Gap between trigger and tooltip, in px. */
    sideOffset?: number
  }>(),
  { side: 'top', align: 'center', sideOffset: 6 },
)

const tooltip = useTooltip()
const content = ref<HTMLElement | null>(null)

useFloating(tooltip.anchor, content, tooltip.open, props)
</script>

<template>
  <Portal>
    <Transition name="sb-pop">
      <div
        v-if="tooltip.open.value"
        :id="tooltip.contentId"
        ref="content"
        v-bind="$attrs"
        role="tooltip"
        class="sb-floating sb-tooltip"
        @pointerenter="tooltip.show(true)"
        @pointerleave="tooltip.hide()"
      >
        <slot />
      </div>
    </Transition>
  </Portal>
</template>

<style>
@layer components {
  .sb-tooltip {
    max-width: min(20rem, calc(100vw - 1rem));
    padding: 0.375rem 0.75rem;
    border-radius: var(--sb-radius-md);
    background: var(--sb-primary);
    color: var(--sb-primary-foreground);
    font-size: 0.75rem;
    line-height: 1.35;
    text-wrap: balance;
  }
}
</style>
