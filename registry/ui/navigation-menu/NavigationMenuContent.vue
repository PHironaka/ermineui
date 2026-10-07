<script setup lang="ts">
import { useNavigationMenu, useNavigationMenuItem } from './context'

withDefaults(
  defineProps<{
    /** Line the panel up with the start or the end of its button. Use "end" for items near the right edge. */
    align?: 'start' | 'end'
  }>(),
  { align: 'start' },
)

const menu = useNavigationMenu()
const item = useNavigationMenuItem()
</script>

<template>
  <Transition name="sb-pop">
    <div
      v-show="item.isOpen.value"
      :id="item.contentId"
      class="sb-navigation-menu-content"
      :aria-labelledby="item.triggerId"
      :data-align="align"
      @pointerenter="menu.cancelClose()"
      @pointerleave="menu.close()"
    >
      <slot />
    </div>
  </Transition>
</template>
