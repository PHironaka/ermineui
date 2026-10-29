<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { Cart, readCartLink, sampleCart, sampleProducts, type CartItem } from '@registry/blocks/cart'
import { Checkout } from '@registry/blocks/checkout'
import { Dashboard } from '@registry/blocks/dashboard'
import { Hero, sampleHeroImage } from '@registry/blocks/hero'
import { MediaText } from '@registry/blocks/media-text'
import { ProductListing } from '@registry/blocks/product-listing'
import { SignIn } from '@registry/blocks/sign-in'
import { SegmentedControl, SegmentedControlItem } from '@registry/ui/segmented-control'
// The same loop the playground plays, so the landing page shows a moving background without a second copy of the file.
import heroVideo from '../../../playground/src/assets/hero-sample.webm'

// The real blocks, as `ermine add` copies them, running on their sample data.
const views = [
  { value: 'dashboard', label: 'Dashboard', address: 'app.example.com' },
  { value: 'landing', label: 'Landing', address: 'studio.example.com' },
  { value: 'shop', label: 'Shop', address: 'shop.example.com/products' },
  { value: 'cart', label: 'Cart', address: 'shop.example.com/cart' },
  { value: 'checkout', label: 'Checkout', address: 'shop.example.com/checkout' },
  { value: 'sign-in', label: 'Sign in', address: 'app.example.com/sign-in' },
]
const view = ref('dashboard')
const saved = ref<string[]>([])
const cart = ref<CartItem[]>([...sampleCart])
const shared = ref(false)
const showcase = ref<HTMLElement>()

// A cart shared from here links back to this page; opening the link shows the same cart, looked up again in the
// sample catalogue.
onMounted(async () => {
  const link = readCartLink(window.location.href, (id) => sampleProducts.find((product) => product.id === id))
  if (!link) return
  cart.value = link.items
  shared.value = true
  view.value = 'cart'
  // Someone opening the link came for the cart, which is below the fold.
  await nextTick()
  showcase.value?.scrollIntoView({ block: 'start' })
})
</script>

<template>
  <div ref="showcase" class="showcase">
    <SegmentedControl v-model="view" label="Block to show">
      <SegmentedControlItem v-for="item in views" :key="item.value" :value="item.value">{{ item.label }}</SegmentedControlItem>
    </SegmentedControl>

    <div class="window">
      <div class="window-bar" aria-hidden="true">
        <span class="window-dots"><i /><i /><i /></span>
        <span class="window-address">{{ views.find((item) => item.value === view)?.address }}</span>
      </div>
      <div class="window-body" :data-view="view">
        <Dashboard v-if="view === 'dashboard'" main-as="div" title-as="h2" style="--er-dashboard-height: 42rem" />
        <template v-else-if="view === 'landing'">
          <!-- The window clips its corners, so the hero's scroll fade, which needs the page as its scroller, is off here. -->
          <Hero
            :video="{ src: [{ src: heroVideo, type: 'video/webm' }], poster: sampleHeroImage.src }"
            :secondary-action="null"
            :wash-on-scroll="false"
            :primary-action="{ label: 'Schedule a conversation', href: '#blocks' }"
            title-as="h2"
            style="--er-hero-height: 34rem"
          >
            <template #header>
              <nav class="landing-nav" aria-label="Field Studio">
                <a href="#blocks">Projects</a>
                <a href="#blocks">Journal</a>
                <a href="#blocks">About</a>
                <a href="#blocks">Contact</a>
              </nav>
            </template>
          </Hero>
          <div class="landing-section">
            <MediaText title-as="h3" :primary-action="{ label: 'See the work', href: '#blocks' }" :secondary-action="null" />
          </div>
        </template>
        <ProductListing v-else-if="view === 'shop'" v-model:saved="saved" title-as="h2" />
        <Cart v-else-if="view === 'cart'" v-model:items="cart" :title="shared ? 'Shared cart' : 'Your cart'" title-as="h2" :shipping="0" shareable share-url="/" shop-href="#blocks" />
        <Checkout v-else-if="view === 'checkout'" :tax="11.52" />
        <SignIn v-else forgot-href="#blocks" sign-up-href="#blocks" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing-nav {
  display: flex;
  justify-content: flex-end;
  gap: 1.25rem;
  font-size: 0.875rem;
}
.landing-nav a {
  color: inherit;
  text-decoration: none;
}
.landing-nav a:hover {
  text-decoration: underline;
  text-underline-offset: 0.25em;
}
.landing-section {
  padding: clamp(1.5rem, 5vw, 4rem) clamp(1rem, 4vw, 3rem);
}
/* One column no wider than the page: on a phone the six tabs scroll sideways instead of widening the window. */
.showcase > .er-segmented-control {
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}
.showcase {
  scroll-margin-top: calc(var(--site-nav-height) + 1rem);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
  gap: 1.5rem;
}
.window {
  width: 100%;
  border: 1px solid var(--er-border);
  border-radius: 1.25rem;
  background: var(--er-background);
  box-shadow:
    0 1px 2px rgb(0 0 0 / 6%),
    0 30px 80px -20px rgb(0 0 0 / 28%);
  overflow: hidden;
  text-align: start;
}
.window-bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--er-border);
  background: var(--er-muted);
}
.window-dots {
  display: flex;
  gap: 0.4rem;
}
.window-dots i {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: color-mix(in oklch, var(--er-foreground) 18%, transparent);
}
.window-address {
  padding: 0.2rem 1.5rem;
  border-radius: 0.5rem;
  background: var(--er-background);
  font-size: 0.75rem;
  color: var(--er-muted-foreground);
}
.window-body {
  min-height: 42rem;
}
.window-body:not([data-view='dashboard'], [data-view='landing']) {
  padding: clamp(1rem, 3vw, 2.5rem);
}
.window-body[data-view='sign-in'] {
  display: grid;
  place-items: center;
}
</style>
