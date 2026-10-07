<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { provideDropdownMenu } from '../dropdown-menu/context'
import { provideMenubarMenu, useMenubar } from './context'

const bar = useMenubar()
const id = useId()

const open = computed({
  get: () => bar.openId.value === id,
  set: (next: boolean) => {
    if (next) bar.openId.value = id
    else if (bar.openId.value === id) bar.openId.value = undefined
  },
})

// Each menu is a dropdown menu underneath, so the dropdown's items, groups and submenus all work inside it.
provideDropdownMenu({
  open,
  setOpen: (next) => {
    open.value = next
  },
  anchor: ref(null),
  focusFirst: ref(false),
  triggerId: `${id}-trigger`,
  contentId: `${id}-content`,
})
provideMenubarMenu({ id })
</script>

<template>
  <slot :open="open" />
</template>
