<script setup lang="ts">
import { ref } from 'vue'
import { Checkout } from '@registry/blocks/checkout'
import { Dashboard } from '@registry/blocks/dashboard'
import { ProductListing } from '@registry/blocks/product-listing'
import { SignIn } from '@registry/blocks/sign-in'
import { SegmentedControl, SegmentedControlItem } from '@registry/ui/segmented-control'

// The real blocks, as `ermine add` copies them, running on their sample data.
const views = [
  { value: 'dashboard', label: 'Dashboard', address: 'app.example.com' },
  { value: 'shop', label: 'Shop', address: 'shop.example.com/products' },
  { value: 'checkout', label: 'Checkout', address: 'shop.example.com/checkout' },
  { value: 'sign-in', label: 'Sign in', address: 'app.example.com/sign-in' },
]
const view = ref('dashboard')
const saved = ref<string[]>([])
</script>

<template>
  <div class="showcase">
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
        <ProductListing v-else-if="view === 'shop'" v-model:saved="saved" title-as="h2" />
        <Checkout v-else-if="view === 'checkout'" :tax="11.52" />
        <SignIn v-else forgot-href="#blocks" sign-up-href="#blocks" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.showcase {
  display: grid;
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
.window-body:not([data-view='dashboard']) {
  padding: clamp(1rem, 3vw, 2.5rem);
}
.window-body[data-view='sign-in'] {
  display: grid;
  place-items: center;
}
</style>
