<script setup lang="ts">
import { computed, onBeforeUnmount, toRef, useId } from 'vue'
import { useQuestionnaire } from './context'

const props = defineProps<{
  /** The question, or the name of this group of questions. */
  title: string
  description?: string
  /** Leave this step out, e.g. when an earlier answer makes it irrelevant. */
  skip?: boolean
  /** Checked when the reader presses Next. Return false to keep them here — show the reasons yourself. */
  validate?: () => boolean | void | Promise<boolean | void>
}>()

const questionnaire = useQuestionnaire()
const id = useId()
const current = computed(() => questionnaire.currentId.value === id)

const unregister = questionnaire.register({
  id,
  title: toRef(props, 'title'),
  skip: toRef(props, 'skip'),
  validate: () => props.validate?.(),
})
onBeforeUnmount(unregister)
</script>

<template>
  <!-- Kept in the page while hidden, so anything typed is still there when the reader comes back. -->
  <section v-show="current" class="sb-questionnaire-step" :aria-labelledby="`${id}-title`" :data-step="id">
    <!-- Focus lands here when the step appears, so screen readers announce the new question. -->
    <h3 :id="`${id}-title`" class="sb-questionnaire-title" tabindex="-1">{{ title }}</h3>
    <p v-if="description" class="sb-questionnaire-description">{{ description }}</p>
    <div class="sb-questionnaire-fields"><slot /></div>
  </section>
</template>
