<script setup lang="ts">
import { computed, ref } from 'vue'
import { Progress } from '../progress'

// Attributes such as id and name belong on the real file input.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Allow more than one file. */
    multiple?: boolean
    /** File types to allow, as for a native input: ".pdf,.png", "image/*", "text/csv". */
    accept?: string
    /** Largest size allowed for one file, in bytes. */
    maxSize?: number
    /** Most files allowed. */
    maxFiles?: number
    disabled?: boolean
    /** Upload progress per file, from 0 to 100, keyed by file name. Uploading itself is up to you. */
    progress?: Record<string, number>
  }>(),
  { multiple: false },
)

const emit = defineEmits<{
  /** Files that were turned away, each with the reason shown to the reader. */
  reject: [rejected: Array<{ file: File; reason: string }>]
}>()

const files = defineModel<File[]>({ default: () => [] })

const input = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const problems = ref<string[]>([])
/** Said aloud when the list of files changes: after the picker closes, nothing else reports what was taken. */
const status = ref('')

const limit = computed(() => (props.multiple ? (props.maxFiles ?? Infinity) : 1))

// Fixed locale, so server and browser write sizes the same way.
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
function size(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${number.format(bytes / 1024)} KB`
  if (bytes < 1024 ** 3) return `${number.format(bytes / 1024 ** 2)} MB`
  return `${number.format(bytes / 1024 ** 3)} GB`
}

/** The file picker applies `accept` itself; dropped files skip it, so the same rule is checked here. */
function accepted(file: File): boolean {
  if (!props.accept) return true
  return props.accept
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .some((entry) => {
      if (entry.startsWith('.')) return file.name.toLowerCase().endsWith(entry)
      if (entry.endsWith('/*')) return file.type.toLowerCase().startsWith(entry.slice(0, -1))
      return file.type.toLowerCase() === entry
    })
}

function add(incoming: File[]) {
  const kept = props.multiple ? [...files.value] : []
  const rejected: Array<{ file: File; reason: string }> = []
  for (const file of incoming) {
    if (!accepted(file)) rejected.push({ file, reason: `${file.name} is not an allowed file type.` })
    else if (props.maxSize !== undefined && file.size > props.maxSize) rejected.push({ file, reason: `${file.name} is larger than ${size(props.maxSize)}.` })
    else if (kept.some((other) => other.name === file.name && other.size === file.size)) continue
    else if (kept.length >= limit.value) rejected.push({ file, reason: `${file.name} was left out: only ${limit.value} ${limit.value === 1 ? 'file is' : 'files are'} allowed.` })
    else kept.push(file)
  }
  const added = kept.filter((file) => !files.value.includes(file))
  status.value = added.length ? `${added.map((file) => file.name).join(', ')} added` : ''
  files.value = kept
  problems.value = rejected.map((item) => item.reason)
  if (rejected.length) emit('reject', rejected)
}

function onChange() {
  add(Array.from(input.value?.files ?? []))
  // Cleared so that choosing the same file again (after removing it) still counts as a change.
  if (input.value) input.value.value = ''
}

function onDrop(event: DragEvent) {
  dragging.value = false
  if (!props.disabled) add(Array.from(event.dataTransfer?.files ?? []))
}

function remove(file: File) {
  status.value = `${file.name} removed`
  files.value = files.value.filter((other) => other !== file)
  problems.value = []
  input.value?.focus()
}
</script>

<template>
  <div class="er-file-upload">
    <!-- A label around a real file input: pressing it opens the picker, and Tab, Enter and Space work as usual. -->
    <label
      class="er-file-upload-zone"
      :data-dragging="dragging ? '' : undefined"
      :data-disabled="disabled ? '' : undefined"
      @dragenter.prevent="dragging = !disabled"
      @dragover.prevent="dragging = !disabled"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <input ref="input" v-bind="$attrs" type="file" :multiple="multiple" :accept="accept" :disabled="disabled" @change="onChange" />
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
      </svg>
      <span class="er-file-upload-text">
        <slot><strong>Choose {{ multiple ? 'files' : 'a file' }}</strong> or drop {{ multiple ? 'them' : 'it' }} here</slot>
      </span>
      <span v-if="$slots.hint" class="er-file-upload-hint"><slot name="hint" /></span>
    </label>

    <!-- Always in the page, empty until a file is turned away, so the reasons are reliably announced. -->
    <div class="er-file-upload-problems" role="alert">
      <p v-for="problem in problems" :key="problem">{{ problem }}</p>
    </div>

    <span class="er-file-upload-status" role="status">{{ status }}</span>

    <ul v-if="files.length" class="er-file-upload-list" aria-label="Chosen files">
      <li v-for="file in files" :key="`${file.name}-${file.size}`">
        <div class="er-file-upload-row">
          <span class="er-file-upload-name">{{ file.name }}</span>
          <span class="er-file-upload-size">{{ size(file.size) }}</span>
          <button type="button" :aria-label="`Remove ${file.name}`" :disabled="disabled" @click="remove(file)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <Progress v-if="progress?.[file.name] !== undefined" :value="progress[file.name]" :aria-label="`Uploading ${file.name}`" />
      </li>
    </ul>
  </div>
</template>

<style>
@layer components {
  .er-file-upload {
    position: relative;
    display: grid;
    gap: 0.75rem;
    width: 100%;
    min-width: 0;
  }

  .er-file-upload-zone {
    position: relative;
    display: grid;
    justify-items: center;
    gap: 0.375rem;
    padding: 1.5rem 1rem;
    border: 1px dashed var(--er-input);
    border-radius: var(--er-radius-lg);
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    text-align: center;
    cursor: pointer;
    transition:
      background-color var(--er-duration),
      border-color var(--er-duration);
  }

  .er-file-upload-zone:hover,
  .er-file-upload-zone[data-dragging] {
    border-color: var(--er-ring);
    background: color-mix(in oklab, var(--er-accent) 60%, transparent);
  }

  .er-file-upload-zone:has(input:focus-visible) {
    border-color: var(--er-ring);
    outline: 2px solid color-mix(in oklab, var(--er-ring) 45%, transparent);
  }

  .er-file-upload-zone[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }

  /* Hidden from sight but still focusable and still the thing screen readers and forms talk to. */
  .er-file-upload-zone input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .er-file-upload-zone svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .er-file-upload-text strong {
    color: var(--er-foreground);
    font-weight: var(--er-weight-medium);
  }

  .er-file-upload-hint {
    font-size: 0.8125rem;
  }

  .er-file-upload-problems,
  .er-file-upload-list {
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    font-size: 0.8125rem;
    list-style: none;
  }

  .er-file-upload-problems {
    gap: 0.125rem;
    color: var(--er-destructive);
  }

  .er-file-upload-problems p {
    margin: 0;
  }

  .er-file-upload-status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .er-file-upload-problems:empty {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .er-file-upload-list li {
    display: grid;
    gap: 0.5rem;
    padding: 0.5rem 0.5rem 0.5rem 0.75rem;
    border: 1px solid var(--er-border);
    border-radius: var(--er-radius-md);
  }

  .er-file-upload-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  .er-file-upload-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-weight: var(--er-weight-medium);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .er-file-upload-size {
    flex-shrink: 0;
    color: var(--er-muted-foreground);
    font-variant-numeric: tabular-nums;
  }

  .er-file-upload-row button {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-muted-foreground);
    cursor: pointer;
  }

  .er-file-upload-row button:hover {
    background: var(--er-accent);
    color: var(--er-foreground);
  }

  .er-file-upload-row button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 1px;
  }

  .er-file-upload-row svg {
    width: 0.875rem;
    height: 0.875rem;
  }
}
</style>
