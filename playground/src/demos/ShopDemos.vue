<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '../../../registry/ui/button'
import { ComparisonTable, type ComparisonColumn, type ComparisonGroup } from '../../../registry/ui/comparison-table'
import { MiniCart, type MiniCartItem } from '../../../registry/ui/mini-cart'
import { OrderTracker } from '../../../registry/ui/order-tracker'
import { PricingTable, type PricingBilling, type PricingPlan } from '../../../registry/ui/pricing-table'
import { QuantityStepper } from '../../../registry/ui/quantity-stepper'
import { SegmentedControl, SegmentedControlItem } from '../../../registry/ui/segmented-control'
import { Separator } from '../../../registry/ui/separator'
import { ShippingMethod, type ShippingMethodOption } from '../../../registry/ui/shipping-method'
import { SizeGuide, findSize, type SizeGuideRow, type SizeUnit } from '../../../registry/ui/size-guide'
import { WishlistButton } from '../../../registry/ui/wishlist-button'
import Demo from '../Demo.vue'

// Stand-in pictures drawn as SVG, so the demos need no image files and no network.
const picture = (background: string, shape: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${background}"/><rect x="34" y="28" width="52" height="64" rx="10" fill="${shape}"/></svg>`,
  )}`

// Quantity stepper, wishlist button, segmented control
const quantity = ref(2)
const stepperRemoved = ref(false)
const wished = ref(false)
const view = ref('grid')

// Shipping method and order tracker
const shippingMethods: ShippingMethodOption[] = [
  { id: 'standard', title: 'Standard', eta: '3 to 5 working days', price: 0 },
  { id: 'express', title: 'Express', eta: '1 to 2 working days', price: 12 },
  { id: 'drone', title: 'Drone', eta: 'Not available in your area', price: 30, disabled: true },
]
const shipping = ref('standard')
const stage = ref(2)
const held = ref(false)

// Mini cart
const miniCartOpen = ref(false)
const freshMiniCart = (): MiniCartItem[] => [
  { id: 'mug-sand', title: 'Stoneware mug', options: 'Sand / 350 ml', price: 24, quantity: 2, image: picture('#efe7da', '#c9b79c') },
  { id: 'throw-moss', title: 'Wool throw', options: 'Moss', price: 96, compareAt: 120, quantity: 1, max: 3, image: picture('#dde5d6', '#6f8a5b') },
]
const miniCart = ref(freshMiniCart())
const miniCartEvent = ref('nothing yet')

// Comparison table
const compareColumns: ComparisonColumn[] = [
  { key: 'mug', title: 'Stoneware mug', subtitle: '$24' },
  { key: 'travel', title: 'Travel mug', subtitle: '$32', highlight: true },
  { key: 'espresso', title: 'Espresso cup', subtitle: '$16' },
]
const compareRows: ComparisonGroup[] = [
  {
    title: 'Size',
    rows: [
      { label: 'Holds', values: { mug: '350 ml', travel: '450 ml', espresso: '90 ml' } },
      { label: 'Weight', hint: 'Empty', values: { mug: '310 g', travel: '280 g', espresso: '120 g' } },
    ],
  },
  {
    title: 'Care',
    rows: [
      { label: 'Dishwasher safe', values: { mug: true, travel: true, espresso: true } },
      { label: 'Microwave safe', values: { mug: true, travel: false, espresso: true } },
      { label: 'Lid included', values: { mug: false, travel: true, espresso: false } },
    ],
  },
]
const compared = ref('nothing chosen')

// Pricing table
const plans: PricingPlan[] = [
  { id: 'hobby', name: 'Hobby', description: 'For side projects.', price: 0, features: ['3 projects', 'Community support', '1 GB bandwidth'], cta: 'Start free' },
  { id: 'pro', name: 'Pro', description: 'For teams that ship.', price: { monthly: 20, yearly: 16 }, features: ['Unlimited projects', 'Preview deployments', '100 GB bandwidth', 'Email support'], featured: true, badge: 'Most popular', cta: 'Choose' },
  { id: 'enterprise', name: 'Enterprise', description: 'For the whole company.', features: ['Single sign-on', 'Audit log', 'A named contact'], cta: 'Talk to sales' },
]
const billing = ref<PricingBilling>('monthly')
const planEvent = ref('nothing chosen')

// Size guide
const sizeMeasures = [
  { key: 'chest', label: 'Chest' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hips' },
]
const sizeRows: SizeGuideRow[] = [
  { size: 'S', measurements: { chest: [86, 91], waist: [71, 76], hips: [86, 91] } },
  { size: 'M', measurements: { chest: [96, 101], waist: [81, 86], hips: [96, 101] } },
  { size: 'L', measurements: { chest: [106, 111], waist: [91, 96], hips: [106, 111] } },
  { size: 'XL', measurements: { chest: [116, 121], waist: [101, 106], hips: [116, 121] } },
]
const sizeUnit = ref<SizeUnit>('cm')
</script>

<template>
  <Demo name="quantity-stepper" title="Quantity stepper, Wishlist button, Segmented control" description="A compact count whose minus turns into a bin at one, a heart that fills when something is saved, and one choice from a few in a single track.">
    <div class="stack">
      <div class="row">
        <QuantityStepper v-if="!stepperRemoved" v-model="quantity" :max="5" removable label="Quantity of Stoneware mug" remove-label="Remove Stoneware mug" @remove="stepperRemoved = true" />
        <Button v-else variant="outline" size="sm" @click="((stepperRemoved = false), (quantity = 1))">Put the mug back</Button>
        <QuantityStepper :model-value="1" size="sm" label="Quantity of Wool throw" />
      </div>
      <div class="row">
        <WishlistButton v-model="wished" label="Save Stoneware mug for later" />
        <WishlistButton v-model="wished" label="Save for later" show-label />
      </div>
      <div class="row">
        <SegmentedControl v-model="view" label="View">
          <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
          <SegmentedControlItem value="list">List</SegmentedControlItem>
          <SegmentedControlItem value="map" disabled>Map</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <p class="readout">quantity: {{ stepperRemoved ? 'removed' : quantity }} · saved: {{ wished }} · view: {{ view }}</p>
    </div>
  </Demo>

  <Demo name="shipping-method" title="Shipping method and Order tracker" description="Ways to deliver as cards to pick from, each with when it arrives and what it costs; and where a parcel has got to, as a line that fills.">
    <div class="stack">
      <ShippingMethod v-model="shipping" :methods="shippingMethods" />
      <Separator />
      <OrderTracker :current="stage" :problem="held" :stages="[{ label: 'Ordered', date: 'Oct 12' }, { label: 'Packed', date: 'Oct 13' }, 'Shipped', 'Delivered']">
        {{ held ? 'Held at the depot: the address needs checking.' : stage > 4 ? 'Delivered. Enjoy.' : 'Arriving Friday, October 16.' }}
      </OrderTracker>
      <div class="row">
        <Button variant="outline" size="sm" :disabled="stage > 4" @click="stage++">Next stage</Button>
        <Button variant="outline" size="sm" @click="((stage = 1), (held = false))">Start again</Button>
        <Button variant="outline" size="sm" :aria-pressed="held" @click="held = !held">Hold it up</Button>
      </div>
      <p class="readout">delivery: {{ shipping }} · stage: {{ stage }}</p>
    </div>
  </Demo>

  <Demo name="mini-cart" title="Mini cart" description="The cart as a panel from the side, opened from a button that carries the count. Take a quantity down to one and the minus becomes a bin.">
    <div class="stack">
      <div class="row">
        <MiniCart v-model:open="miniCartOpen" v-model:items="miniCart" cart-href="#cart" @checkout="((miniCartEvent = `checkout with ${$event.length} lines`), (miniCartOpen = false))">
          <template #trigger="{ count }">
            <Button variant="outline">Cart ({{ count }})</Button>
          </template>
        </MiniCart>
        <Button variant="ghost" size="sm" @click="miniCart = freshMiniCart()">Refill the cart</Button>
      </div>
      <p class="readout">{{ miniCartEvent }}</p>
    </div>
  </Demo>

  <Demo name="comparison-table" title="Comparison table" description="Products side by side, one row per property, with ticks for what each has. On a narrow screen it scrolls sideways under the row names." wide>
    <div class="stack" style="max-width: 44rem">
      <ComparisonTable :columns="compareColumns" :rows="compareRows" caption="Mugs compared">
        <template #footer="{ column }">
          <Button size="sm" :variant="column.highlight ? 'default' : 'outline'" @click="compared = `chose ${column.title}`">Choose<span class="sr-only"> {{ column.title }}</span></Button>
        </template>
      </ComparisonTable>
      <p class="readout">{{ compared }}</p>
    </div>
  </Demo>

  <Demo name="pricing-table" title="Pricing table" description="Plans with what each costs and includes. The switch changes every price at once; one plan is marked out." wide>
    <div class="stack" style="max-width: 56rem">
      <PricingTable v-model:billing="billing" :plans="plans" current="hobby" title-as="h3" @select="(plan, period) => (planEvent = `chose ${plan.name}, ${period}`)" />
      <p class="readout">{{ planEvent }} · billing: {{ billing }}</p>
    </div>
  </Demo>

  <Demo name="size-guide" title="Size guide" description="Measurements for each size, in centimetres or inches, with the chosen size marked.">
    <div class="stack">
      <SizeGuide v-model:unit="sizeUnit" :measures="sizeMeasures" :sizes="sizeRows" selected="M" caption="Shirt sizes" />
      <p class="readout">units: {{ sizeUnit }} · a 98 cm chest is size {{ findSize(sizeRows, 'chest', 98) }}</p>
    </div>
  </Demo>
</template>
