import type { Directive } from 'vue'

/**
 * v-reveal — fades an element in the first time it scrolls into view.
 *
 *   <section v-reveal>…</section>
 *   <li v-for="(item, index) in items" v-reveal="index * 80">…</li>    each a little after the last
 *
 * The value is a delay in milliseconds. Elements already on screen when the page loads are left
 * alone, so nothing above the fold flashes out and back in.
 */
let observer: IntersectionObserver | undefined

function watcher(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        ;(entry.target as HTMLElement).dataset.reveal = 'shown'
        // Once is enough: it does not hide again when scrolled past.
        observer!.unobserve(entry.target)
      }
    },
    // A little of it has to be showing before it starts, so the movement is actually seen.
    { threshold: 0.15, rootMargin: '0px 0px -5% 0px' },
  )
  return observer
}

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    if (typeof IntersectionObserver === 'undefined') return
    const box = el.getBoundingClientRect()
    const onScreen = box.top < window.innerHeight && box.bottom > 0
    if (onScreen) return
    if (binding.value) el.style.setProperty('--sb-reveal-delay', `${binding.value}ms`)
    el.dataset.reveal = 'waiting'
    watcher().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
