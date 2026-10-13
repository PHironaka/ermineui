<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { Button } from '../button'

/** The event Chromium browsers fire when the page could be installed. It is not in TypeScript's DOM types. */
interface InstallEvent extends Event {
  prompt: () => Promise<unknown>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const props = withDefaults(
  defineProps<{
    title?: string
    /** Why it is worth installing. Be specific: "Opens straight to your orders, and works offline." */
    description?: string
    installLabel?: string
    dismissLabel?: string
    /** On iPhones and iPads, where a page cannot ask, show how to do it by hand instead. */
    iosSteps?: boolean
    /** After "Not now", stay quiet for this many days. 0 asks again on the next visit. */
    remindAfterDays?: number
    /** Where "Not now" is remembered in localStorage. Leave empty to remember nothing. */
    storageKey?: string
    /** Show the prompt even where the browser has not offered installing: for designing it, and for demos. */
    preview?: boolean
  }>(),
  {
    title: 'Install this app',
    description: 'Add it to your home screen for quick access. It opens full screen and works offline.',
    installLabel: 'Install',
    dismissLabel: 'Not now',
    iosSteps: true,
    remindAfterDays: 14,
    storageKey: 'er-install-prompt',
  },
)

const emit = defineEmits<{
  /** The app was installed. */
  installed: []
  /** "Not now" was pressed, or the browser's own prompt was turned down. */
  dismiss: []
}>()

const titleId = useId()
// Unknown until mounted, and usually for a while after: the browser decides when to offer.
const offer = ref<InstallEvent>()
const ios = ref(false)
const snoozed = ref(false)

const mode = computed(() => (snoozed.value ? undefined : offer.value || props.preview ? 'install' : ios.value && props.iosSteps ? 'ios' : undefined))

function onOffer(event: Event) {
  // Stops Chrome's own small banner, so that this prompt is the only one.
  event.preventDefault()
  offer.value = event as InstallEvent
}

function onInstalled() {
  offer.value = undefined
  snoozed.value = true
  emit('installed')
}

onMounted(() => {
  try {
    const until = Number(props.storageKey && localStorage.getItem(props.storageKey))
    snoozed.value = until > Date.now()
  } catch {
    // Storage can be blocked; then the prompt simply is not remembered.
  }
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
  if (standalone) snoozed.value = true
  // iPadOS calls itself a Mac; a Mac with a touch screen is an iPad.
  ios.value = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  window.addEventListener('beforeinstallprompt', onOffer)
  window.addEventListener('appinstalled', onInstalled)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', onOffer)
  window.removeEventListener('appinstalled', onInstalled)
})

async function install() {
  const event = offer.value
  if (!event) return
  // The browser's own prompt can be shown once per offer, and only in answer to a press.
  await event.prompt()
  const { outcome } = await event.userChoice
  offer.value = undefined
  if (outcome === 'dismissed') dismiss()
}

function dismiss() {
  snoozed.value = true
  try {
    if (props.storageKey && props.remindAfterDays > 0) localStorage.setItem(props.storageKey, String(Date.now() + props.remindAfterDays * 86_400_000))
  } catch {
    // As above.
  }
  emit('dismiss')
}
</script>

<template>
  <section v-if="mode" class="er-install-prompt" :aria-labelledby="titleId">
    <!-- The app's icon. -->
    <div class="er-install-prompt-icon">
      <slot name="icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></svg>
      </slot>
    </div>
    <div class="er-install-prompt-text">
      <p :id="titleId" class="er-install-prompt-title">{{ title }}</p>
      <p class="er-install-prompt-description">
        <template v-if="mode === 'install'">{{ description }}</template>
        <!-- What to do on an iPhone or iPad, where only the reader can add the app. -->
        <slot v-else name="ios">Tap the Share button, then “Add to Home Screen”.</slot>
      </p>
    </div>
    <div class="er-install-prompt-actions">
      <Button size="sm" variant="ghost" @click="dismiss">{{ mode === 'ios' ? 'Got it' : dismissLabel }}</Button>
      <Button v-if="mode === 'install'" size="sm" @click="install">{{ installLabel }}</Button>
    </div>
  </section>
</template>

<style>
@layer components {
  .er-install-prompt {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1rem;
    width: 100%;
    padding: 0.875rem 1rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-lg);
    background: var(--er-card);
    color: var(--er-card-foreground);
    font-size: 0.875rem;
  }

  .er-install-prompt-icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--er-radius-md);
    background: var(--er-muted);
    color: var(--er-muted-foreground);
    overflow: hidden;
  }

  .er-install-prompt-icon svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .er-install-prompt-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .er-install-prompt-text {
    flex: 1;
    min-width: 12rem;
  }

  .er-install-prompt-title {
    margin: 0;
    font-weight: 500;
  }

  .er-install-prompt-description {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  .er-install-prompt-actions {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
  }
}
</style>
