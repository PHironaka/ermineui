<script setup lang="ts">
import { computed, useId } from 'vue'
import { provideNavigationMenuItem, useNavigationMenu } from './context'

const menu = useNavigationMenu()
const id = useId()
const isOpen = computed(() => menu.openId.value === id)

provideNavigationMenuItem({ id, isOpen, triggerId: `${id}-trigger`, contentId: `${id}-content` })
</script>

<template>
  <li class="sb-navigation-menu-item" :data-state="isOpen ? 'open' : 'closed'">
    <slot :open="isOpen" />
  </li>
</template>
