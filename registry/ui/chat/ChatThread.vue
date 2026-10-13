<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

withDefaults(
  defineProps<{
    /** Accessible name of the conversation, e.g. "Chat with support". */
    label?: string
    /** Someone is writing: shows three dots at the end. Say who in `typingLabel`. */
    typing?: boolean
    typingLabel?: string
    /** The words on the button that appears when new messages arrive while reading further up. */
    newLabel?: string
  }>(),
  { label: 'Conversation', typingLabel: 'Typing…', newLabel: 'New messages' },
)

const scroller = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)
/** Whether the reader is at the newest message. If they have scrolled up to read, new messages must not yank them back down. */
const atEnd = ref(true)
const unseen = ref(false)
let observer: MutationObserver | undefined

function onScroll() {
  const el = scroller.value
  if (!el) return
  atEnd.value = el.scrollHeight - el.scrollTop - el.clientHeight < 48
  if (atEnd.value) unseen.value = false
}

/** Jumps to the newest message. */
function scrollToEnd() {
  const el = scroller.value
  if (el) el.scrollTop = el.scrollHeight
  unseen.value = false
}

onMounted(() => {
  scrollToEnd()
  if (!list.value) return
  // Messages are whatever is put in the slot, so new ones are noticed by watching the list itself.
  observer = new MutationObserver(() => {
    if (atEnd.value) void nextTick(scrollToEnd)
    else unseen.value = true
  })
  observer.observe(list.value, { childList: true })
})

onBeforeUnmount(() => observer?.disconnect())

defineExpose({ scrollToEnd })
</script>

<template>
  <div class="er-chat-thread">
    <!-- A log: new messages are read out as they arrive, without taking focus. It can be focused so the keyboard can scroll it. -->
    <div ref="scroller" class="er-chat-thread-scroll" role="log" :aria-label="label" tabindex="0" @scroll.passive="onScroll">
      <!-- ChatMessage, one per message, oldest first. -->
      <ol ref="list" class="er-chat-thread-list"><slot /></ol>
      <p v-if="typing" class="er-chat-thread-typing">
        <span aria-hidden="true"><i /><i /><i /></span>
        <span class="er-chat-hidden">{{ typingLabel }}</span>
      </p>
    </div>
    <button v-if="unseen" type="button" class="er-chat-thread-new" @click="scrollToEnd">
      {{ newLabel }}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
    </button>
  </div>
</template>

<style>
@layer components {
  .er-chat-thread {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 0;
  }

  .er-chat-thread-scroll {
    flex: 1;
    min-height: 0;
    padding: 1rem;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .er-chat-thread-scroll:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: -2px;
  }

  .er-chat-thread-list {
    display: grid;
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .er-chat-thread-typing {
    display: inline-flex;
    margin: 0.75rem 0 0;
    padding: 0.75rem 0.875rem;
    border-radius: 1.125rem;
    background: var(--er-muted);
  }

  .er-chat-thread-typing > span:first-child {
    display: flex;
    gap: 0.25rem;
  }

  .er-chat-thread-typing i {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background: var(--er-muted-foreground);
    animation: er-chat-typing 1.2s infinite;
  }

  .er-chat-thread-typing i:nth-child(2) {
    animation-delay: 0.15s;
  }

  .er-chat-thread-typing i:nth-child(3) {
    animation-delay: 0.3s;
  }

  @keyframes er-chat-typing {
    0%,
    60%,
    100% {
      opacity: 0.35;
      transform: none;
    }

    30% {
      opacity: 1;
      transform: translateY(-0.1875rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .er-chat-thread-typing i {
      animation: none;
    }
  }

  .er-chat-thread-new {
    position: absolute;
    bottom: 0.75rem;
    left: 50%;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    height: 2rem;
    padding: 0 0.75rem;
    border: 1px solid var(--er-border);
    border-radius: 999px;
    background: var(--er-popover);
    color: var(--er-popover-foreground);
    box-shadow: var(--er-shadow-md);
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    transform: translateX(-50%);
    cursor: pointer;
  }

  .er-chat-thread-new:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-chat-thread-new svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  .er-chat-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
