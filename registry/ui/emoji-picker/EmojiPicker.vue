<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { emojiCategories, searchEmoji, type Emoji, type EmojiCategory } from './emoji'

const props = withDefaults(
  defineProps<{
    categories?: readonly EmojiCategory[]
    /** Accessible name of the whole picker. */
    label?: string
    searchLabel?: string
    /** What to say when the search finds nothing. */
    emptyLabel?: string
    /** How many of the emoji last chosen to keep at the top. 0 keeps none. */
    recentCount?: number
  }>(),
  { categories: () => emojiCategories, label: 'Emoji', searchLabel: 'Search emoji', emptyLabel: 'No emoji found.', recentCount: 16 },
)

const emit = defineEmits<{
  /** An emoji was chosen. */
  select: [emoji: string, name: string]
}>()

/** The emoji chosen lately, newest first. Bind it and keep it in storage to remember them between visits. */
const recent = defineModel<string[]>('recent', { default: () => [] })

const id = useId()
const query = ref('')
const grid = ref<HTMLElement | null>(null)
/** The one emoji that can be tabbed to; the arrow keys move it. */
const stop = ref<string>()

const byChar = computed(() => new Map(props.categories.flatMap((category) => category.emoji).map((emoji) => [emoji.char, emoji])))
const groups = computed<EmojiCategory[]>(() => {
  if (query.value.trim()) return [{ name: 'Results', emoji: searchEmoji(query.value, props.categories) }]
  const used = recent.value.map((char) => byChar.value.get(char)).filter((emoji): emoji is Emoji => Boolean(emoji))
  return [...(used.length ? [{ name: 'Recent', emoji: used }] : []), ...props.categories]
})
const found = computed(() => groups.value.reduce((sum, group) => sum + group.emoji.length, 0))
const key = (group: EmojiCategory, emoji: Emoji) => `${group.name}:${emoji.char}`
const firstKey = computed(() => (groups.value[0]?.emoji[0] ? key(groups.value[0], groups.value[0].emoji[0]) : undefined))

// A new search, or a new set of groups, puts the tab stop back on the first emoji.
watch(groups, () => {
  stop.value = undefined
})

function choose(emoji: Emoji) {
  if (props.recentCount > 0) recent.value = [emoji.char, ...recent.value.filter((char) => char !== emoji.char)].slice(0, props.recentCount)
  emit('select', emoji.char, emoji.name)
}

function onKeydown(event: KeyboardEvent) {
  const buttons = Array.from(grid.value?.querySelectorAll<HTMLElement>('.er-emoji-picker-emoji') ?? [])
  const index = buttons.indexOf(event.target as HTMLElement)
  if (index === -1) return
  let next = index
  if (event.key === 'ArrowRight') next = index + 1
  else if (event.key === 'ArrowLeft') next = index - 1
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = buttons.length - 1
  else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    // Up and down go to whichever emoji in the next row sits closest to straight above or below, even across groups.
    const from = buttons[index].getBoundingClientRect()
    const direction = event.key === 'ArrowDown' ? 1 : -1
    let rowTop: number | undefined
    let best = index
    let bestGap = Infinity
    for (let other = index + direction; other >= 0 && other < buttons.length; other += direction) {
      const box = buttons[other].getBoundingClientRect()
      if (Math.abs(box.top - from.top) < 2) continue
      rowTop ??= box.top
      if (Math.abs(box.top - rowTop) > 2) break
      const gap = Math.abs(box.left - from.left)
      if (gap < bestGap) [best, bestGap] = [other, gap]
    }
    next = best
  } else return
  event.preventDefault()
  const target = buttons[Math.max(0, Math.min(next, buttons.length - 1))]
  stop.value = target.dataset.key
  void nextTick(() => target.focus())
}

function jump(name: string) {
  query.value = ''
  void nextTick(() => {
    const heading = grid.value?.querySelector<HTMLElement>(`[data-group="${CSS.escape(name)}"]`)
    // Scrolled inside the picker only: scrollIntoView would also move the page.
    if (heading && grid.value) grid.value.scrollTop = heading.offsetTop - grid.value.offsetTop
    heading?.parentElement?.querySelector<HTMLElement>('.er-emoji-picker-emoji')?.focus({ preventScroll: true })
  })
}
</script>

