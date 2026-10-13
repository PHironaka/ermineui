<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Accessible name of the box, e.g. "Message to support". */
    label?: string
    placeholder?: string
    sendLabel?: string
    disabled?: boolean
    /** How many lines the box grows to before it scrolls. */
    maxRows?: number
    /** Enter sends and Shift+Enter starts a new line. Turn off for long messages, where Enter should be a new line and only the button sends. */
    enterSends?: boolean
  }>(),
  { label: 'Message', placeholder: 'Write a message', sendLabel: 'Send', maxRows: 6, enterSends: true },
)

const emit = defineEmits<{
  /** A message was sent. The box is emptied; add the message to your list. */
  send: [text: string]
}>()

/** What is in the box. */
const text = defineModel<string>({ default: '' })

const box = ref<HTMLTextAreaElement | null>(null)
const canSend = computed(() => !props.disabled && text.value.trim().length > 0)

function grow() {
  const el = box.value
  if (!el) return
  el.style.height = 'auto'
  const style = getComputedStyle(el)
  const most = (Number.parseFloat(style.lineHeight) || 22) * props.maxRows + Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
  el.style.height = `${Math.min(el.scrollHeight, most)}px`
}

watch(text, () => void nextTick(grow), { flush: 'post' })

function send() {
  if (!canSend.value) return
  emit('send', text.value.trim())
  text.value = ''
  // Focus stays in the box, so the next message can be typed straight away.
  box.value?.focus()
}

function onKeydown(event: KeyboardEvent) {
  // While a language's input method is putting characters together, Enter confirms a character; it must not send.
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing || !props.enterSends) return
  event.preventDefault()
  send()
}
</script>

<template>
  <form class="er-chat-composer" :data-disabled="disabled ? '' : undefined" @submit.prevent="send">
    <!-- Buttons before the box: attach a file, open an emoji picker. -->
    <div v-if="$slots.start" class="er-chat-composer-actions"><slot name="start" /></div>
    <textarea ref="box" v-model="text" rows="1" :aria-label="label" :placeholder="placeholder" :disabled="disabled" enterkeyhint="send" @keydown="onKeydown" />
    <button type="submit" class="er-chat-composer-send" :aria-label="sendLabel" :disabled="!canSend">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
    </button>
  </form>
</template>

<style>
@layer components {
  .er-chat-composer {
    display: flex;
    align-items: flex-end;
    gap: 0.375rem;
    width: 100%;
    padding: 0.375rem;
    border: 1px solid var(--er-input);
    border-radius: 1.375rem;
    background: var(--er-input-background);
    transition:
      border-color var(--er-duration),
      outline-color var(--er-duration);
  }

  .er-chat-composer:has(textarea:focus-visible) {
    border-color: var(--er-ring);
    outline: 2px solid color-mix(in oklab, var(--er-ring) 45%, transparent);
    outline-offset: 0;
  }

  .er-chat-composer[data-disabled] {
    opacity: 0.5;
  }

  .er-chat-composer-actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.125rem;
    min-height: 2rem;
  }

  .er-chat-composer textarea {
    flex: 1;
    min-width: 0;
    padding: 0.3125rem 0.5rem;
    border: 0;
    background: transparent;
    color: var(--er-foreground);
    font: inherit;
    /* 16px stops iOS from zooming the page when the field is focused. */
    font-size: 1rem;
    line-height: 1.375rem;
    outline: none;
    resize: none;
  }

  @media (min-width: 48rem) {
    .er-chat-composer textarea {
      font-size: 0.9375rem;
    }
  }

  .er-chat-composer textarea::placeholder {
    color: var(--er-muted-foreground);
  }

  .er-chat-composer-send {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: var(--er-primary);
    color: var(--er-primary-foreground);
    cursor: pointer;
    transition: opacity var(--er-duration);
  }

  .er-chat-composer-send:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .er-chat-composer-send:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-chat-composer-send svg {
    width: 1rem;
    height: 1rem;
  }
}
</style>
