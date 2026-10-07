<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '../input'
import InputGroup from './InputGroup.vue'

// Attributes such as id, autocomplete and aria-invalid belong on the input itself.
defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    showLabel?: string
    hideLabel?: string
  }>(),
  { showLabel: 'Show password', hideLabel: 'Hide password' },
)

const model = defineModel<string>({ default: '' })
const visible = ref(false)
</script>

<template>
  <InputGroup>
    <Input v-bind="$attrs" v-model="model" :type="visible ? 'text' : 'password'" autocapitalize="off" spellcheck="false" />
    <template #suffix>
      <!-- A pressed state plus a name that says what a press will do. -->
      <button type="button" class="sb-input-group-button" :aria-label="visible ? hideLabel : showLabel" :aria-pressed="visible" @click="visible = !visible">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          <path v-if="visible" d="M4 4l16 16" />
        </svg>
      </button>
    </template>
  </InputGroup>
</template>
