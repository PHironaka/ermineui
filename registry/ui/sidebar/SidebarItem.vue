<script setup lang="ts">
import { ref, type Component } from 'vue'
import { Primitive } from '../../lib/primitive'
import { useSidebar } from './context'

defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    /** Tag or component for the link, e.g. NuxtLink. Attributes such as href or to are passed on to it. */
    as?: string | Component
    /** The page the reader is on now. */
    active?: boolean
  }>(),
  { as: 'a' },
)

const sidebar = useSidebar()
const label = ref<HTMLElement | null>(null)
</script>

<template>
  <li>
    <!-- Collapsed to icons, the name shows as a native tooltip on hover. -->
    <Primitive
      v-bind="$attrs"
      :as="as"
      class="er-sidebar-item"
      :aria-current="active ? 'page' : undefined"
      :title="sidebar.collapsed.value ? label?.textContent?.trim() : undefined"
      @click="sidebar.navigate()"
    >
      <slot name="icon" />
      <span ref="label" class="er-sidebar-item-label"><slot /></span>
    </Primitive>
  </li>
</template>
