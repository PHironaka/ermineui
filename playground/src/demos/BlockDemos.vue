<script setup lang="ts">
import { ref } from 'vue'
import { ForgotPassword } from '../../../registry/blocks/forgot-password'
import { MediaText } from '../../../registry/blocks/media-text'
import { NotFound } from '../../../registry/blocks/not-found'
import { OrderConfirmation } from '../../../registry/blocks/order-confirmation'
import { OrderHistory } from '../../../registry/blocks/order-history'
import { ProductDetail, type ProductSelection } from '../../../registry/blocks/product-detail'
import { ProductListing } from '../../../registry/blocks/product-listing'
import { SignUp } from '../../../registry/blocks/sign-up'
import Demo from '../Demo.vue'

// Product detail
const detailLoading = ref(false)
const detailSaved = ref(false)
const detailEvent = ref('nothing added yet')
function addToCart(selection: ProductSelection) {
  detailLoading.value = true
  setTimeout(() => {
    detailLoading.value = false
    detailEvent.value = `added ${selection.quantity} × ${selection.id} (${Object.values(selection.options).join(', ')})`
  }, 400)
}

// Product listing
const listingSaved = ref<string[]>([])
const listingEvent = ref('nothing added yet')

// Order history
const historyEvent = ref('nothing pressed')

// Sign up
const signUpLoading = ref(false)
const signUpError = ref<string>()
const signUpEvent = ref('not sent')
function signUp(values: { name: string; email: string }) {
  signUpError.value = undefined
  signUpLoading.value = true
  setTimeout(() => {
    signUpLoading.value = false
    // An address at taken.example stands in for one that already has an account.
    if (values.email.endsWith('@taken.example')) signUpError.value = 'There is already an account with that email.'
    else signUpEvent.value = `account made for ${values.name}`
  }, 600)
}

// Forgot password
const resetLoading = ref(false)
const resetSent = ref(false)
function sendReset() {
  resetLoading.value = true
  setTimeout(() => {
    resetLoading.value = false
    resetSent.value = true
  }, 500)
}

// Not found
const searched = ref('nothing searched')
</script>

<template>
  <Demo name="product-detail" title="Block: Product detail" description="A product's page: pictures, price, stock, options, quantity and “Add to cart”, then its details and reviews. Press a row of the rating summary to list only those reviews." wide>
    <div class="stack" style="max-width: 60rem">
      <ProductDetail v-model:saved="detailSaved" :loading="detailLoading" title-as="h3" @add-to-cart="addToCart" />
      <p class="readout">{{ detailEvent }} · saved: {{ detailSaved }}</p>
    </div>
  </Demo>

  <Demo name="product-listing" title="Block: Product listing" description="A grid of products with filters, a way to sort, a wishlist heart on each, and pages." wide>
    <div class="stack" style="max-width: 60rem">
      <ProductListing v-model:saved="listingSaved" title-as="h3" @add-to-cart="listingEvent = `added ${$event.title}`" />
      <p class="readout">{{ listingEvent }} · saved: {{ listingSaved.length }}</p>
    </div>
  </Demo>

  <Demo name="order-confirmation" title="Block: Order confirmation" description="The page after paying: a thank-you with the order number, where it has got to, where it is going, and what was bought." wide>
    <div class="stack" style="max-width: 60rem">
      <OrderConfirmation title-as="h3" track-href="#order-history" shop-href="#product-listing" />
    </div>
  </Demo>

  <Demo name="order-history" title="Block: Order history" description="Past orders, each with its status and what was in it. Orders still on their way show how far they have got.">
    <div class="stack" style="max-width: 32rem">
      <OrderHistory title-as="h3" @view="historyEvent = `view ${$event.number}`" @reorder="historyEvent = `buy again ${$event.number}`" />
      <p class="readout">{{ historyEvent }}</p>
    </div>
  </Demo>

  <Demo name="sign-up" title="Block: Sign up" description="Name, email and a password with a strength meter, and terms to agree to. An address at taken.example shows a server error.">
    <div class="stack" style="justify-items: center">
      <SignUp :loading="signUpLoading" :error="signUpError" terms-href="#sign-up" privacy-href="#sign-up" sign-in-href="#sign-in" @submit="signUp" />
      <p class="readout">{{ signUpEvent }}</p>
    </div>
  </Demo>

  <Demo name="forgot-password" title="Block: Forgot password" description="Asks for an email to send a reset link to, then says to check the inbox, whether or not the address has an account.">
    <ForgotPassword v-model:sent="resetSent" :loading="resetLoading" sign-in-href="#sign-in" @submit="sendReset" />
  </Demo>

  <Demo name="media-text" title="Block: Media and text" description="A headline, body copy and a picture, in three layouts: side by side (either way round), stacked, and three columns with the call to action on its own. Each stacks on a phone." wide>
    <div class="stack" style="max-width: 60rem; gap: 3rem">
      <MediaText title-as="h3" :primary-action="{ label: 'Shop the collection', href: '#product-listing' }" :secondary-action="{ label: 'How it is made', href: '#product-detail' }" />
      <MediaText
        reverse
        title-as="h3"
        eyebrow="In the studio"
        title="Small batches, one kiln"
        ratio="1"
        note=""
        :secondary-action="null"
        :primary-action="{ label: 'Meet the makers', href: '#product-detail' }"
      >
        <p>We fire on Tuesdays and Fridays. Whatever comes out of the kiln that week is what goes on sale.</p>
        <p>Seconds, with a wobble or a speck in the glaze, are sold at half price.</p>
      </MediaText>
      <MediaText layout="stacked" title-as="h3" eyebrow="New season" title="The autumn glazes are here" :secondary-action="null" :primary-action="{ label: 'See the colours', href: '#product-listing' }" />
      <MediaText
        layout="columns"
        title-as="h3"
        eyebrow="Gift cards"
        title="Not sure what they would pick?"
        body="Send a card by email in any amount from $20. It never runs out, and it can be spent in the shop or the studio."
        note="Arrives in minutes, or on the day you choose."
        :primary-action="{ label: 'Buy a gift card', href: '#cart' }"
        :secondary-action="{ label: 'Check a balance', href: '#cart' }"
      />
    </div>
  </Demo>

  <Demo name="not-found" title="Block: Not found" description="The page for a wrong address or an error: what happened in plain words, a search box, and the way home.">
    <div class="stack" style="max-width: 32rem">
      <NotFound title-as="h3" search home-href="#button" @search="searched = `searched for ${$event}`" />
      <p class="readout">{{ searched }}</p>
    </div>
  </Demo>
</template>