<template>
  <div class="er-emoji-picker" role="group" :aria-label="label">
    <input v-model="query" class="er-emoji-picker-search" type="search" :placeholder="searchLabel" :aria-label="searchLabel" autocomplete="off" />
    <nav v-if="!query.trim()" class="er-emoji-picker-nav" aria-label="Emoji groups">
      <button v-for="category in categories" :key="category.name" type="button" :aria-label="category.name" :title="category.name" @click="jump(category.name)">
        <span aria-hidden="true">{{ category.emoji[0]?.char }}</span>
      </button>
    </nav>
    <p class="er-emoji-picker-status" role="status">{{ query.trim() ? (found ? `${found} found` : emptyLabel) : '' }}</p>
    <div ref="grid" class="er-emoji-picker-scroll" @keydown="onKeydown">
      <section v-for="group in groups" :key="group.name" :aria-labelledby="`${id}-${group.name}`">
        <h3 :id="`${id}-${group.name}`" class="er-emoji-picker-heading" :data-group="group.name">{{ group.name }}</h3>
        <p v-if="!group.emoji.length" class="er-emoji-picker-empty">{{ emptyLabel }}</p>
        <div class="er-emoji-picker-grid">
          <button
            v-for="emoji in group.emoji"
            :key="emoji.char"
            type="button"
            class="er-emoji-picker-emoji"
            :data-key="key(group, emoji)"
            :tabindex="(stop ?? firstKey) === key(group, emoji) ? 0 : -1"
            :aria-label="emoji.name"
            :title="emoji.name"
            @click="choose(emoji)"
            @focus="stop = key(group, emoji)"
          >
            <span aria-hidden="true">{{ emoji.char }}</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
@layer components {
  .er-emoji-picker {
    display: grid;
    gap: 0.5rem;
    width: 100%;
    max-width: 20rem;
    padding: 0.625rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
    background: var(--er-popover);
    color: var(--er-popover-foreground);
  }

  .er-emoji-picker-search {
    width: 100%;
    height: 2.25rem;
    padding: 0 0.75rem;
    border: 1px solid var(--er-input);
    border-radius: var(--er-radius-md);
    background: var(--er-input-background);
    color: var(--er-foreground);
    font: inherit;
    /* 16px stops iOS from zooming the page when the field is focused. */
    font-size: 1rem;
  }

  @media (min-width: 48rem) {
    .er-emoji-picker-search {
      font-size: 0.875rem;
    }
  }

  .er-emoji-picker-search::placeholder {
    color: var(--er-muted-foreground);
  }

  .er-emoji-picker-search:focus-visible {
    border-color: var(--er-ring);
    outline: 2px solid color-mix(in oklab, var(--er-ring) 45%, transparent);
  }

  .er-emoji-picker-nav {
    display: flex;
    justify-content: space-between;
    gap: 0.125rem;
  }

  .er-emoji-picker-nav button,
  .er-emoji-picker-emoji {
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    font: inherit;
    line-height: 1;
    cursor: pointer;
    transition: background-color var(--er-duration);
  }

  .er-emoji-picker-nav button {
    flex: 1;
    height: 1.75rem;
    font-size: 1rem;
    /* Greyed, so the row reads as a set of labels rather than a ninth group of emoji. */
    filter: grayscale(1);
    opacity: 0.7;
  }

  .er-emoji-picker-nav button:hover,
  .er-emoji-picker-emoji:hover {
    background: var(--er-accent);
  }

  .er-emoji-picker-nav button:hover {
    filter: none;
    opacity: 1;
  }

  .er-emoji-picker-nav button:focus-visible,
  .er-emoji-picker-emoji:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: -1px;
  }

  .er-emoji-picker-status {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .er-emoji-picker-scroll {
    position: relative;
    height: 15rem;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .er-emoji-picker-heading {
    position: sticky;
    top: 0;
    z-index: 1;
    margin: 0;
    padding: 0.25rem 0.125rem;
    background: var(--er-popover);
    color: var(--er-muted-foreground);
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1rem;
  }

  .er-emoji-picker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(2.125rem, 1fr));
  }

  .er-emoji-picker-emoji {
    aspect-ratio: 1;
    font-size: 1.375rem;
  }

  .er-emoji-picker-empty {
    margin: 0;
    padding: 1rem 0.125rem;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
  }
}
</style>
