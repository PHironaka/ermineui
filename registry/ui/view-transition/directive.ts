import type { Directive } from 'vue'

/**
 * v-transition-name — marks an element as "the same thing" before and after a change, so that
 * viewTransition() glides it from its old place to its new one.
 *
 *   <li v-for="item in items" :key="item.id" v-transition-name="`item-${item.id}`">…</li>
 *
 * Each name must belong to only one element on the page at a time.
 */
const apply = (el: HTMLElement, name: string | undefined | null) => {
  // Names are CSS identifiers: anything else in them is replaced, so ids with dots or slashes still work.
  el.style.setProperty('view-transition-name', name ? `sb-${String(name).replace(/[^\w-]/g, '-')}` : 'none')
}

export const vTransitionName: Directive<HTMLElement, string | undefined | null> = {
  mounted: (el, binding) => apply(el, binding.value),
  updated: (el, binding) => apply(el, binding.value),
}
