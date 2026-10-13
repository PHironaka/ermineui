/** Phone input — a country's calling code and a phone number as one international value, laid out the way that country writes its numbers. */
export { default as PhoneInput } from './PhoneInput.vue'
export { formatNational, parsePhone, phoneCountries, toE164, type PhoneCountry } from './phone'
