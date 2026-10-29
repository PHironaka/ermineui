<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'
import { addDays, addMonths, formatDate, parseDate, startOfMonth, today as currentDate, weekday } from './dates'

const props = withDefaults(
  defineProps<{
    /** Earliest date that can be chosen, as 'YYYY-MM-DD'. */
    min?: string
    /** Latest date that can be chosen, as 'YYYY-MM-DD'. */
    max?: string
    /** Return true for dates that cannot be chosen, such as weekends. */
    isDateDisabled?: (date: string) => boolean
    /** Highlight a span of days, for choosing a range. Both ends are 'YYYY-MM-DD'; the date range picker sets these. */
    rangeStart?: string
    rangeEnd?: string
    /** Language for month and weekday names. Fixed by default so server and browser render the same text. */
    locale?: string
    /** First column of the grid: 0 for Sunday, 1 for Monday, and so on. */
    weekStartsOn?: number
  }>(),
  { locale: 'en-US', weekStartsOn: 0 },
)

const emit = defineEmits<{
  /** A day was chosen — also fires when it is the day already selected. */
  select: [date: string]
  /** The pointer or keyboard focus is on a day — lets a range picker show the span before it is chosen. */
  preview: [date: string]
}>()

/** The chosen date as 'YYYY-MM-DD'. */
const value = defineModel<string>()

const grid = ref<HTMLElement | null>(null)
const titleId = useId()
// Filled in after mount: the server does not know what day it is for the visitor.
const today = ref<string>()

function clamp(date: string): string {
  if (props.min && date < props.min) return props.min
  if (props.max && date > props.max) return props.max
  return date
}

/** The one day Tab lands on. The month on screen is always the month this day is in. */
const focused = ref(clamp(parseDate(value.value) ? value.value! : currentDate()))
const month = computed(() => startOfMonth(focused.value))

watch(value, (next) => {
  if (parseDate(next)) focused.value = next!
})

onMounted(() => {
  today.value = currentDate()
})

const title = computed(() => formatDate(month.value, props.locale, { month: 'long', year: 'numeric' }))

/** Six weeks, always, so the calendar keeps its height from month to month. */
const weeks = computed(() => {
  const offset = (weekday(month.value) - props.weekStartsOn + 7) % 7
  const start = addDays(month.value, -offset)
  return Array.from({ length: 6 }, (_week, row) =>
    Array.from({ length: 7 }, (_day, column) => {
      const date = addDays(start, row * 7 + column)
      return {
        date,
        day: Number(date.slice(8)),
        label: formatDate(date, props.locale, { dateStyle: 'full' }),
        outside: startOfMonth(date) !== month.value,
        disabled: isDisabled(date),
        rangeStart: date === props.rangeStart,
        rangeEnd: date === props.rangeEnd,
        inRange: !!props.rangeStart && !!props.rangeEnd && date >= props.rangeStart && date <= props.rangeEnd,
      }
    }),
  )
})

const weekdays = computed(() =>
  (weeks.value[0] ?? []).map(({ date }) => ({
    short: formatDate(date, props.locale, { weekday: 'short' }),
    long: formatDate(date, props.locale, { weekday: 'long' }),
  })),
)

const canGoBack = computed(() => !props.min || month.value > startOfMonth(props.min))
const canGoForward = computed(() => !props.max || month.value < startOfMonth(props.max))

function isDisabled(date: string): boolean {
  if (props.min && date < props.min) return true
  if (props.max && date > props.max) return true
  return props.isDateDisabled?.(date) ?? false
}

function shiftMonth(months: number) {
  focused.value = clamp(addMonths(focused.value, months))
}

async function focusDate(date: string) {
  focused.value = clamp(date)
  await nextTick()
  grid.value?.querySelector<HTMLElement>(`[data-date="${focused.value}"]`)?.focus()
}

function choose(date: string) {
  if (isDisabled(date)) return
  value.value = date
  emit('select', date)
  // Choosing a day from the next or previous month redraws the grid; keep focus on that day.
  focusDate(date)
}

function onKeydown(event: KeyboardEvent) {
  const current = focused.value
  const column = (weekday(current) - props.weekStartsOn + 7) % 7
  let target: string

  switch (event.key) {
    case 'ArrowLeft':
      target = addDays(current, -1)
      break
    case 'ArrowRight':
      target = addDays(current, 1)
      break
    case 'ArrowUp':
      target = addDays(current, -7)
      break
    case 'ArrowDown':
      target = addDays(current, 7)
      break
    case 'Home':
      target = addDays(current, -column)
      break
    case 'End':
      target = addDays(current, 6 - column)
      break
    case 'PageUp':
      target = addMonths(current, event.shiftKey ? -12 : -1)
      break
    case 'PageDown':
      target = addMonths(current, event.shiftKey ? 12 : 1)
      break
    default:
      return
  }

  event.preventDefault()
  focusDate(target)
}
</script>

