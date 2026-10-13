<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '../../ui/button'
import { SearchInput } from '../../ui/input-group'

withDefaults(
  defineProps<{
    /** The status, shown large: "404", "500", or a word such as "Offline". */
    code?: string
    title?: string
    description?: string
    /** Where the main button goes. */
    homeHref?: string
    homeLabel?: string
    /** Show a search box, for finding what the address was meant to lead to. */
    search?: boolean
    searchLabel?: string
    /** Show a "Try again" button, which emits `retry`: for an error that may pass, rather than a wrong address. */
    retry?: boolean
    /** Heading level of the title. A page of its own wants h1. */
    titleAs?: string
  }>(),
  {
    code: '404',
    title: 'Page not found',
    description: 'The page you were looking for has moved, or never existed. Check the address, or try one of these.',
    homeHref: '/',
    homeLabel: 'Back to home',
    searchLabel: 'Search the site',
    titleAs: 'h1',
  },
)

const emit = defineEmits<{
  /** Something was searched for. Send the reader to your search page. */
  search: [query: string]
  /** "Try again" was pressed. Reload, or retry what failed. */
  retry: []
}>()

const query = ref('')
</script>

<template>
  <section class="er-not-found">
    <!-- The number is decoration: the title says the same thing in words. -->
    <p class="er-not-found-code" aria-hidden="true">{{ code }}</p>
    <component :is="titleAs" class="er-not-found-title">{{ title }}</component>
    <p v-if="description" class="er-not-found-description">{{ description }}</p>

    <form v-if="search" class="er-not-found-search" role="search" @submit.prevent="query.trim() && emit('search', query.trim())">
      <SearchInput v-model="query" :aria-label="searchLabel" :placeholder="searchLabel" />
      <Button type="submit" variant="outline">Search</Button>
    </form>

    <div class="er-not-found-actions">
      <Button as="a" :href="homeHref">{{ homeLabel }}</Button>
      <Button v-if="retry" variant="outline" @click="emit('retry')">Try again</Button>
      <!-- More ways on: links to the places people most often want. -->
      <slot />
    </div>
  </section>
</template>

<style>
@layer components {
  .er-not-found {
    display: grid;
    justify-items: center;
    gap: 0.75rem;
    width: 100%;
    max-width: 32rem;
    margin-inline: auto;
    padding-block: 2rem;
    text-align: center;
  }

  .er-not-found-code {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: clamp(4rem, 22cqi, 7rem);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.04em;
    line-height: 1;
  }

  .er-not-found-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 650;
    letter-spacing: -0.01em;
    line-height: 2rem;
    text-wrap: balance;
  }

  .er-not-found-description {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.9375rem;
    line-height: 1.5;
    text-wrap: pretty;
  }

  .er-not-found-search {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    max-width: 24rem;
    margin-top: 0.5rem;
    text-align: left;
  }

  .er-not-found-search .er-search-input {
    flex: 1;
    min-width: 0;
  }

  .er-not-found-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
}
</style>
