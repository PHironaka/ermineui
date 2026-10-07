<script setup lang="ts">
import { computed } from 'vue'
import { iconPath, type IconName } from './icons'

const props = withDefaults(
  defineProps<{
    /** Which icon to draw: a built-in name, or one added with registerIcons(). */
    name?: IconName
    /** Draw this path instead of a named icon. It must fit a 24 by 24 grid. */
    d?: string
    /** What the icon means, for screen readers. Leave out when text beside the icon already says it. */
    label?: string
    /** Width and height: a number of px, or any CSS length. Defaults to the size of the text around it. */
    size?: number | string
    /** Thickness of the line, on the 24 by 24 grid. */
    strokeWidth?: number
  }>(),
  { strokeWidth: 2 },
)

const path = computed(() => props.d ?? (props.name ? iconPath(props.name) : undefined))
const length = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <!-- Without a label the icon is decoration and is hidden from screen readers. -->
  <svg
    class="er-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    :stroke-width="strokeWidth"
    :style="length ? { width: length, height: length } : undefined"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
    :data-icon="name"
  >
    <!-- The slot takes your own shapes, for an icon that is more than one path. -->
    <slot><path v-if="path" :d="path" /></slot>
  </svg>
</template>

<style>
@layer components {
  .er-icon {
    display: inline-block;
    flex-shrink: 0;
    width: 1em;
    height: 1em;
    vertical-align: -0.125em;
  }
}
</style>
