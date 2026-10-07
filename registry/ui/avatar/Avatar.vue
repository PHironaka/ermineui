<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Image address. The slot (usually initials) shows until it loads, and stays if it fails. */
    src?: string
    /** Who this is, for screen readers. Leave out when the name is written next to the avatar. */
    alt?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)

const image = ref<HTMLImageElement | null>(null)
const loaded = ref(false)
const failed = ref(false)

watch(
  () => props.src,
  () => {
    loaded.value = false
    failed.value = false
  },
)

// A server-rendered image can finish loading before Vue is listening for it.
onMounted(() => {
  if (image.value?.complete) loaded.value = image.value.naturalWidth > 0
})
</script>

<template>
  <span class="er-avatar" :data-size="size" :role="alt ? 'img' : undefined" :aria-label="alt" :aria-hidden="alt ? undefined : true">
    <span v-if="!loaded" class="er-avatar-fallback"><slot /></span>
    <img
      v-if="src && !failed"
      ref="image"
      :src="src"
      alt=""
      :data-loaded="loaded ? '' : undefined"
      @load="loaded = true"
      @error="failed = true"
    />
  </span>
</template>

<style>
@layer components {
  .er-avatar {
    position: relative;
    display: inline-grid;
    flex-shrink: 0;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: var(--er-muted);
    color: var(--er-foreground);
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1;
    overflow: hidden;
    user-select: none;
  }

  .er-avatar[data-size='sm'] {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.6875rem;
  }

  .er-avatar[data-size='lg'] {
    width: 3.5rem;
    height: 3.5rem;
    font-size: 1.125rem;
  }

  .er-avatar img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
  }

  .er-avatar img[data-loaded] {
    opacity: 1;
  }
}
</style>
