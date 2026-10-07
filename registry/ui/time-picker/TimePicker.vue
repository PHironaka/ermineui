<script setup lang="ts">
import { computed } from 'vue'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../select'

// Attributes such as id and aria-invalid go to the button, so <Label for="..."> works.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Minutes between the times on offer. */
    step?: number
    /** Earliest and latest times on offer, as 'HH:MM' in 24-hour time. */
    min?: string
    max?: string
    /** Submit the value with a form under this name, as 'HH:MM'. */
    name?: string
    disabled?: boolean
    placeholder?: string
    /** Language for how times are written. Fixed by default so server and browser render the same text. */
    locale?: string
    /** Write times with am / pm. Defaults to what the locale uses. */
    hour12?: boolean
  }>(),
  { step: 30, min: '00:00', max: '23:59', placeholder: 'Pick a time', locale: 'en-US', hour12: undefined },
)

/** The time as 'HH:MM' in 24-hour time, the same as <input type="time">. */
const value = defineModel<string>()

const toMinutes = (time: string) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time)
  return match ? Number(match[1]) * 60 + Number(match[2]) : Number.NaN
}
const toTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const format = computed(() => new Intl.DateTimeFormat(props.locale, { hour: 'numeric', minute: '2-digit', hour12: props.hour12, timeZone: 'UTC' }))
const label = (time: string) => format.value.format(new Date(toMinutes(time) * 60_000))

const times = computed(() => {
  const start = Math.max(0, toMinutes(props.min) || 0)
  const end = Math.min(24 * 60 - 1, Number.isNaN(toMinutes(props.max)) ? 24 * 60 - 1 : toMinutes(props.max))
  const list: string[] = []
  for (let minutes = start; minutes <= end; minutes += Math.max(1, props.step)) list.push(toTime(minutes))
  // A value that is not on a step (set from saved data, say) still appears, in its place.
  if (value.value && !Number.isNaN(toMinutes(value.value)) && !list.includes(value.value)) list.push(value.value)
  return list.sort((a, b) => toMinutes(a) - toMinutes(b))
})
</script>

<template>
  <Select v-model="value" :name="name" :disabled="disabled">
    <SelectTrigger v-bind="$attrs" :placeholder="placeholder" class="er-time-picker" />
    <SelectContent>
      <SelectItem v-for="time in times" :key="time" :value="time">{{ label(time) }}</SelectItem>
    </SelectContent>
  </Select>
</template>

<style>
@layer components {
  .er-time-picker {
    font-variant-numeric: tabular-nums;
  }
}
</style>
