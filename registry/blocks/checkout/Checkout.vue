<script setup lang="ts">
import { computed, reactive, useId, useSlots } from 'vue'
import { Alert, AlertDescription } from '../../ui/alert'
import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { CartLineItem } from '../../ui/cart-line-item'
import { Field, email, minLength, pattern, required, useValidation } from '../../ui/field'
import { Input } from '../../ui/input'
import { MaskedInput, masks } from '../../ui/masked-input'
import { OptionCard } from '../../ui/option-card'
import { OrderSummary } from '../../ui/order-summary'
import { formatMoney } from '../../ui/price'
import { RadioGroup } from '../../ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../ui/select'
import {
  sampleCheckoutItems,
  sampleCountries,
  sampleShippingMethods,
  type CheckoutItem,
  type CheckoutShippingMethod,
  type CheckoutValues,
} from './sample-data'

// Everything shown comes in through these props. The defaults are made-up data from sample-data.ts.
const props = withDefaults(
  defineProps<{
    items?: readonly CheckoutItem[]
    shippingMethods?: readonly CheckoutShippingMethod[]
    countries?: readonly string[]
    /** Money taken off, as a positive number. */
    discount?: number
    discountLabel?: string
    tax?: number
    currency?: string
    locale?: string
    /** Set while the order is being placed: the button shows a spinner and cannot be pressed twice. */
    loading?: boolean
    /** What went wrong on the server, e.g. "Your card was declined." */
    error?: string
    /** Heading level of the section titles. */
    titleAs?: string
  }>(),
  {
    items: () => sampleCheckoutItems,
    shippingMethods: () => sampleShippingMethods,
    countries: () => sampleCountries,
    currency: 'USD',
    locale: 'en-US',
    titleAs: 'h3',
  },
)

const emit = defineEmits<{
  /** The form passed its checks. Send these to your server. */
  submit: [values: CheckoutValues]
}>()

const slots = useSlots()
const id = useId()

const values = reactive({
  email: '',
  name: '',
  address: '',
  address2: '',
  city: '',
  region: '',
  postcode: '',
  country: '',
  shippingMethod: props.shippingMethods[0]?.id ?? '',
  cardName: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvc: '',
})

/** With the #payment slot, the card is your payment provider's business and its fields are not checked here. */
const ownCard = computed(() => !slots.payment)

const form = useValidation(values, {
  email: [required('Enter your email address.'), email()],
  name: [required('Enter your full name.')],
  address: [required('Enter your address.')],
  city: [required('Enter your town or city.')],
  postcode: [required('Enter your postcode.')],
  country: [required('Choose your country.')],
  cardName: [(value) => ownCard.value && required('Enter the name on the card.')(value)],
  cardNumber: [(value) => ownCard.value && (required('Enter the card number.')(value) || minLength(15, 'That card number is too short.')(value))],
  // Kept as four digits, month then year: 0927.
  cardExpiry: [(value) => ownCard.value && (required('Enter the expiry date.')(value) || pattern(/^(0[1-9]|1[0-2])\d\d$/, 'Enter the expiry date as month and year, such as 09/27.')(value))],
  cardCvc: [(value) => ownCard.value && (required('Enter the security code.')(value) || minLength(3, 'The security code has 3 or 4 digits.')(value))],
})

const subtotal = computed(() => props.items.reduce((sum, item) => sum + item.price * item.quantity, 0))
const shipping = computed(() => props.shippingMethods.find((method) => method.id === values.shippingMethod)?.price ?? 0)
const total = computed(() => Math.max(0, subtotal.value - (props.discount ?? 0) + shipping.value + (props.tax ?? 0)))
const money = (amount: number) => formatMoney(amount, props.currency, props.locale)

function submit() {
  if (!form.validate()) return
  const { cardName, cardNumber, cardExpiry, cardCvc, ...rest } = values
  emit('submit', ownCard.value ? { ...rest, card: { name: cardName, number: cardNumber, expiry: cardExpiry, cvc: cardCvc } } : rest)
}
</script>

