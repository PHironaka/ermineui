export interface CommentNode {
  id: string
  author: string
  /** The author's picture. Their initials are shown when there is none. */
  avatar?: string
  /** The comment itself, as plain text. Line breaks are kept. */
  body: string
  /** When it was written, as an ISO date: 2026-09-14 or 2026-09-14T10:30:00Z. */
  date?: string
  /** Something to show beside the name, such as "Author" or "Staff". */
  badge?: string
  /** The reader may delete this comment. */
  canDelete?: boolean
  replies?: CommentNode[]
}

/** A name's initials, for the avatar of someone without a picture. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  return ((words[0]?.[0] ?? '') + (words.length > 1 ? words[words.length - 1]![0] : '')).toUpperCase()
}

/** How many comments there are, counting every reply. */
export function countComments(comments: readonly CommentNode[]): number {
  return comments.reduce((sum, comment) => sum + 1 + countComments(comment.replies ?? []), 0)
}
