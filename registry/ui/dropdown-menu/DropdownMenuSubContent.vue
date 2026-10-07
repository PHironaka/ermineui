<script setup lang="ts">
import { computed } from 'vue'
import { arrowTarget, createTypeahead } from '../../lib/collection'
import { useFloating } from '../../lib/floating'
import { useLayer } from '../../lib/layer'
import { Portal } from '../../lib/primitive'
import { menuItems, useDropdownMenu, useDropdownMenuSub } from './context'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Gap between the parent menu and this one, in px. */
    sideOffset?: number
    /** Lifts the submenu so its first item lines up with the item that opened it. */
    alignOffset?: number
  }>(),
  { sideOffset: 2, alignOffset: -5 },
)

const menu = useDropdownMenu()
const sub = useDropdownMenuSub()
const typeahead = createTypeahead()
const active = computed(() => sub.open.value && menu.open.value)

function closeToTrigger() {
  sub.setOpen(false)
  sub.anchor.value?.focus({ preventScroll: true })
}

useFloating(sub.anchor, sub.content, active, { side: 'right', align: 'start', sideOffset: props.sideOffset, alignOffset: props.alignOffset })
useLayer(sub.content, active, {
  ignore: () => [sub.anchor.value],
  // Escape steps back one level; a press elsewhere just closes this level and lets the press through.
  onDismiss: (reason) => (reason === 'escape' ? closeToTrigger() : sub.setOpen(false)),
  // Opened by hovering, focus stays on the trigger; opened from the keyboard, it moves to the first item.
  initialFocus: () => (sub.focusFirst.value ? (menuItems(sub.content.value)[0] ?? sub.content.value) : false),
  restoreFocus: false,
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Tab') {
    event.preventDefault()
    return
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    closeToTrigger()
    return
  }
  const list = menuItems(sub.content.value)
  const target = arrowTarget(event, list, 'vertical') ?? typeahead(event, list)
  if (!target) return
  event.preventDefault()
  target.focus()
}
</script>

<template>
  <Portal>
    <Transition name="er-pop">
      <div
        v-if="active"
        :id="sub.contentId"
        :ref="(el) => (sub.content.value = el as HTMLElement | null)"
        v-bind="$attrs"
        role="menu"
        tabindex="-1"
        class="er-floating er-menu"
        @keydown="onKeydown"
        @pointerenter="sub.cancelClose()"
        @focusin="sub.cancelClose()"
      >
        <slot />
      </div>
    </Transition>
  </Portal>
</template>
