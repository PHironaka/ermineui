<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Button } from '../button'
import { Field } from '../field'
import { Input } from '../input'

const props = withDefaults(
  defineProps<{
    /** The code in use. While set, it is shown with a button to take it off, in place of the field. */
    applied?: string
    /** Why the last code was turned down, e.g. "That code has expired." */
    error?: string
    /** Set while the code is being checked: the button shows a spinner and cannot be pressed twice. */
    loading?: boolean
    label?: string
    applyLabel?: string
  }>(),
  { label: 'Discount code', applyLabel: 'Apply' },
)

const emit = defineEmits<{
  /** A code was entered. Check it on your server, then set `applied` or `error`. */
  apply: [code: string]
  /** The code in use was taken off. */
  remove: []
}>()

const root = ref<HTMLElement | null>(null)
const code = ref('')

function submit() {
  const entered = code.value.trim()
  if (entered) emit('apply', entered)
}

// The field and the tag swap places, so focus would be lost with whichever one went: it follows to the other.
watch(
  () => props.applied,
  async (now, before) => {
    if (!now === !before || !root.value?.contains(document.activeElement)) return
    if (now) code.value = ''
    await nextTick()
    root.value?.querySelector<HTMLElement>(now ? '.er-promo-code-applied button' : 'input')?.focus()
  },
)
</script>

<template>
  <div ref="root" class="er-promo-code">
    <div v-if="applied" class="er-promo-code-applied">
      <span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h7l9 9-7 7-9-9ZM8 8v.01" /></svg>
        <span class="er-promo-code-hidden">{{ label }} in use: </span>{{ applied }}
      </span>
      <button type="button" @click="emit('remove')">Remove<span class="er-promo-code-hidden"> {{ label.toLowerCase() }} {{ applied }}</span></button>
    </div>
    <!-- novalidate: an empty field simply does nothing, and what is wrong with a code only your server can say. -->
    <form v-else novalidate @submit.prevent="submit">
      <Field v-slot="{ control }" :label="label" :error="error">
        <div class="er-promo-code-row">
          <Input v-bind="control" v-model="code" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" />
          <Button type="submit" variant="outline" :loading="loading">{{ applyLabel }}</Button>
        </div>
      </Field>
    </form>
  </div>
</template>

<style>
@layer components {
  .er-promo-code {
    min-width: 0;
  }

  .er-promo-code-row {
    display: flex;
    gap: 0.5rem;
  }

  .er-promo-code-applied {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: 0.875rem;
  }

  .er-promo-code-applied > span {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.125rem 0.5rem;
    border-radius: var(--er-radius-sm);
    background: var(--er-secondary);
    color: var(--er-secondary-foreground);
    font-weight: var(--er-weight-medium);
  }

  .er-promo-code-applied svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  .er-promo-code-applied button {
    padding: 0;
    border: 0;
    border-radius: var(--er-radius-sm);
    background: transparent;
    color: var(--er-muted-foreground);
    font: inherit;
    font-size: 0.8125rem;
    text-decoration: underline;
    text-underline-offset: 0.2em;
    cursor: pointer;
  }

  .er-promo-code-applied button:hover {
    color: var(--er-foreground);
  }

  .er-promo-code-applied button:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-promo-code-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
