import type { Directive } from 'vue'
import { haptic, type HapticName } from './haptic'

/**
 * v-haptic — a small buzz when a control is used, on phones that can. Pairs well with v-sound.
 *
 *   <Button v-haptic>Save</Button>                 a normal press
 *   <Button v-haptic="'heavy'">Delete</Button>     a named pattern
 *   <Switch v-haptic.toggle />                     firmer when switching on than off
 *   <Button v-haptic="false">Quiet</Button>        switched off
 */
type HapticBinding = HapticName | boolean | undefined

interface State {
  value: HapticBinding
  toggle: boolean
  onClick: () => void
}

const states = new WeakMap<HTMLElement, State>()

function isOn(el: HTMLElement): boolean {
  if (el instanceof HTMLInputElement) return el.checked
  return el.getAttribute('aria-pressed') === 'true' || el.getAttribute('aria-checked') === 'true'
}

export const vHaptic: Directive<HTMLElement, HapticBinding> = {
  mounted(el, binding) {
    const state: State = {
      value: binding.value,
      toggle: !!binding.modifiers.toggle,
      onClick: () => {
        if (state.value === false) return
        // Checked after the control has updated itself, so the buzz matches where it ended up.
        if (state.toggle) queueMicrotask(() => haptic(isOn(el) ? 'medium' : 'light'))
        else haptic(typeof state.value === 'string' ? state.value : 'medium')
      },
    }
    states.set(el, state)
    el.addEventListener('click', state.onClick)
  },
  updated(el, binding) {
    const state = states.get(el)
    if (state) state.value = binding.value
  },
  unmounted(el) {
    const state = states.get(el)
    if (!state) return
    el.removeEventListener('click', state.onClick)
    states.delete(el)
  },
}
