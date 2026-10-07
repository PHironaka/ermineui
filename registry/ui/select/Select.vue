<script setup lang="ts">
import { reactive, ref, toRef, useId } from 'vue'
import { provideSelect } from './context'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  /** Submit the value with a form under this name. */
  name?: string
  disabled?: boolean
}>()

const value = defineModel<string>()
const open = defineModel<boolean>('open', { default: false })

function setOpen(next: boolean) {
  open.value = next && !props.disabled
}

provideSelect({
  value,
  open,
  setOpen,
  select: (next) => {
    value.value = next
    setOpen(false)
  },
  disabled: toRef(props, 'disabled'),
  anchor: ref(null),
  contentId: useId(),
  labels: reactive(new Map<string, string>()),
})
</script>

<template>
  <slot :open="open" :value="value" />
  <input v-if="name" type="hidden" :name="name" :value="value ?? ''" :disabled="disabled" />
</template>
