import {
  cloneVNode,
  Comment,
  defineComponent,
  Fragment,
  h,
  onMounted,
  ref,
  Teleport,
  Text,
  type Component,
  type PropType,
  type VNode,
} from 'vue'

function firstElement(nodes: VNode[]): VNode | undefined {
  for (const node of nodes) {
    if (node.type === Comment || node.type === Text) continue
    if (node.type === Fragment) {
      const inner = Array.isArray(node.children) ? firstElement(node.children as VNode[]) : undefined
      if (inner) return inner
      continue
    }
    return node
  }
  return undefined
}

/**
 * Renders `as` (a tag name or component). With `as-child`, it renders nothing of
 * its own and instead passes its attributes and listeners to the single child in
 * its slot — so `<DialogTrigger as-child><Button>Open</Button></DialogTrigger>`
 * produces one button, not two.
 */
export const Primitive = defineComponent({
  name: 'Primitive',
  inheritAttrs: false,
  props: {
    as: { type: [String, Object, Function] as PropType<string | Component>, default: 'div' },
    asChild: Boolean,
  },
  setup(props, { attrs, slots }) {
    return () => {
      if (props.asChild) {
        const child = firstElement(slots.default?.() ?? [])
        if (!child) return null
        // Classes, styles and listeners from both sides are merged. For anything else,
        // what you wrote on the child (an id, a type) wins over what the parent passes down.
        const clone = cloneVNode(child, attrs, true)
        for (const key in child.props) {
          if (key !== 'class' && key !== 'style' && !/^on[A-Z]/.test(key)) clone.props![key] = child.props[key]
        }
        return clone
      }
      return typeof props.as === 'string'
        ? h(props.as, attrs, slots.default?.())
        : h(props.as as Component, attrs, slots)
    }
  },
})

/**
 * Teleports its slot to `to` (default: body), but only after mount. Rendering
 * nothing on the server keeps hydration safe in Nuxt and in Astro islands.
 */
export const Portal = defineComponent({
  name: 'Portal',
  props: {
    to: { type: [String, Object] as PropType<string | HTMLElement>, default: 'body' },
  },
  setup(props, { slots }) {
    const mounted = ref(false)
    onMounted(() => {
      mounted.value = true
    })
    return () => (mounted.value ? h(Teleport, { to: props.to }, slots.default?.() ?? []) : null)
  },
})

/** Resolves a template ref (element or component instance) to its root element. */
export function toElement(target: unknown): HTMLElement | null {
  if (typeof HTMLElement === 'undefined' || !target) return null
  const el = (target as { $el?: unknown }).$el ?? target
  return el instanceof HTMLElement ? el : null
}
