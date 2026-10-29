<script setup lang="ts">
import { computed, ref } from 'vue'
import { Avatar } from '../../ui/avatar'
import { Button } from '../../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
import { Icon } from '../../ui/icon'
import { Sidebar, SidebarGroup, SidebarItem } from '../../ui/sidebar'
import type { DashboardNavGroup, DashboardUser } from './sample-data'

const props = withDefaults(
  defineProps<{
    /** Name of the page, shown in the top bar. */
    title: string
    /** Name of the product, shown at the top of the sidebar. */
    brand?: string
    /** The links in the sidebar, in groups. */
    navigation: readonly DashboardNavGroup[]
    /** The href of the link for the page being shown. */
    current?: string
    /** Who is signed in. Leave out to hide the user menu. */
    user?: DashboardUser
    /** Tag or component for the sidebar links, e.g. RouterLink or NuxtLink. */
    linkAs?: string | object
    /** Tag for the page area. Change it only when the page already has a <main> around this block. */
    mainAs?: string
    /** Tag for the title. Change it only when the page already has an <h1>. */
    titleAs?: string
  }>(),
  { brand: 'Acme', linkAs: 'a', mainAs: 'main', titleAs: 'h1' },
)

const emit = defineEmits<{
  /** "Sign out" was chosen in the user menu. */
  signOut: []
}>()

/** Sidebar shrunk to icons. Only applies on a wide screen. */
const collapsed = defineModel<boolean>('collapsed', { default: false })
/** Sidebar slid in over the page. Only applies on a narrow screen. */
const open = ref(false)

const initials = computed(() =>
  (props.user?.name ?? '')
    .split(/\s+/)
    .map((word) => word[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)

// One button does both jobs: on a narrow screen it slides the sidebar in, on a wide one it shrinks it.
// The width here is the one the sidebar itself switches at.
function toggleNavigation() {
  if (window.matchMedia('(max-width: 47.999rem)').matches) open.value = true
  else collapsed.value = !collapsed.value
}

// Router links take "to"; a plain link takes "href".
const linkTo = (href: string) => (props.linkAs === 'a' ? { href } : { to: href })
</script>

<template>
  <div class="er-dashboard">
    <Sidebar v-model:collapsed="collapsed" v-model:open="open" off-canvas label="Main">
      <template #header="{ collapsed: rail }">
        <div class="er-dashboard-brand">
          <slot name="brand" :collapsed="rail">
            <span class="er-dashboard-brand-mark" aria-hidden="true">{{ brand.slice(0, 1) }}</span>
            <span v-if="!rail" class="er-dashboard-brand-name">{{ brand }}</span>
          </slot>
        </div>
      </template>

      <SidebarGroup v-for="group in navigation" :key="group.label" :label="group.label">
        <SidebarItem v-for="item in group.items" :key="item.href" :as="linkAs" v-bind="linkTo(item.href)" :active="item.href === current">
          <template #icon><Icon :name="item.icon" /></template>
          {{ item.label }}
        </SidebarItem>
      </SidebarGroup>

      <template v-if="$slots['sidebar-footer']" #footer="{ collapsed: rail }">
        <slot name="sidebar-footer" :collapsed="rail" />
      </template>
    </Sidebar>

    <div class="er-dashboard-body">
      <header class="er-dashboard-bar">
        <Button variant="ghost" size="icon" aria-label="Toggle navigation" @click="toggleNavigation">
          <Icon name="panel-left" />
        </Button>
        <component :is="titleAs" class="er-dashboard-title">{{ title }}</component>

        <div class="er-dashboard-actions">
          <slot name="actions" />
          <DropdownMenu v-if="user">
            <DropdownMenuTrigger class="er-dashboard-user" :aria-label="`Account menu for ${user.name}`">
              <Avatar size="sm" :src="user.avatar">{{ initials }}</Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {{ user.name }}
                <span class="er-dashboard-user-email">{{ user.email }}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <slot name="user-menu" />
              <DropdownMenuItem @select="emit('signOut')">
                <Icon name="log-out" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <component :is="mainAs" class="er-dashboard-main">
        <slot />
      </component>
    </div>
  </div>
</template>

<style>
@layer components {
  /* The sidebar stays put and the page area scrolls. Set --er-dashboard-height to fit the block into a smaller space. */
  .er-dashboard {
    display: flex;
    height: var(--er-dashboard-height, 100dvh);
    background: var(--er-background);
    color: var(--er-foreground);
    overflow: hidden;
  }

  .er-dashboard-brand {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    height: 2.25rem;
    padding: 0 0.25rem;
    font-weight: var(--er-weight-semibold);
    white-space: nowrap;
    overflow: hidden;
  }

  .er-dashboard-brand-mark {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--er-radius-md);
    background: var(--er-primary);
    color: var(--er-primary-foreground);
    font-size: 0.875rem;
  }

  .er-dashboard-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    overflow: hidden auto;
  }

  .er-dashboard-bar {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.5rem;
    min-height: 3.3125rem;
    padding: 0.5rem 1rem 0.5rem 0.5rem;
    border-bottom: 1px solid var(--er-border);
    background: var(--er-background);
  }

  .er-dashboard-title {
    min-width: 0;
    margin: 0;
    font-size: 1rem;
    font-weight: var(--er-weight-semibold);
    line-height: 1.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .er-dashboard-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
  }

  .er-dashboard-user {
    display: grid;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: none;
    cursor: pointer;
  }

  .er-dashboard-user:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-dashboard-user-email {
    display: block;
    color: var(--er-muted-foreground);
    font-weight: 400;
  }

  .er-dashboard-main {
    display: grid;
    flex: 1;
    align-content: start;
    gap: 1rem;
    min-width: 0;
    padding: 1rem;
  }

  @media (min-width: 48rem) {
    .er-dashboard-main {
      gap: 1.5rem;
      padding: 1.5rem;
    }
  }
}
</style>
