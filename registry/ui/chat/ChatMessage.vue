<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Who wrote it. Shown above the bubble, and read out before the message. */
    author?: string
    /** The reader's own message: on the far side, in the primary colour. */
    mine?: boolean
    /** When it was sent, already written out the way it should read: "14:20", "Yesterday". */
    time?: string
    /** For machines: the same moment as an ISO date. */
    datetime?: string
    /** How far the reader's own message has got. */
    status?: 'sending' | 'sent' | 'read' | 'failed'
    /** Keep the author's name for screen readers only, as when several messages in a row are from the same person. */
    hideAuthor?: boolean
  }>(),
  {},
)

defineEmits<{
  /** "Try again" was pressed on a message that failed to send. */
  retry: []
}>()

const statusWords = { sending: 'Sending…', sent: 'Sent', read: 'Read', failed: 'Not sent' }
</script>

<template>
  <li class="er-chat-message" :data-mine="mine ? '' : undefined" :data-status="status">
    <!-- The author's picture. -->
    <div v-if="$slots.avatar" class="er-chat-message-avatar"><slot name="avatar" /></div>
    <div class="er-chat-message-body">
      <span v-if="author || mine" class="er-chat-message-author" :class="{ 'er-chat-hidden': hideAuthor || (mine && !author) }">{{ author ?? 'You' }}</span>
      <div class="er-chat-message-bubble"><slot /></div>
      <div v-if="time || status" class="er-chat-message-meta">
        <time v-if="time" :datetime="datetime">{{ time }}</time>
        <span v-if="status">{{ statusWords[status] }}</span>
        <button v-if="status === 'failed'" type="button" @click="$emit('retry')">Try again</button>
      </div>
    </div>
  </li>
</template>

<style>
@layer components {
  .er-chat-message {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    max-width: min(85%, 34rem);
  }

  .er-chat-message[data-mine] {
    flex-direction: row-reverse;
    justify-self: end;
  }

  .er-chat-message-avatar {
    flex-shrink: 0;
  }

  .er-chat-message-body {
    display: grid;
    gap: 0.1875rem;
    min-width: 0;
    justify-items: start;
  }

  .er-chat-message[data-mine] .er-chat-message-body {
    justify-items: end;
  }

  .er-chat-message-author,
  .er-chat-message-meta {
    padding-inline: 0.5rem;
    color: var(--er-muted-foreground);
    font-size: 0.75rem;
    line-height: 1rem;
  }

  .er-chat-message-author {
    font-weight: 500;
  }

  .er-chat-message-bubble {
    padding: 0.5rem 0.875rem;
    border-radius: 1.125rem;
    border-end-start-radius: 0.25rem;
    background: var(--er-muted);
    color: var(--er-foreground);
    font-size: 0.9375rem;
    line-height: 1.375rem;
    overflow-wrap: anywhere;
    /* Line breaks in a message are kept; the spaces a template leaves around it are not. */
    white-space: pre-line;
  }

  .er-chat-message[data-mine] .er-chat-message-bubble {
    border-end-start-radius: 1.125rem;
    border-end-end-radius: 0.25rem;
    background: var(--er-primary);
    color: var(--er-primary-foreground);
  }

  .er-chat-message[data-status='sending'] .er-chat-message-bubble {
    opacity: 0.6;
  }

  /* Not sent: outlined in the warning colour, and the words underneath say so. */
  .er-chat-message[data-status='failed'] .er-chat-message-bubble {
    background: transparent;
    color: var(--er-foreground);
    box-shadow: inset 0 0 0 1px var(--er-destructive);
  }

  .er-chat-message-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0 0.375rem;
  }

  .er-chat-message[data-status='failed'] .er-chat-message-meta {
    color: var(--er-destructive);
  }

  .er-chat-message-meta button {
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-foreground);
    font: inherit;
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 0.2em;
    cursor: pointer;
  }

  .er-chat-message-meta button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }
}
</style>