<template>
  <div class="er-calendar">
    <div class="er-calendar-header">
      <button type="button" class="er-calendar-nav" aria-label="Previous month" :disabled="!canGoBack" @click="shiftMonth(-1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <div :id="titleId" class="er-calendar-title" aria-live="polite">{{ title }}</div>
      <button type="button" class="er-calendar-nav" aria-label="Next month" :disabled="!canGoForward" @click="shiftMonth(1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>

    <table ref="grid" role="grid" class="er-calendar-grid" :aria-labelledby="titleId" @keydown="onKeydown">
      <thead>
        <tr>
          <th v-for="(name, index) in weekdays" :key="index" scope="col" :abbr="name.long">{{ name.short }}</th>
        </tr>
      </thead>
      <tbody>
        <!-- Keyed by position, not date, so cells are updated in place and focus survives a month change. -->
        <tr v-for="(week, row) in weeks" :key="row">
          <td v-for="(cell, column) in week" :key="column" role="gridcell" :aria-selected="cell.date === value || cell.inRange">
            <button
              type="button"
              class="er-calendar-day"
              :tabindex="cell.date === focused ? 0 : -1"
              :aria-label="cell.label"
              :aria-current="cell.date === today ? 'date' : undefined"
              :aria-disabled="cell.disabled || undefined"
              :data-date="cell.date"
              :data-selected="cell.date === value ? '' : undefined"
              :data-today="cell.date === today ? '' : undefined"
              :data-outside="cell.outside ? '' : undefined"
              :data-in-range="cell.inRange ? '' : undefined"
              :data-range-start="cell.rangeStart ? '' : undefined"
              :data-range-end="cell.rangeEnd ? '' : undefined"
              @click="choose(cell.date)"
              @pointerenter="emit('preview', cell.date)"
              @focus="emit('preview', cell.date)"
            >
              {{ cell.day }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
@layer components {
  .er-calendar {
    width: max-content;
    font-size: 0.875rem;
  }

  .er-calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .er-calendar-title {
    font-weight: var(--er-weight-medium);
  }

  .er-calendar-nav {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-sm);
    background: var(--er-input-background);
    color: var(--er-foreground);
    cursor: pointer;
    transition: background-color var(--er-duration);
  }

  .er-calendar-nav:hover {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-calendar-nav:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .er-calendar-nav svg {
    width: 1rem;
    height: 1rem;
  }

  .er-calendar-grid {
    border-collapse: collapse;
  }

  .er-calendar-grid th {
    width: 2.25rem;
    height: 2rem;
    padding: 0;
    color: var(--er-muted-foreground);
    font-size: 0.75rem;
    font-weight: 400;
  }

  .er-calendar-grid td {
    padding: 0;
  }

  .er-calendar-day {
    display: block;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-md);
    background: transparent;
    color: inherit;
    font: inherit;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      color var(--er-duration);
  }

  .er-calendar-day:hover {
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-calendar-nav:focus-visible,
  .er-calendar-day:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 1px;
  }

  .er-calendar-day[data-outside] {
    color: var(--er-muted-foreground);
  }

  .er-calendar-day[data-today] {
    box-shadow: inset 0 0 0 1px var(--er-input);
    font-weight: var(--er-weight-semibold);
  }

  /* A range is one continuous band: square where days join, rounded only at its two ends. */
  .er-calendar-day[data-in-range] {
    border-radius: 0;
    background: var(--er-accent);
    color: var(--er-accent-foreground);
  }

  .er-calendar-day[data-selected],
  .er-calendar-day[data-range-start],
  .er-calendar-day[data-range-end] {
    background: var(--er-primary);
    color: var(--er-primary-foreground);
    box-shadow: none;
  }

  .er-calendar-day[data-range-start] {
    border-radius: var(--er-radius-md) 0 0 var(--er-radius-md);
  }

  .er-calendar-day[data-range-end] {
    border-radius: 0 var(--er-radius-md) var(--er-radius-md) 0;
  }

  .er-calendar-day[data-range-start][data-range-end] {
    border-radius: var(--er-radius-md);
  }

  .er-calendar-day[aria-disabled='true'] {
    background: transparent;
    color: var(--er-muted-foreground);
    opacity: 0.45;
    cursor: not-allowed;
  }
}
</style>