<template>
  <div class="er-checkout">
    <div class="er-checkout-layout">
      <!-- novalidate: the messages come from the rules above, so they look and read the same in every browser. -->
      <form class="er-checkout-form" novalidate @submit.prevent="submit">
        <Alert v-if="error" variant="destructive">
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>

        <section class="er-checkout-section">
          <component :is="titleAs" class="er-checkout-title">Contact</component>
          <Field v-slot="{ control }" label="Email" hint="The receipt and delivery updates go here." required :error="form.errors.email">
            <Input v-bind="control" v-model="values.email" type="email" name="email" autocomplete="email" @blur="form.touch('email')" />
          </Field>
        </section>

        <section class="er-checkout-section">
          <component :is="titleAs" class="er-checkout-title">Delivery address</component>
          <Field v-slot="{ control }" label="Full name" required :error="form.errors.name">
            <Input v-bind="control" v-model="values.name" name="name" autocomplete="name" />
          </Field>
          <Field v-slot="{ control }" label="Address" required :error="form.errors.address">
            <Input v-bind="control" v-model="values.address" name="address" autocomplete="address-line1" />
          </Field>
          <Field v-slot="{ control }" label="Flat, suite or floor (optional)">
            <Input v-bind="control" v-model="values.address2" name="address2" autocomplete="address-line2" />
          </Field>
          <div class="er-checkout-row">
            <Field v-slot="{ control }" label="Town or city" required :error="form.errors.city">
              <Input v-bind="control" v-model="values.city" name="city" autocomplete="address-level2" />
            </Field>
            <Field v-slot="{ control }" label="State or region">
              <Input v-bind="control" v-model="values.region" name="region" autocomplete="address-level1" />
            </Field>
          </div>
          <div class="er-checkout-row">
            <Field v-slot="{ control }" label="Postcode" required :error="form.errors.postcode">
              <Input v-bind="control" v-model="values.postcode" name="postcode" autocomplete="postal-code" />
            </Field>
            <Field v-slot="{ control }" label="Country" required :error="form.errors.country">
              <Select v-model="values.country" name="country">
                <SelectTrigger v-bind="control" placeholder="Choose a country" />
                <SelectContent>
                  <SelectItem v-for="country in countries" :key="country" :value="country">{{ country }}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </section>

        <section class="er-checkout-section">
          <component :is="titleAs" :id="`${id}-delivery`" class="er-checkout-title">Delivery</component>
          <RadioGroup v-model="values.shippingMethod" name="shipping-method" :aria-labelledby="`${id}-delivery`">
            <OptionCard v-for="method in shippingMethods" :key="method.id" :value="method.id" :title="method.title" :description="method.description">
              <template #end>{{ method.price === 0 ? 'Free' : money(method.price) }}</template>
            </OptionCard>
          </RadioGroup>
        </section>

        <section class="er-checkout-section">
          <component :is="titleAs" class="er-checkout-title">Payment</component>
          <!-- For real payments, fill this slot with your payment provider's own card fields (Stripe Elements, Adyen
               and the like), so card numbers never pass through your pages or your server. The fields below are
               for prototypes and for providers that take the details from you. -->
          <slot name="payment">
            <Field v-slot="{ control }" label="Name on card" required :error="form.errors.cardName">
              <Input v-bind="control" v-model="values.cardName" name="cc-name" autocomplete="cc-name" />
            </Field>
            <Field v-slot="{ control }" label="Card number" required :error="form.errors.cardNumber">
              <MaskedInput v-bind="control" v-model="values.cardNumber" :mask="masks.card" name="cc-number" autocomplete="cc-number" placeholder="1234 1234 1234 1234" />
            </Field>
            <div class="er-checkout-row">
              <Field v-slot="{ control }" label="Expiry date" required :error="form.errors.cardExpiry">
                <MaskedInput v-bind="control" v-model="values.cardExpiry" :mask="masks.expiry" name="cc-exp" autocomplete="cc-exp" placeholder="MM/YY" />
              </Field>
              <Field v-slot="{ control }" label="Security code" required :error="form.errors.cardCvc">
                <MaskedInput v-bind="control" v-model="values.cardCvc" :mask="masks.cvc" name="cc-csc" autocomplete="cc-csc" placeholder="CVC" />
              </Field>
            </div>
          </slot>
        </section>

        <Button type="submit" size="lg" :loading="loading">{{ loading ? 'Placing order…' : `Pay ${money(total)}` }}</Button>
      </form>

      <Card class="er-checkout-summary">
        <CardHeader><CardTitle>Order summary</CardTitle></CardHeader>
        <CardContent>
          <OrderSummary :subtotal="subtotal" :discount="discount" :discount-label="discountLabel" :shipping="shipping" :tax="tax" :currency="currency" :locale="locale">
            <ul class="er-checkout-items">
              <li v-for="item in items" :key="item.id">
                <CartLineItem :title="item.title" :image="item.image" :options="item.options" :price="item.price" :quantity="item.quantity" :currency="currency" :locale="locale" readonly />
              </li>
            </ul>
          </OrderSummary>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style>
@layer components {
  .er-checkout {
    width: 100%;
    min-width: 0;
    /* Side by side once there is room for both; the block measures itself, not the screen. */
    container-type: inline-size;
  }

  .er-checkout-layout {
    display: grid;
    align-items: start;
    gap: 2rem;
  }

  .er-checkout-form {
    display: grid;
    gap: 2rem;
    min-width: 0;
  }

  .er-checkout-section {
    display: grid;
    gap: 1rem;
    min-width: 0;
  }

  .er-checkout-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5rem;
  }

  .er-checkout-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
    align-items: start;
    gap: 1rem;
  }

  .er-checkout-items {
    display: grid;
    gap: 1rem;
    margin: 0;
    padding: 0 0 1rem;
    border-bottom: 1px solid var(--er-border);
    list-style: none;
  }

  @container (min-width: 46rem) {
    .er-checkout-layout {
      grid-template-columns: minmax(0, 1fr) 21rem;
      gap: 2.5rem;
    }
  }
}
</style>
