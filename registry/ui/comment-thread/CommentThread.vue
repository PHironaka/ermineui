<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { Button } from '../button'
import { Textarea } from '../textarea'
import CommentItem from './CommentItem.vue'
import { provideCommentThread } from './context'
import { countComments, type CommentNode } from './types'

const props = withDefaults(
  defineProps<{
    comments: readonly CommentNode[]
    /** Heading over the thread. The number of comments is added after it. */
    title?: string
    /** Heading level of the title. */
    titleAs?: string
    /** Let the reader write comments and replies. Turn off for someone who is not signed in. */
    canComment?: boolean
    /** How many levels of reply are indented. Replies deeper than this line up with the last level. */
    maxDepth?: number
    locale?: string
    placeholder?: string
    submitLabel?: string
    /** Set while a comment is being saved: the button shows a spinner and cannot be pressed twice. */
    loading?: boolean
  }>(),
  { title: 'Comments', titleAs: 'h3', canComment: true, maxDepth: 3, locale: 'en-US', placeholder: 'Add a comment', submitLabel: 'Comment' },
)

const emit = defineEmits<{
  /** A new comment was written. Save it, then add it to `comments`. */
  submit: [text: string]
  /** A reply was written under a comment. Save it, then add it to that comment's `replies`. */
  reply: [text: string, parent: CommentNode]
  /** "Delete" was pressed on a comment. */
  delete: [comment: CommentNode]
}>()

const draft = ref('')
const total = computed(() => countComments(props.comments))

provideCommentThread({
  replyingTo: ref<string>(),
  maxDepth: toRef(props, 'maxDepth'),
  locale: toRef(props, 'locale'),
  canReply: toRef(props, 'canComment'),
  reply: (text, parent) => emit('reply', text, parent),
  remove: (comment) => emit('delete', comment),
})

function submit() {
  const text = draft.value.trim()
  if (!text) return
  emit('submit', text)
  draft.value = ''
}
</script>

<template>
  <section class="er-comment-thread">
    <component :is="titleAs" class="er-comment-thread-title">{{ title }} <span>{{ total }}</span></component>

    <form v-if="canComment" class="er-comment-thread-form" @submit.prevent="submit">
      <Textarea v-model="draft" rows="2" :placeholder="placeholder" :aria-label="placeholder" />
      <Button type="submit" size="sm" :loading="loading" :disabled="!draft.trim()">{{ submitLabel }}</Button>
    </form>

    <!-- Shown when there are no comments yet. -->
    <p v-if="!comments.length" class="er-comment-thread-empty"><slot name="empty">No comments yet.</slot></p>
    <ul v-else class="er-comment-thread-list">
      <CommentItem v-for="comment in comments" :key="comment.id" :comment="comment" :depth="1" />
    </ul>
  </section>
</template>

<style>
@layer components {
  .er-comment-thread {
    display: grid;
    gap: 1rem;
    width: 100%;
    min-width: 0;
  }

  .er-comment-thread-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5rem;
  }

  .er-comment-thread-title span {
    color: var(--er-muted-foreground);
    font-weight: 400;
  }

  .er-comment-thread-form {
    display: grid;
    justify-items: end;
    gap: 0.5rem;
  }

  .er-comment-thread-empty {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
  }

  .er-comment-thread-list,
  .er-comment-replies {
    display: grid;
    gap: 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* Replies hang off a line down from the comment they answer. */
  .er-comment-replies {
    margin-top: 1rem;
    padding-left: 1rem;
    border-left: 2px solid var(--er-border);
  }

  .er-comment-replies[data-flat] {
    padding-left: 0;
    border-left: 0;
  }

  .er-comment {
    min-width: 0;
  }

  .er-comment-row {
    display: flex;
    gap: 0.625rem;
  }

  .er-comment-main {
    display: grid;
    flex: 1;
    gap: 0.25rem;
    min-width: 0;
  }

  .er-comment-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.125rem 0.5rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .er-comment-author {
    font-weight: 600;
  }

  .er-comment-badge {
    padding: 0 0.375rem;
    border: 1px solid var(--er-border);
    border-radius: 999px;
    font-size: 0.6875rem;
    font-weight: 500;
    line-height: 1.125rem;
  }

  .er-comment-head time {
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
  }

  .er-comment-body {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.5;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .er-comment-actions {
    display: flex;
    gap: 0.75rem;
  }

  .er-comment-actions button {
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-muted-foreground);
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
  }

  .er-comment-actions button:hover {
    color: var(--er-foreground);
  }

  .er-comment-actions button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-comment-reply {
    display: grid;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .er-comment-reply-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .er-comment-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
