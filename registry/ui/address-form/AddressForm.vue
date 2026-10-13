<script setup lang="ts">
import { Field, required, useValidation } from '../field'
import { Input } from '../input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../select'
import type { Address } from './address'

const props = defineProps<{
  /** The countries to choose from. With none, the country is typed in. */
  countries?: readonly string[]
  /** Which address this is, so a browser fills in the right one of its saved addresses. */
  kind?: 'shipping' | 'billing'
  /** Leave out the name, when it is asked for somewhere else. */
  hideName?: boolean
}>()

/** The address. Start from emptyAddress() in address.ts. */
const model = defineModel<Address>({ required: true })

const form = useValidation(() => model.value, {
  name: [(value) => !props.hideName && required('Enter your full name.')(value)],
  line1: [required('Enter your address.')],
  city: [required('Enter your town or city.')],
  postcode: [required('Enter your postcode.')],
  country: [required(props.countries?.length ? 'Choose your country.' : 'Enter your country.')],
})

function set(key: keyof Address, value: string | number | undefined) {
  model.value = { ...model.value, [key]: value === undefined ? '' : String(value) }
}

const token = (name: string) => (props.kind ? `${props.kind} ${name}` : name)

defineExpose({
  /** Check every field and show what is missing. True when the address can be used. Call it from your form's submit. */
  validate: () => form.validate(),
  /** Clear the messages without changing the answers. */
  reset: form.reset,
})
</script>

<template>
  <div class="er-address-form">
    <Field v-if="!hideName" v-slot="{ control }" label="Full name" required :error="form.errors.name">
      <Input v-bind="control" :model-value="model.name" name="name" :autocomplete="token('name')" @update:model-value="set('name', $event)" />
    </Field>
    <Field v-slot="{ control }" label="Address" required :error="form.errors.line1">
      <Input v-bind="control" :model-value="model.line1" name="address-line1" :autocomplete="token('address-line1')" @update:model-value="set('line1', $event)" />
    </Field>
    <Field v-slot="{ control }" label="Flat, suite or floor (optional)">
      <Input v-bind="control" :model-value="model.line2" name="address-line2" :autocomplete="token('address-line2')" @update:model-value="set('line2', $event)" />
    </Field>
    <div class="er-address-form-row">
      <Field v-slot="{ control }" label="Town or city" required :error="form.errors.city">
        <Input v-bind="control" :model-value="model.city" name="city" :autocomplete="token('address-level2')" @update:model-value="set('city', $event)" />
      </Field>
      <Field v-slot="{ control }" label="State or region">
        <Input v-bind="control" :model-value="model.region" name="region" :autocomplete="token('address-level1')" @update:model-value="set('region', $event)" />
      </Field>
    </div>
    <div class="er-address-form-row">
      <Field v-slot="{ control }" label="Postcode" required :error="form.errors.postcode">
        <Input v-bind="control" :model-value="model.postcode" name="postcode" :autocomplete="token('postal-code')" @update:model-value="set('postcode', $event)" />
      </Field>
      <Field v-slot="{ control }" label="Country" required :error="form.errors.country">
        <Select v-if="countries?.length" :model-value="model.country || undefined" name="country" @update:model-value="set('country', $event)">
          <SelectTrigger v-bind="control" placeholder="Choose a country" />
          <SelectContent>
            <SelectItem v-for="country in countries" :key="country" :value="country">{{ country }}</SelectItem>
          </SelectContent>
        </Select>
        <Input v-else v-bind="control" :model-value="model.country" name="country" :autocomplete="token('country-name')" @update:model-value="set('country', $event)" />
      </Field>
    </div>
  </div>
</template>

<style>
@layer components {
  .er-address-form {
    display: grid;
    gap: 1rem;
    min-width: 0;
  }

  /* Two side by side where there is room, one above the other where there is not. */
  .er-address-form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
    align-items: start;
    gap: 1rem;
  }
}
</style>
