<script setup lang="ts">
import { ref } from 'vue'
import { useFloating, type Align, type Side } from '../../lib/floating'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { usePopover } from './context'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    side?: Side
    align?: Align
    /** Gap between trigger and popover, in px. */
    sideOffset?: number
    alignOffset?: number
  }>(),
  { side: 'bottom', align: 'center', sideOffset: 6, alignOffset: 0 },
)

const popover = usePopover()
const content = ref<HTMLElement | null>(null)

useFloating(popover.anchor, content, popover.open, props)
useLayer(content, popover.open, {
  loopFocus: true,
  ignore: () => [popover.anchor.value],
  onDismiss: () => popover.setOpen(false),
})
</script>

<template>
  <Portal>
    <Transition name="sb-pop">
      <div
        v-if="popover.open.value"
        :id="popover.contentId"
        ref="content"
        v-bind="$attrs"
        role="dialog"
        tabindex="-1"
        class="sb-floating sb-popover"
      >
        <slot :close="() => popover.setOpen(false)" />
      </div>
    </Transition>
  </Portal>
</template>

<style>
@layer components {
  .sb-popover {
    width: 18rem;
    padding: 1rem;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-md);
    background: var(--sb-popover);
    color: var(--sb-popover-foreground);
    font-size: 0.875rem;
    box-shadow: var(--sb-shadow-md);
  }
}
</style>
