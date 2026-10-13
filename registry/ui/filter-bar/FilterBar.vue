<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '../button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '../dropdown-menu'
import type { FilterBarFacet, FilterBarOption, FilterBarValue } from './types'

const props = withDefaults(
  defineProps<{
    facets: readonly FilterBarFacet[]
    /** Accessible name of the whole bar. */
    label?: string
  }>(),
  { label: 'Filters' },
)

/** For each facet key, the values that are ticked. Bind the same object to a DataTable's `filters`. */
const model = defineModel<FilterBarValue>({ default: () => ({}) })

const option = (item: string | FilterBarOption): FilterBarOption => (typeof item === 'string' ? { value: item } : item)
const chosen = (key: string) => model.value[key] ?? []

function toggle(key: string, value: string) {
  const current = chosen(key)
  model.value = { ...model.value, [key]: current.includes(value) ? current.filter((other) => other !== value) : [...current, value] }
}

/** Every ticked value, in the order of the facets, for the row of removable tags. */
const active = computed(() =>
  props.facets.flatMap((facet) =>
    facet.options
      .map(option)
      .filter((item) => chosen(facet.key).includes(item.value))
      .map((item) => ({ key: facet.key, value: item.value, text: `${facet.label}: ${item.label ?? item.value}` })),
  ),
)

function clear() {
  model.value = {}
}
</script>

<template>
  <div class="er-filter-bar" role="group" :aria-label="label">
    <div class="er-filter-bar-controls">
      <!-- Anything that belongs in the same row, such as a search field or a date range. -->
      <slot />
      <DropdownMenu v-for="facet in facets" :key="facet.key">
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            {{ facet.label }}
            <span v-if="chosen(facet.key).length" class="er-filter-bar-count">{{ chosen(facet.key).length }}<span class="er-filter-bar-hidden"> chosen</span></span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            v-for="item in facet.options.map(option)"
            :key="item.value"
            :model-value="chosen(facet.key).includes(item.value)"
            @update:model-value="toggle(facet.key, item.value)"
          >
            {{ item.label ?? item.value }}
            <span v-if="item.count !== undefined" class="er-filter-bar-tally">{{ item.count }}</span>
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button v-if="active.length" variant="ghost" size="sm" @click="clear">Clear all</Button>
    </div>
    <ul v-if="active.length" class="er-filter-bar-active" aria-label="Filters in use">
      <li v-for="chip in active" :key="`${chip.key}/${chip.value}`">
        {{ chip.text }}
        <button type="button" :aria-label="`Remove filter ${chip.text}`" @click="toggle(chip.key, chip.value)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<style>
@layer components {
  .er-filter-bar {
    display: grid;
    gap: 0.5rem;
    min-width: 0;
  }

  .er-filter-bar-controls,
  .er-filter-bar-active {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .er-filter-bar-count {
    display: inline-grid;
    place-items: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.25rem;
    border-radius: var(--er-radius-sm);
    background: var(--er-primary);
    color: var(--er-primary-foreground);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }

  .er-filter-bar-tally {
    margin-left: auto;
    padding-left: 1rem;
    color: var(--er-muted-foreground);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }

  .er-filter-bar-active {
    margin: 0;
    padding: 0;
    list-style: none;
    gap: 0.375rem;
  }

  .er-filter-bar-active li {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
    padding: 0.125rem 0.125rem 0.125rem 0.5rem;
    border-radius: var(--er-radius-sm);
    background: var(--er-secondary);
    color: var(--er-secondary-foreground);
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.25rem;
  }

  .er-filter-bar-active button {
    display: grid;
    place-items: center;
    width: 1.25rem;
    height: 1.25rem;
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-muted-foreground);
    cursor: pointer;
  }

  .er-filter-bar-active button:hover {
    background: color-mix(in oklab, var(--er-foreground) 10%, transparent);
    color: var(--er-foreground);
  }

  .er-filter-bar-active button:focus-visible {
    outline: 2px solid var(--er-ring);
  }

  .er-filter-bar-active svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  .er-filter-bar-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
