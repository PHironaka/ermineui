<script setup lang="ts">
// The colour theme menu in the site's top bar: a base and an accent laid over the whole site, and remembered.
// The themes' CSS is in the page already (Layout.astro), keyed to data-base and data-accent on <html>.
import { computed, onMounted, ref, watch } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '@registry/ui/popover'
import { Swatch, SwatchGroup } from '@registry/ui/swatch'
import type { ThemeEntry } from '../data/catalog'

const props = defineProps<{ themes: ThemeEntry[] }>()

const bases = computed(() => props.themes.filter((theme) => theme.kind === 'base'))
const accents = computed(() => props.themes.filter((theme) => theme.kind === 'accent'))
const base = ref('neutral')
const accent = ref('mono')
const command = computed(() => `npx ermineui theme ${base.value}${accent.value === 'mono' ? '' : ` ${accent.value}`}`)

onMounted(() => {
  const root = document.documentElement
  base.value = root.dataset.base ?? 'neutral'
  accent.value = root.dataset.accent ?? 'mono'
  watch([base, accent], ([nextBase, nextAccent]) => {
    if (nextBase === 'neutral') delete root.dataset.base
    else root.dataset.base = nextBase
    if (nextAccent === 'mono') delete root.dataset.accent
    else root.dataset.accent = nextAccent
    try {
      localStorage.setItem('ermine-colour-theme', `${nextBase},${nextAccent}`)
    } catch {}
  })
})
</script>

<template>
  <Popover>
    <PopoverTrigger class="nav-theme" aria-label="Colour theme">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 22a10 10 0 1 1 10-10c0 2.5-2 4-4.5 4H15a2 2 0 0 0-1.5 3.3A1.6 1.6 0 0 1 12 22Z" />
        <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
        <circle cx="10.5" cy="6.5" r="1" fill="currentColor" />
        <circle cx="15.5" cy="7" r="1" fill="currentColor" />
      </svg>
    </PopoverTrigger>
    <PopoverContent align="end" class="site-theme">
      <p class="site-theme-title">Colour theme</p>
      <p class="site-theme-label">Base</p>
      <SwatchGroup v-model="base" label="Base colours">
        <Swatch v-for="theme in bases" :key="theme.name" :value="theme.name" :color="theme.dot" :label="theme.title" />
      </SwatchGroup>
      <p class="site-theme-label">Accent</p>
      <SwatchGroup v-model="accent" label="Accent colour">
        <Swatch value="mono" color="var(--er-foreground)" label="Mono (no accent)" />
        <Swatch v-for="theme in accents" :key="theme.name" :value="theme.name" :color="theme.dot" :label="theme.title" />
      </SwatchGroup>
      <code class="site-theme-command">{{ command }}</code>
      <a class="site-theme-link" href="/themes/">How to use a theme</a>
    </PopoverContent>
  </Popover>
</template>

<style>
.site-theme {
  display: grid;
  gap: 0.5rem;
  width: min(17rem, calc(100vw - 2rem));
}
.site-theme-title {
  margin: 0;
  font-weight: 600;
}
.site-theme-label {
  margin: 0.25rem 0 0;
  color: var(--er-muted-foreground);
  font-size: 0.8125rem;
}
.site-theme-command {
  margin-top: 0.25rem;
  padding: 0.375rem 0.5rem;
  border-radius: var(--er-radius-sm);
  background: var(--er-muted);
  font-family: var(--er-font-mono);
  font-size: 0.75rem;
}
.site-theme-link {
  font-size: 0.8125rem;
  color: var(--er-primary);
}
</style>
