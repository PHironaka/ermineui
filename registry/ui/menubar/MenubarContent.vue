<script setup lang="ts">
import { DropdownMenuContent } from '../dropdown-menu'
import { useMenubar, useMenubarMenu } from './context'

const bar = useMenubar()
const { id } = useMenubarMenu()

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
  // Right on a submenu's trigger opens that submenu; anywhere else it moves to the next menu in the bar.
  if (event.key === 'ArrowRight' && (event.target as HTMLElement).getAttribute('aria-haspopup') === 'menu') return
  event.preventDefault()
  bar.move(id, event.key === 'ArrowRight' ? 1 : -1, true)
}
</script>

<template>
  <DropdownMenuContent side="bottom" align="start" :side-offset="6" @keydown="onKeydown">
    <slot />
  </DropdownMenuContent>
</template>
