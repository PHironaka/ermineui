<script lang="ts">
import { Comment, defineComponent, Fragment, h, Text, type VNode } from 'vue'

/** Unwraps v-for lists and drops comments, leaving one entry per avatar. */
function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) => {
    if (node.type === Comment || node.type === Text) return []
    if (node.type === Fragment) return flatten((node.children as VNode[]) ?? [])
    return [node]
  })
}

export default defineComponent({
  name: 'AvatarGroup',
  props: {
    /** Most avatars to show. The rest are counted in a "+3" at the end. */
    max: { type: Number, default: undefined },
    /** Accessible name of the group, e.g. "Team members". */
    label: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    return () => {
      const avatars = flatten(slots.default?.() ?? [])
      const shown = props.max !== undefined && avatars.length > props.max ? avatars.slice(0, props.max) : avatars
      const hidden = avatars.length - shown.length
      return h('div', { class: 'sb-avatar-group', role: 'group', 'aria-label': props.label }, [
        ...shown,
        hidden > 0 ? h('span', { class: 'sb-avatar sb-avatar-more', role: 'img', 'aria-label': `${hidden} more` }, `+${hidden}`) : null,
      ])
    }
  },
})
</script>

<style>
@layer components {
  .sb-avatar-group {
    /* The ring between overlapping avatars is drawn in the colour behind them. */
    --sb-avatar-ring: var(--sb-background);
    display: inline-flex;
    align-items: center;
  }

  .sb-card .sb-avatar-group {
    --sb-avatar-ring: var(--sb-card);
  }

  .sb-avatar-group > .sb-avatar {
    box-shadow: 0 0 0 2px var(--sb-avatar-ring);
  }

  .sb-avatar-group > .sb-avatar + .sb-avatar {
    margin-left: -0.5rem;
  }

  .sb-avatar-more {
    color: var(--sb-muted-foreground);
    font-size: 0.75rem;
  }
}
</style>
