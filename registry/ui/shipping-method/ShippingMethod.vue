<script setup lang="ts">
import { OptionCard } from '../option-card'
import { formatMoney } from '../price'
import { RadioGroup } from '../radio-group'
import type { ShippingMethodOption } from './types'

withDefaults(
  defineProps<{
    methods: readonly ShippingMethodOption[]
    /** Accessible name of the group. */
    label?: string
    /** Submit the choice with a form under this name. */
    name?: string
    currency?: string
    locale?: string
    /** What a price of zero is written as. */
    freeLabel?: string
    disabled?: boolean
  }>(),
  { label: 'Delivery method', currency: 'USD', locale: 'en-US', freeLabel: 'Free' },
)

/** The id of the chosen method. */
const method = defineModel<string>()
</script>

<template>
  <RadioGroup v-model="method" class="er-shipping-method" :name="name" :disabled="disabled" :aria-label="label">
    <OptionCard v-for="option in methods" :key="option.id" :value="option.id" :title="option.title" :description="option.eta" :disabled="option.disabled">
      <template #end>{{ option.price > 0 ? formatMoney(option.price, currency, locale) : freeLabel }}</template>
    </OptionCard>
  </RadioGroup>
</template>
