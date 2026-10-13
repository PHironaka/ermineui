/** Diff viewer — two versions of a text compared line by line, with what was taken out and put in marked, in one column or side by side. */
export { default as DiffViewer } from './DiffViewer.vue'
export { diffHunks, diffLines, diffStats, type DiffHunk, type DiffLine } from './diff'
