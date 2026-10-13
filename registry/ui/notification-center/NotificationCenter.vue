<script setup lang="ts">
import { computed } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import type { Align, Side } from '../../lib/floating'
import type { NotificationItem } from './types'

withDefaults(
  defineProps<{
    /** Accessible name of the bell, and the heading of the list. */
    label?: string
    emptyLabel?: string
    markAllLabel?: string
    /** Where the list opens, relative to the bell. */
    side?: Side
    align?: Align
    /** The count stops here and shows a plus: "9+". */
    maxCount?: number
  }>(),
  { label: 'Notifications', emptyLabel: 'You are all caught up.', markAllLabel: 'Mark all as read', side: 'bottom', align: 'end', maxCount: 9 },
)

const emit = defineEmits<{
  /** A notification was pressed. It has already been marked as read. */
  select: [item: NotificationItem]
  /** "Mark all as read" was pressed. */
  readAll: []
}>()

const open = defineModel<boolean>('open', { default: false })
/** The notifications, newest first. Marking one as read replaces the list with a changed copy. */
const items = defineModel<NotificationItem[]>('items', { default: () => [] })

const unread = computed(() => items.value.filter((item) => !item.read).length)

function select(item: NotificationItem) {
  if (!item.read) items.value = items.value.map((other) => (other.id === item.id ? { ...other, read: true } : other))
  emit('select', { ...item, read: true })
  // A link takes the reader away; a button leaves them here, so the list is closed for them.
  if (!item.href) open.value = false
}

function readAll() {
  items.value = items.value.map((item) => ({ ...item, read: true }))
  emit('readAll')
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger class="er-notification-center-trigger" :aria-label="unread ? `${label}, ${unread} unread` : label">
      <!-- The icon. A bell when left empty. -->
      <slot name="icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16v-5a6 6 0 0 1 12 0v5l1.500 2h-15ZM10 21a2 2 0 0 0 4 0" /></svg>
      </slot>
      <span v-if="unread" class="er-notification-center-count" aria-hidden="true">{{ unread > maxCount ? `${maxCount}+` : unread }}</span>
    </PopoverTrigger>
    <PopoverContent :side="side" :align="align" class="er-notification-center" :aria-label="label">
      <div class="er-notification-center-header">
        <h2>{{ label }}</h2>
        <button v-if="unread" type="button" @click="readAll">{{ markAllLabel }}</button>
      </div>
      <!-- Shown when there is nothing to list. -->
      <p v-if="!items.length" class="er-notification-center-empty"><slot name="empty">{{ emptyLabel }}</slot></p>
      <ul v-else class="er-notification-center-list">
        <li v-for="item in items" :key="item.id">
          <component :is="item.href ? 'a' : 'button'" :href="item.href" :type="item.href ? undefined : 'button'" class="er-notification-center-item" :data-unread="item.read ? undefined : ''" @click="select(item)">
            <span class="er-notification-center-dot" aria-hidden="true" />
            <span class="er-notification-center-text">
              <span class="er-notification-center-title"><span v-if="!item.read" class="er-notification-center-hidden">Unread: </span>{{ item.title }}</span>
              <span v-if="item.body" class="er-notification-center-body">{{ item.body }}</span>
              <time v-if="item.time" :datetime="item.datetime">{{ item.time }}</time>
            </span>
          </component>
        </li>
      </ul>
      <!-- Under the list: a link to every notification, or to the settings. -->
      <div v-if="$slots.footer" class="er-notification-center-footer"><slot name="footer" /></div>
    </PopoverContent>
  </Popover>
</template>

<style>
@layer components {
  .er-notification-center-trigger {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-md);
    background: transparent;
    color: var(--er-foreground);
    cursor: pointer;
    transition: background-color var(--er-duration);
  }

  .er-notification-center-trigger:hover,
  .er-notification-center-trigger[data-state='open'] {
    background: var(--er-accent);
  }

  .er-notification-center-trigger:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-notification-center-trigger svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .er-notification-center-count {
    position: absolute;
    top: 0.125rem;
    right: 0.125rem;
    min-width: 1rem;
    height: 1rem;
    padding: 0 0.25rem;
    border-radius: 999px;
    background: var(--er-destructive);
    color: var(--er-destructive-foreground);
    font-size: 0.625rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1rem;
    text-align: center;
  }

  .er-floating.er-notification-center {
    display: flex;
    flex-direction: column;
    width: min(22rem, calc(100vw - 1.5rem));
    max-height: min(28rem, calc(100vh - 6rem));
    padding: 0;
    overflow: hidden;
  }

  .er-notification-center-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--er-border);
  }

  .er-notification-center-header h2 {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.25rem;
  }

  .er-notification-center-header button {
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-muted-foreground);
    font: inherit;
    font-size: 0.8125rem;
    cursor: pointer;
  }

  .er-notification-center-header button:hover {
    color: var(--er-foreground);
  }

  .er-notification-center-header button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-notification-center-empty {
    margin: 0;
    padding: 2rem 1rem;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    text-align: center;
  }

  .er-notification-center-list {
    flex: 1;
    min-height: 0;
    margin: 0;
    padding: 0;
    list-style: none;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .er-notification-center-list li + li {
    border-top: 1px solid var(--er-border);
  }

  .er-notification-center-item {
    display: flex;
    gap: 0.625rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border: 0;
    background: transparent;
    color: var(--er-foreground);
    font: inherit;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    transition: background-color var(--er-duration);
  }

  .er-notification-center-item:hover {
    background: var(--er-accent);
  }

  .er-notification-center-item:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: -2px;
  }

  /* Unread: a dot, and the title in a heavier weight. */
  .er-notification-center-dot {
    flex-shrink: 0;
    width: 0.5rem;
    height: 0.5rem;
    margin-top: 0.375rem;
    border-radius: 50%;
  }

  .er-notification-center-item[data-unread] .er-notification-center-dot {
    background: var(--er-info);
  }

  .er-notification-center-text {
    display: grid;
    gap: 0.125rem;
    min-width: 0;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .er-notification-center-item[data-unread] .er-notification-center-title {
    font-weight: 600;
  }

  .er-notification-center-body,
  .er-notification-center-text time {
    color: var(--er-muted-foreground);
  }

  .er-notification-center-text time {
    font-size: 0.75rem;
  }

  .er-notification-center-footer {
    padding: 0.625rem 1rem;
    border-top: 1px solid var(--er-border);
    font-size: 0.8125rem;
    text-align: center;
  }

  .er-notification-center-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
