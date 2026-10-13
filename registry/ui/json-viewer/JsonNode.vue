<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  value: unknown
  /** The key this value sits under. Items of an array have none. */
  name?: string
  depth: number
  expandDepth: number
  /** The last one in its parent, so no comma follows. */
  last?: boolean
}>()

const type = computed(() => {
  const value = props.value
  if (value === null || value === undefined) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value === 'object' ? 'object' : typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? typeof value : 'string'
})
const branch = computed(() => type.value === 'array' || type.value === 'object')
const entries = computed<Array<[string | undefined, unknown]>>(() => {
  if (type.value === 'array') return (props.value as unknown[]).map((item) => [undefined, item])
  if (type.value === 'object') return Object.entries(props.value as Record<string, unknown>)
  return []
})
const brackets = computed(() => (type.value === 'array' ? ['[', ']'] : ['{', '}']))
const count = computed(() => `${entries.value.length} ${type.value === 'array' ? (entries.value.length === 1 ? 'item' : 'items') : entries.value.length === 1 ? 'key' : 'keys'}`)

const open = ref(props.depth < props.expandDepth)
</script>

<template>
  <li class="er-json-node">
    <template v-if="branch && entries.length">
      <button type="button" class="er-json-node-toggle" :aria-expanded="open" @click="open = !open">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        <span v-if="name !== undefined" class="er-json-node-key">{{ JSON.stringify(name) }}<span class="er-json-node-punctuation">: </span></span>
        <span class="er-json-node-punctuation">{{ brackets[0] }}</span>
        <template v-if="!open">
          <span class="er-json-node-count">{{ count }}</span>
          <span class="er-json-node-punctuation">{{ brackets[1] }}{{ last ? '' : ',' }}</span>
        </template>
      </button>
      <template v-if="open">
        <ul>
          <JsonNode v-for="([key, item], index) in entries" :key="key ?? index" :value="item" :name="key" :depth="depth + 1" :expand-depth="expandDepth" :last="index === entries.length - 1" />
        </ul>
        <span class="er-json-node-punctuation">{{ brackets[1] }}{{ last ? '' : ',' }}</span>
      </template>
    </template>
    <template v-else>
      <span v-if="name !== undefined" class="er-json-node-key">{{ JSON.stringify(name) }}<span class="er-json-node-punctuation">: </span></span>
      <span v-if="branch" class="er-json-node-punctuation">{{ brackets.join('') }}</span>
      <span v-else class="er-json-node-value" :data-type="type">{{ type === 'null' ? 'null' : JSON.stringify(value) }}</span>
      <span v-if="!last" class="er-json-node-punctuation">,</span>
    </template>
  </li>
</template>
