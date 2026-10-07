<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, useId } from 'vue'
import { useCommand, useCommandGroup } from './context'

const props = defineProps<{
  disabled?: boolean
  /** Extra words this item can be found by, on top of its own text: "theme appearance dark". */
  keywords?: string
  /** Key hint shown at the right-hand end, e.g. "⌘S". For show only — bind the key yourself. */
  shortcut?: string
}>()

const emit = defineEmits<{
  select: []
}>()

const command = useCommand()
const group = useCommandGroup()
const label = ref<HTMLElement | null>(null)
const id = useId()

const visible = computed(() => command.matches(command.entries.get(id)?.text ?? ''))

function register() {
  command.entries.set(id, { text: `${label.value?.textContent?.trim() ?? ''} ${props.keywords ?? ''}`, group })
}

onMounted(register)
onUpdated(register)
onBeforeUnmount(() => command.entries.delete(id))

function run() {
  if (props.disabled) return
  emit('select')
  command.ran()
}
</script>

<template>
  <!-- Removed from the page while filtered out, so the arrow keys only ever land on what is showing. -->
  <div
    v-show="visible"
    :id="id"
    :role="visible ? 'option' : 'none'"
    class="sb-command-item"
    :aria-selected="command.activeId.value === id"
    :aria-disabled="disabled || undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-active="command.activeId.value === id ? '' : undefined"
    @click="run"
    @pointermove="!disabled && (command.activeId.value = id)"
  >
    <slot name="icon" />
    <span ref="label"><slot /></span>
    <span v-if="shortcut" class="sb-command-shortcut" aria-hidden="true">{{ shortcut }}</span>
  </div>
</template>
