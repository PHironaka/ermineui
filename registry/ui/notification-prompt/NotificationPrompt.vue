<script setup lang="ts">
import { onMounted, ref, useId } from 'vue'
import { Button } from '../button'

withDefaults(
  defineProps<{
    title?: string
    /** Why it is worth saying yes. Be specific: people decline prompts they do not understand. */
    description?: string
    allowLabel?: string
    dismissLabel?: string
  }>(),
  {
    title: 'Turn on notifications?',
    description: 'We will only notify you about things you asked to hear about.',
    allowLabel: 'Turn on',
    dismissLabel: 'Not now',
  },
)

const emit = defineEmits<{
  /** Permission was given. Notifications can be shown from now on. */
  granted: []
  /** Permission was refused in the browser's own prompt. */
  denied: []
  /** "Not now" was pressed. The browser was never asked, so you can offer again later. */
  dismiss: []
}>()

/** Set false to hide the prompt (after "Not now", say). It also hides itself once the question is settled. */
const open = defineModel<boolean>('open', { default: true })

// Unknown until mounted: the server cannot see the browser's permission.
const titleId = useId()
const permission = ref<'unsupported' | NotificationPermission | 'unknown'>('unknown')

onMounted(() => {
  permission.value = 'Notification' in window ? Notification.permission : 'unsupported'
})

async function allow() {
  // The browser's own prompt only ever appears from here: in response to a press, never on page load.
  // Asked cold, most people refuse, and a refusal is permanent until they dig through browser settings.
  const result = await Notification.requestPermission()
  permission.value = result
  if (result === 'granted') emit('granted')
  else if (result === 'denied') emit('denied')
}

function dismiss() {
  open.value = false
  emit('dismiss')
}
</script>

<template>
  <section v-if="open && permission === 'default'" class="sb-notification-prompt" :aria-labelledby="titleId">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M6 9a6 6 0 1 1 12 0c0 6 2.500 7 2.500 7h-17S6 15 6 9ZM10 20a2 2 0 0 0 4 0" />
    </svg>
    <div class="sb-notification-prompt-text">
      <p :id="titleId" class="sb-notification-prompt-title">{{ title }}</p>
      <p class="sb-notification-prompt-description">{{ description }}</p>
    </div>
    <div class="sb-notification-prompt-actions">
      <Button size="sm" variant="ghost" @click="dismiss">{{ dismissLabel }}</Button>
      <Button size="sm" @click="allow">{{ allowLabel }}</Button>
    </div>
  </section>
  <!-- Refused: the page can no longer ask, so the only useful thing is to say where the setting lives.
       The paragraph is there from the start and filled in when the answer arrives, so it is announced. -->
  <p v-if="open" class="sb-notification-prompt-note" role="status">
    <slot v-if="permission === 'denied'" name="denied">Notifications are blocked for this site. You can allow them in your browser's site settings.</slot>
  </p>
</template>

<style>
@layer components {
  .sb-notification-prompt {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1rem;
    width: 100%;
    padding: 0.875rem 1rem;
    border: 1px solid var(--sb-border);
    border-radius: var(--sb-radius-lg);
    background: var(--sb-card);
    color: var(--sb-card-foreground);
    font-size: 0.875rem;
  }

  .sb-notification-prompt > svg {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--sb-muted-foreground);
  }

  .sb-notification-prompt-text {
    flex: 1;
    min-width: 12rem;
  }

  .sb-notification-prompt-title {
    margin: 0;
    font-weight: 500;
  }

  .sb-notification-prompt-description,
  .sb-notification-prompt-note {
    margin: 0;
    color: var(--sb-muted-foreground);
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  .sb-notification-prompt-note:empty {
    /* Out of sight but still in the page for screen readers, which is what lets them announce it filling in. */
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .sb-notification-prompt-actions {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
  }
}
</style>
