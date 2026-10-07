<script setup lang="ts">
defineProps<{
  /** Registry name, as used in `sable add <name>`. */
  name: string
  title: string
  description: string
  /** Span both columns on wide screens. */
  wide?: boolean
}>()
</script>

<template>
  <section :id="name" class="demo" :data-wide="wide ? '' : undefined">
    <header class="demo-header">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
      <code>sable add {{ name }}</code>
    </header>
    <div class="demo-stage">
      <slot />
    </div>
  </section>
</template>
