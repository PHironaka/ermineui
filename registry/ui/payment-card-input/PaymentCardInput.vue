<script setup lang="ts">
import { computed } from 'vue'
import { Field, required, useValidation } from '../field'
import { Input } from '../input'
import { InputGroup } from '../input-group'
import { MaskedInput, masks } from '../masked-input'
import { cardBrand, expiryState, passesLuhn, type PaymentCard } from './card'

// These fields are for prototypes and for payment providers that take card details from you. Where your
// provider has its own card fields (Stripe Elements, Adyen and the like), use those instead: card numbers
// then never pass through your pages or your server, which is what keeps you out of most of PCI DSS.

const props = defineProps<{
  /** Leave out the name, when it is asked for somewhere else. */
  hideName?: boolean
}>()

/** The card. Start from emptyCard() in card.ts. */
const model = defineModel<PaymentCard>({ required: true })

const brand = computed(() => cardBrand(model.value.number))
const amex = computed(() => brand.value === 'American Express')

const form = useValidation(() => model.value, {
  name: [(value) => !props.hideName && required('Enter the name on the card.')(value)],
  number: [required('Enter the card number.'), (value) => !passesLuhn(value) && 'Check the card number: a digit is missing or mistyped.'],
  expiry: [
    required('Enter the expiry date.'),
    (value) => expiryState(value) === 'malformed' && 'Enter the expiry date as month and year, such as 09/27.',
    (value) => expiryState(value) === 'expired' && 'This card has expired.',
  ],
  cvc: [required('Enter the security code.'), (value) => value.length < (amex.value ? 4 : 3) && `The security code has ${amex.value ? 4 : 3} digits.`],
})

function set(key: keyof PaymentCard, value: string | number | undefined) {
  model.value = { ...model.value, [key]: value === undefined ? '' : String(value) }
}

defineExpose({
  /** Check every field and show what is wrong. True when the card can be sent. Call it from your form's submit. */
  validate: () => form.validate(),
  /** Clear the messages without changing the answers. */
  reset: form.reset,
})
</script>

<template>
  <div class="er-payment-card-input">
    <Field v-if="!hideName" v-slot="{ control }" label="Name on card" required :error="form.errors.name">
      <Input v-bind="control" :model-value="model.name" name="cc-name" autocomplete="cc-name" @update:model-value="set('name', $event)" />
    </Field>
    <Field v-slot="{ control }" label="Card number" required :error="form.errors.number">
      <InputGroup>
        <MaskedInput
          v-bind="control"
          :model-value="model.number"
          :mask="amex ? masks.amex : masks.card"
          name="cc-number"
          autocomplete="cc-number"
          placeholder="1234 1234 1234 1234"
          @update:model-value="set('number', $event)"
          @blur="model.number && form.touch('number')"
        />
        <!-- Which network the number belongs to, once enough of it is typed to tell. -->
        <template v-if="brand" #suffix><span class="er-payment-card-input-brand">{{ brand }}</span></template>
      </InputGroup>
    </Field>
    <div class="er-payment-card-input-row">
      <Field v-slot="{ control }" label="Expiry date" required :error="form.errors.expiry">
        <MaskedInput v-bind="control" :model-value="model.expiry" :mask="masks.expiry" name="cc-exp" autocomplete="cc-exp" placeholder="MM/YY" @update:model-value="set('expiry', $event)" />
      </Field>
      <Field v-slot="{ control }" label="Security code" required :error="form.errors.cvc" :hint="amex ? 'Four digits on the front of the card.' : undefined">
        <MaskedInput v-bind="control" :model-value="model.cvc" :mask="amex ? '####' : '###'" name="cc-csc" autocomplete="cc-csc" placeholder="CVC" @update:model-value="set('cvc', $event)" />
      </Field>
    </div>
  </div>
</template>

<style>
@layer components {
  .er-payment-card-input {
    display: grid;
    gap: 1rem;
    min-width: 0;
  }

  .er-payment-card-input-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
    align-items: start;
    gap: 1rem;
  }

  .er-payment-card-input-brand {
    font-size: 0.75rem;
    font-weight: 500;
  }
}
</style>
