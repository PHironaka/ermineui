<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Button } from '../../ui/button'
import { EmptyState } from '../../ui/empty-state'
import { FilterBar, facetOptions, type FilterBarFacet, type FilterBarValue } from '../../ui/filter-bar'
import { Pagination } from '../../ui/pagination'
import { ProductCard } from '../../ui/product-card'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../ui/select'
import { WishlistButton } from '../../ui/wishlist-button'
import { sampleProducts, type ListingProduct, type ListingSort } from './sample-data'

// Everything shown comes in through these props. The defaults are made-up products from sample-data.ts.
const props = withDefaults(
  defineProps<{
    products?: readonly ListingProduct[]
    title?: string
    currency?: string
    locale?: string
    /** How many products make a page. */
    pageSize?: number
    /** Heading level of the title. Product names are one level below it. */
    titleAs?: 'h1' | 'h2' | 'h3'
  }>(),
  { products: () => sampleProducts, title: 'All products', currency: 'USD', locale: 'en-US', pageSize: 6, titleAs: 'h2' },
)

const emit = defineEmits<{
  /** "Add to cart" was pressed on a product. */
  addToCart: [product: ListingProduct]
}>()

/** The ids of the products on the reader's wishlist. */
const saved = defineModel<string[]>('saved', { default: () => [] })
/** For each filter, the values that are ticked. */
const filters = defineModel<FilterBarValue>('filters', { default: () => ({}) })
const sort = defineModel<ListingSort>('sort', { default: 'featured' })
const page = defineModel<number>('page', { default: 1 })

const heading = ref<HTMLElement | null>(null)

// The filters are whatever brands and categories the products have, each with how many there are.
const facets = computed<FilterBarFacet[]>(() => [
  { key: 'brand', label: 'Brand', options: facetOptions(props.products, 'brand') },
  { key: 'category', label: 'Category', options: facetOptions(props.products, 'category') },
])

const filtered = computed(() =>
  props.products.filter((product) => facets.value.every((facet) => !filters.value[facet.key]?.length || filters.value[facet.key]!.includes(product[facet.key as 'brand' | 'category']))),
)

const sorted = computed(() => {
  const list = [...filtered.value]
  if (sort.value === 'price-asc') list.sort((a, b) => a.price - b.price)
  else if (sort.value === 'price-desc') list.sort((a, b) => b.price - a.price)
  else if (sort.value === 'rating') list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  return list
})

const pageCount = computed(() => Math.max(1, Math.ceil(sorted.value.length / props.pageSize)))
const shown = computed(() => sorted.value.slice((page.value - 1) * props.pageSize, page.value * props.pageSize))
const productHeading = computed(() => `h${Number(props.titleAs[1]) + 1}`)

// A different set of products starts again from its first page.
watch([filters, sort], () => {
  page.value = 1
})

function toggleSaved(id: string, on: boolean) {
  saved.value = on ? [...saved.value, id] : saved.value.filter((other) => other !== id)
}

async function goTo(next: number) {
  page.value = next
  // The products have all changed: back to the top of the list, with focus on its heading so reading starts there.
  await nextTick()
  heading.value?.focus({ preventScroll: true })
  heading.value?.scrollIntoView({ block: 'nearest' })
}
</script>

<template>
  <section class="er-product-listing">
    <div class="er-product-listing-header">
      <component :is="titleAs" ref="heading" class="er-product-listing-title" tabindex="-1">{{ title }}</component>
      <!-- Announced when filters change, so a screen reader user hears that the list is different. -->
      <p class="er-product-listing-count" role="status">{{ sorted.length }} {{ sorted.length === 1 ? 'product' : 'products' }}</p>
    </div>

    <div class="er-product-listing-toolbar">
      <FilterBar v-model="filters" :facets="facets" />
      <Select v-model="sort">
        <SelectTrigger class="er-product-listing-sort" aria-label="Sort by" />
        <SelectContent>
          <SelectItem value="featured">Featured</SelectItem>
          <SelectItem value="price-asc">Price: low to high</SelectItem>
          <SelectItem value="price-desc">Price: high to low</SelectItem>
          <SelectItem value="rating">Top rated</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <EmptyState v-if="!sorted.length" title="Nothing matches those filters" description="Try taking one off.">
      <Button variant="outline" @click="filters = {}">Clear filters</Button>
    </EmptyState>

    <ul v-else class="er-product-listing-grid">
      <li v-for="product in shown" :key="product.id">
        <ProductCard
          :title="product.title"
          :href="product.href"
          :image="product.image"
          :brand="product.brand"
          :price="product.price"
          :compare-at="product.compareAt"
          :rating="product.rating"
          :reviews="product.reviews"
          :badge="product.badge"
          :currency="currency"
          :locale="locale"
          :title-as="productHeading"
        >
          <template #action>
            <WishlistButton :model-value="saved.includes(product.id)" size="sm" :label="`Save ${product.title} for later`" @update:model-value="toggleSaved(product.id, $event)" />
          </template>
          <Button variant="outline" size="sm" @click="emit('addToCart', product)">Add<span class="er-product-listing-hidden"> {{ product.title }}</span> to cart</Button>
        </ProductCard>
      </li>
    </ul>

    <Pagination v-if="pageCount > 1" :model-value="page" :page-count="pageCount" class="er-product-listing-pages" @update:model-value="goTo" />
  </section>
</template>

<style>
@layer components {
  .er-product-listing {
    display: grid;
    gap: 1.25rem;
    width: 100%;
    min-width: 0;
  }

  .er-product-listing-header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.25rem 0.75rem;
  }

  .er-product-listing-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.75rem;
    outline: none;
    /* Clear of a bar stuck to the top of the page when the list is scrolled back to. */
    scroll-margin-top: 5rem;
  }

  .er-product-listing-count {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
  }

  .er-product-listing-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .er-product-listing-toolbar .er-product-listing-sort {
    width: auto;
    min-width: 11rem;
  }

  .er-product-listing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 11rem), 1fr));
    gap: 2rem 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .er-product-listing-pages {
    justify-self: center;
  }

  .er-product-listing-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
