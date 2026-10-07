<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { addDays, addMonths, formatDate, startOfMonth, today as currentDate, weekday } from '../calendar'
import type { CalendarEvent } from './types'

const props = withDefaults(
  defineProps<{
    events: readonly CalendarEvent[]
    /** Events listed per day before the rest are folded into "+2 more". */
    maxPerDay?: number
    /** Language for month and weekday names. Fixed by default so server and browser render the same text. */
    locale?: string
    /** First column of the grid: 0 for Sunday, 1 for Monday, and so on. */
    weekStartsOn?: number
  }>(),
  { maxPerDay: 3, locale: 'en-US', weekStartsOn: 0 },
)

const emit = defineEmits<{
  /** An event was pressed. */
  select: [event: CalendarEvent]
  /** A day's number, or its "+2 more", was pressed — the moment to show that day in full. */
  'select-date': [date: string]
}>()

/** The month on screen, as 'YYYY-MM'. Starts on the current month. */
const month = defineModel<string>('month')

// Filled in after mount: the server does not know what day it is for the visitor.
const today = ref<string>()
onMounted(() => {
  today.value = currentDate()
})

const first = computed(() => (month.value && /^\d{4}-\d{2}$/.test(month.value) ? `${month.value}-01` : startOfMonth(today.value ?? currentDate())))
const title = computed(() => formatDate(first.value, props.locale, { month: 'long', year: 'numeric' }))

