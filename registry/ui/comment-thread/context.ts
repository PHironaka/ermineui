import type { Ref } from 'vue'
import { createContext } from '../../lib/context'
import type { CommentNode } from './types'

export interface CommentThreadContext {
  /** The id of the comment whose reply box is open. Only one is open at a time. */
  replyingTo: Ref<string | undefined>
  maxDepth: Ref<number>
  locale: Ref<string>
  canReply: Ref<boolean>
  reply: (text: string, parent: CommentNode) => void
  remove: (comment: CommentNode) => void
}

export const [provideCommentThread, useCommentThread] = createContext<CommentThreadContext>('CommentThread')
