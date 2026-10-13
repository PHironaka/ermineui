<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Avatar } from '../avatar'
import { Button } from '../button'
import { Textarea } from '../textarea'
import { useCommentThread } from './context'
import { initials, type CommentNode } from './types'

const props = defineProps<{
  comment: CommentNode
  /** How deep in the thread this comment is, starting at 1. */
  depth: number
}>()

const thread = useCommentThread()
const draft = ref('')
const form = ref<HTMLFormElement | null>(null)
const replyButton = ref<HTMLButtonElement | null>(null)
const replying = computed(() => thread.replyingTo.value === props.comment.id)

// Read as UTC when only a day is given, so the day shown does not depend on where the server or the reader is.
const written = computed(() => {
  const date = props.comment.date
  if (!date) return undefined
  const day = new Date(date.length === 10 ? `${date}T00:00:00Z` : date)
  return Number.isNaN(day.getTime()) ? date : new Intl.DateTimeFormat(thread.locale.value, { dateStyle: 'medium', timeZone: 'UTC' }).format(day)
})

async function open() {
  thread.replyingTo.value = replying.value ? undefined : props.comment.id
  draft.value = ''
  await nextTick()
  form.value?.querySelector('textarea')?.focus()
}

async function close() {
  thread.replyingTo.value = undefined
  // The box that had focus is gone; it goes back to the button that opened it.
  await nextTick()
  replyButton.value?.focus()
}

function send() {
  const text = draft.value.trim()
  if (!text) return
  thread.reply(text, props.comment)
  void close()
}
</script>

<template>
  <li class="er-comment">
    <div class="er-comment-row">
      <Avatar :src="comment.avatar" size="sm">{{ initials(comment.author) }}</Avatar>
      <div class="er-comment-main">
        <div class="er-comment-head">
          <span class="er-comment-author">{{ comment.author }}</span>
          <span v-if="comment.badge" class="er-comment-badge">{{ comment.badge }}</span>
          <time v-if="written" :datetime="comment.date">{{ written }}</time>
        </div>
        <p class="er-comment-body">{{ comment.body }}</p>
        <div v-if="thread.canReply.value || comment.canDelete" class="er-comment-actions">
          <button v-if="thread.canReply.value" ref="replyButton" type="button" :aria-expanded="replying" @click="open">
            Reply<span class="er-comment-hidden"> to {{ comment.author }}</span>
          </button>
          <button v-if="comment.canDelete" type="button" @click="thread.remove(comment)">
            Delete<span class="er-comment-hidden"> your comment</span>
          </button>
        </div>
        <form v-if="replying" ref="form" class="er-comment-reply" @submit.prevent="send" @keydown.esc="close">
          <Textarea v-model="draft" rows="2" :aria-label="`Reply to ${comment.author}`" :placeholder="`Reply to ${comment.author}`" />
          <div class="er-comment-reply-buttons">
            <Button type="button" variant="ghost" size="sm" @click="close">Cancel</Button>
            <Button type="submit" size="sm" :disabled="!draft.trim()">Reply</Button>
          </div>
        </form>
      </div>
    </div>
    <ul v-if="comment.replies?.length" class="er-comment-replies" :data-flat="depth >= thread.maxDepth.value ? '' : undefined">
      <CommentItem v-for="reply in comment.replies" :key="reply.id" :comment="reply" :depth="depth + 1" />
    </ul>
  </li>
</template>