const weeks = computed(() => {
  const offset = (weekday(first.value) - props.weekStartsOn + 7) % 7
  const start = addDays(first.value, -offset)
  // Only as many weeks as the month needs: five for most months, six for a few.
  const rows = Math.ceil((offset + Number(addDays(addMonths(first.value, 1), -1).slice(8))) / 7)
  return Array.from({ length: rows }, (_week, row) =>
    Array.from({ length: 7 }, (_day, column) => {
      const date = addDays(start, row * 7 + column)
      const events = props.events.filter((event) => event.start <= date && date <= (event.end ?? event.start))
      return {
        date,
        day: Number(date.slice(8)),
        label: formatDate(date, props.locale, { dateStyle: 'full' }),
        outside: startOfMonth(date) !== first.value,
        shown: events.slice(0, props.maxPerDay),
        more: Math.max(0, events.length - props.maxPerDay),
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

function go(months: number) {
  month.value = addMonths(first.value, months).slice(0, 7)
}

function goToday() {
  month.value = currentDate().slice(0, 7)
}

const color = (event: CalendarEvent) => `var(--sb-chart-${Math.max(1, Math.min(event.color ?? 1, 8))})`
</script>

<template>
  <div class="sb-event-calendar">
    <div class="sb-event-calendar-header">
      <h3 class="sb-event-calendar-title" aria-live="polite">{{ title }}</h3>
      <button type="button" class="sb-event-calendar-button" @click="goToday">Today</button>
      <button type="button" class="sb-event-calendar-button" data-icon aria-label="Previous month" @click="go(-1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <button type="button" class="sb-event-calendar-button" data-icon aria-label="Next month" @click="go(1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>

    <!-- A real table: screen readers announce the weekday with each day, and can move by row and column. -->
    <div class="sb-event-calendar-scroll">
      <table>
        <thead>
          <tr>
            <th v-for="(name, index) in weekdays" :key="index" scope="col" :abbr="name.long">{{ name.short }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, row) in weeks" :key="row">
            <td v-for="cell in week" :key="cell.date" :data-outside="cell.outside ? '' : undefined" :data-today="cell.date === today ? '' : undefined">
              <button type="button" class="sb-event-calendar-day" :aria-label="cell.label" :aria-current="cell.date === today ? 'date' : undefined" @click="emit('select-date', cell.date)">
                {{ cell.day }}
              </button>
              <ul v-if="cell.shown.length">
                <li v-for="event in cell.shown" :key="event.id">
                  <!-- The colour is a marker beside the title; the title itself stays in the text colour. -->
                  <button type="button" class="sb-event-calendar-event" :title="event.title" @click="emit('select', event)">
                    <span class="sb-event-calendar-dot" :style="{ background: color(event) }" />
                    <span>{{ event.title }}</span>
                  </button>
                </li>
              </ul>
              <button v-if="cell.more" type="button" class="sb-event-calendar-more" :aria-label="`${cell.more} more on ${cell.label}`" @click="emit('select-date', cell.date)">
                +{{ cell.more }} more
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
@layer components {
  .sb-event-calendar {
    display: grid;
    gap: 0.75rem;
    width: 100%;
    min-width: 0;
    font-size: 0.8125rem;
  }

  .sb-event-calendar-header {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .sb-event-calendar-title {
    flex: 1;
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .sb-event-calendar-button {
    display: inline-grid;
    place-items: center;
    height: 1.875rem;
    padding: 0 0.625rem;
    border: 1px solid var(--sb-input);
    border-radius: var(--sb-radius-md);
    background: var(--sb-input-background);
    color: var(--sb-foreground);
    font: inherit;
    font-weight: 500;
    cursor: pointer;
    transition: background-color var(--sb-duration);
  }

  .sb-event-calendar-button[data-icon] {
    width: 1.875rem;
    padding: 0;
  }

  .sb-event-calendar-button:hover {
    background: var(--sb-accent);
  }

  .sb-event-calendar-button svg {
    width: 1rem;
    height: 1rem;
  }

  .sb-event-calendar-scroll {
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-lg);
    overflow-x: auto;
  }

  .sb-event-calendar table {
    width: 100%;
    min-width: 36rem;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .sb-event-calendar th {
    height: 2rem;
    border-bottom: 1px solid var(--sb-border);
    color: var(--sb-muted-foreground);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .sb-event-calendar td {
    height: 6.25rem;
    padding: 0.25rem;
    border-top: 1px solid var(--sb-border);
    border-left: 1px solid var(--sb-border);
    vertical-align: top;
  }

  .sb-event-calendar tbody tr:first-child td {
    border-top: 0;
  }

  .sb-event-calendar td:first-child {
    border-left: 0;
  }

  .sb-event-calendar td[data-outside] {
    background: color-mix(in oklab, var(--sb-muted) 45%, transparent);
  }

  .sb-event-calendar td[data-outside] .sb-event-calendar-day {
    color: var(--sb-muted-foreground);
  }

  .sb-event-calendar-day {
    display: grid;
    place-items: center;
    min-width: 1.5rem;
    height: 1.5rem;
    margin-bottom: 0.125rem;
    padding: 0 0.25rem;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--sb-foreground);
    font: inherit;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
  }

  .sb-event-calendar-day:hover {
    background: var(--sb-accent);
  }

  .sb-event-calendar td[data-today] .sb-event-calendar-day {
    background: var(--sb-primary);
    color: var(--sb-primary-foreground);
    font-weight: 600;
  }

  .sb-event-calendar ul {
    display: grid;
    gap: 1px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .sb-event-calendar-event,
  .sb-event-calendar-more {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    width: 100%;
    min-width: 0;
    height: 1.25rem;
    padding: 0 0.25rem;
    border: 0;
    border-radius: var(--sb-radius-sm);
    background: transparent;
    color: var(--sb-foreground);
    font: inherit;
    font-size: 0.75rem;
    text-align: left;
    cursor: pointer;
  }

  .sb-event-calendar-event:hover,
  .sb-event-calendar-more:hover {
    background: var(--sb-accent);
  }

  .sb-event-calendar-event span:last-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sb-event-calendar-dot {
    flex-shrink: 0;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
  }

  .sb-event-calendar-more {
    color: var(--sb-muted-foreground);
  }

  .sb-event-calendar-button:focus-visible,
  .sb-event-calendar-day:focus-visible,
  .sb-event-calendar-event:focus-visible,
  .sb-event-calendar-more:focus-visible {
    outline: 2px solid var(--sb-ring);
    outline-offset: 1px;
  }
}
</style>
