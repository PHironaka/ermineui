<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DatePicker } from '../date-picker'
import { TimePicker } from '../time-picker'

// Attributes such as id and aria-invalid go to the date button, the first of the two controls.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Submit the value with a form under this name, as 'YYYY-MM-DDTHH:MM'. */
    name?: string
    disabled?: boolean
    /** Earliest and latest dates that can be chosen, as 'YYYY-MM-DD'. */
    min?: string
    max?: string
    /** Minutes between the times on offer. */
    step?: number
    locale?: string
    /** Accessible name of the pair. */
    label?: string
  }>(),
  { step: 30, locale: 'en-US', label: 'Date and time' },
)

/** 'YYYY-MM-DDTHH:MM' with no time zone, the same as <input type="datetime-local">. Unset until both parts are chosen. */
const value = defineModel<string>()

// The two halves are kept separately, so choosing a date first (or a time first) is not lost while the other is empty.
const date = ref<string>()
const time = ref<string>()

watch(
  value,
  (next) => {
    const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(next ?? '')
    if (match) [date.value, time.value] = [match[1], match[2]]
    else if (!next) [date.value, time.value] = [undefined, undefined]
  },
  { immediate: true },
)

const combined = computed(() => (date.value && time.value ? `${date.value}T${time.value}` : undefined))
watch(combined, (next) => {
  if (next !== value.value && (next !== undefined || value.value)) value.value = next
})
</script>

<template>
  <div role="group" class="sb-date-time-picker" :aria-label="props.label">
    <DatePicker v-bind="$attrs" v-model="date" :min="min" :max="max" :locale="locale" :disabled="disabled" />
    <TimePicker v-model="time" :step="step" :locale="locale" :disabled="disabled" aria-label="Time" />
    <input v-if="name" type="hidden" :name="name" :value="value ?? ''" :disabled="disabled" />
  </div>
</template>

<style>
@layer components {
  .sb-date-time-picker {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: 0.5rem;
    width: 100%;
  }
}
</style>
