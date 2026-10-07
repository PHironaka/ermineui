<script setup lang="ts">
import type { Component } from 'vue'
import { Primitive } from '../../lib/primitive'
import { useNavigationMenu } from './context'

withDefaults(
  defineProps<{
    /** Tag or component for the link, e.g. NuxtLink. */
    as?: string | Component
    /** The page the reader is on now. */
    active?: boolean
    /** A second line under the link's name, for links inside a panel. */
    description?: string
  }>(),
  { as: 'a' },
)

const menu = useNavigationMenu()
</script>

<template>
  <Primitive :as="as" class="er-navigation-menu-link" :aria-current="active ? 'page' : undefined" @click="menu.close(true)">
    <span><slot /></span>
    <span v-if="description" class="er-navigation-menu-description">{{ description }}</span>
  </Primitive>
</template>
