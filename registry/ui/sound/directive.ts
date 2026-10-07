import type { Directive } from 'vue'
import { playSound, type SoundName } from './sound'

/**
 * v-sound — makes a control play a sound when it is used. Works on any element or single-root
 * component, without changing the component:
 *
 *   <Button v-sound>Save</Button>                   the default click
 *   <Button v-sound="'pop'">Add</Button>            a named sound
 *   <Switch v-sound.toggle />                       "on" or "off", to match the new state
 *   <Button v-sound.hover>Menu</Button>             also a faint tick when the pointer arrives
 *   <Button v-sound="{ press: 'success', hover: 'tick' }" />
 *   <Button v-sound="false">Quiet</Button>          switched off
 */
type SoundBinding = SoundName | boolean | undefined | { press?: SoundName | false; hover?: SoundName | false }

interface State {
  value: SoundBinding
  toggle: boolean
  hover: boolean
  onClick: () => void
  onEnter: (event: PointerEvent) => void
}

const states = new WeakMap<HTMLElement, State>()

/** Whether a toggling control is now on: a checkbox or switch, or a button that says so with ARIA. */
function isOn(el: HTMLElement): boolean {
  if (el instanceof HTMLInputElement) return el.checked
  return el.getAttribute('aria-pressed') === 'true' || el.getAttribute('aria-checked') === 'true' || el.getAttribute('aria-expanded') === 'true'
}

export const vSound: Directive<HTMLElement, SoundBinding> = {
  mounted(el, binding) {
    const state: State = {
      value: binding.value,
      toggle: !!binding.modifiers.toggle,
      hover: !!binding.modifiers.hover,
      // "click" also fires for Enter and Space, so keyboard users hear the same thing as mouse users.
      onClick: () => {
        const value = state.value
        if (value === false) return
        const press = typeof value === 'object' ? value.press : value
        if (press === false) return
        if (state.toggle) {
          // Checked after the control has updated itself, so the sound matches where it ended up.
          queueMicrotask(() => playSound(isOn(el) ? 'on' : 'off'))
        } else playSound(typeof press === 'string' ? press : 'click')
      },
      onEnter: (event) => {
        const value = state.value
        const hover = typeof value === 'object' && value !== null ? value.hover : state.hover ? 'tick' : false
        // Touch has no hover, and a disabled control should stay silent.
        if (!hover || value === false || event.pointerType === 'touch' || el.matches(':disabled, [aria-disabled="true"]')) return
        playSound(hover)
      },
    }
    states.set(el, state)
    el.addEventListener('click', state.onClick)
    el.addEventListener('pointerenter', state.onEnter)
  },
  updated(el, binding) {
    const state = states.get(el)
    if (state) state.value = binding.value
  },
  unmounted(el) {
    const state = states.get(el)
    if (!state) return
    el.removeEventListener('click', state.onClick)
    el.removeEventListener('pointerenter', state.onEnter)
    states.delete(el)
  },
}
