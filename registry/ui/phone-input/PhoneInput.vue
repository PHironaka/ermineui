<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatNational, parsePhone, phoneCountries, toE164, type PhoneCountry } from './phone'

// The wrapper is only a frame; id, name, aria-invalid and the rest belong on the number field.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    countries?: readonly PhoneCountry[]
    /** The country to start on, as a two-letter code, when the value does not already say. */
    defaultCountry?: string
    /** Accessible name of the country menu. */
    countryLabel?: string
    disabled?: boolean
  }>(),
  { countries: () => phoneCountries, defaultCountry: 'US', countryLabel: 'Country calling code' },
)

/** The whole number in international form: "+15550100199". Empty until a digit is typed. */
const model = defineModel<string>({ default: '' })

const byCode = (code: string) => props.countries.find((country) => country.code === code)

const country = ref<PhoneCountry>(parsePhone(model.value, props.countries, props.defaultCountry).country ?? byCode(props.defaultCountry) ?? props.countries[0])
const national = ref(parsePhone(model.value, props.countries).national)

// A value set from outside (a saved number arriving) is taken apart again; one that came from typing here already matches.
watch(model, (value) => {
  if (value === toE164(country.value, national.value)) return
  const parsed = parsePhone(value, props.countries, country.value.code)
  if (parsed.country) country.value = parsed.country
  national.value = parsed.national
})

const shown = computed(() => formatNational(national.value, country.value.format))

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  // A whole international number pasted in: take the country from it.
  const pasted = input.value.trim().startsWith('+') ? parsePhone(input.value, props.countries, country.value.code) : undefined
  if (pasted?.country) country.value = pasted.country
  national.value = pasted?.country ? pasted.national : input.value.replace(/\D/g, '')
  model.value = toE164(country.value, national.value)
  input.value = shown.value
}

function onCountry(event: Event) {
  country.value = byCode((event.target as HTMLSelectElement).value) ?? country.value
  model.value = toE164(country.value, national.value)
}
</script>

<template>
  <div class="er-phone-input" :data-disabled="disabled ? '' : undefined">
    <!-- A real select laid invisibly over the code, so the phone's own picker opens and nothing has to be rebuilt. -->
    <label class="er-phone-input-country">
      <span aria-hidden="true">{{ country.code }} +{{ country.dial }}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      <select :value="country.code" :aria-label="countryLabel" :disabled="disabled" autocomplete="tel-country-code" @change="onCountry">
        <option v-for="item in countries" :key="item.code" :value="item.code">{{ item.name }} (+{{ item.dial }})</option>
      </select>
    </label>
    <input v-bind="$attrs" :value="shown" type="tel" inputmode="tel" autocomplete="tel-national" :disabled="disabled" @input="onInput" />
  </div>
</template>

<style>
@layer components {
  .er-phone-input {
    display: flex;
    width: 100%;
    height: 2.25rem;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-md);
    background: var(--er-input-background);
    box-shadow: var(--er-shadow-xs);
    transition:
      border-color var(--er-duration),
      outline-color var(--er-duration);
  }

  .er-phone-input:has(input:focus-visible) {
    border-color: var(--er-ring);
    outline: 2px solid color-mix(in oklab, var(--er-ring) 45%, transparent);
    outline-offset: 0;
  }

  .er-phone-input:has(input[aria-invalid='true']) {
    border-color: var(--er-destructive);
  }

  .er-phone-input[data-disabled] {
    opacity: 0.5;
  }

  .er-phone-input-country {
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.25rem;
    padding: 0 0.5rem 0 0.75rem;
    border-right: 1px solid var(--er-input);
    border-radius: calc(var(--er-radius-md) - 1px) 0 0 calc(var(--er-radius-md) - 1px);
    color: var(--er-foreground);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .er-phone-input-country:hover {
    background: var(--er-accent);
  }

  .er-phone-input-country:has(select:focus-visible) {
    outline: 2px solid var(--er-ring);
    outline-offset: -2px;
  }

  .er-phone-input-country svg {
    width: 0.875rem;
    height: 0.875rem;
    color: var(--er-muted-foreground);
  }

  .er-phone-input-country select {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    /* 16px stops iOS from zooming the page when the menu is opened. */
    font-size: 1rem;
    opacity: 0;
    cursor: pointer;
  }

  .er-phone-input input {
    flex: 1;
    min-width: 0;
    padding: 0 0.75rem;
    border: 0;
    background: transparent;
    color: var(--er-foreground);
    font-family: inherit;
    font-size: 1rem;
    font-variant-numeric: tabular-nums;
    outline: none;
  }

  @media (min-width: 48rem) {
    .er-phone-input input {
      font-size: 0.875rem;
    }
  }

  .er-phone-input input::placeholder {
    color: var(--er-muted-foreground);
  }
}
</style>
