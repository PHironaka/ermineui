<script setup lang="ts">
import { arrowTarget } from '../../lib/collection'
import { useTabs } from './context'

const tabs = useTabs()

function onKeydown(event: KeyboardEvent) {
  const list = event.currentTarget as HTMLElement
  const items = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)'))
  const next = arrowTarget(event, items, tabs.orientation.value)
  if (!next) return
  event.preventDefault()
  next.focus()
  next.click()
}
</script>

<template>
  <div role="tablist" class="sb-tabs-list" :aria-orientation="tabs.orientation.value" @keydown="onKeydown">
    <slot />
  </div>
</template>
