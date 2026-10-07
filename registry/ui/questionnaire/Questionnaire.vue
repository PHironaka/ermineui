<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { Button } from '../button'
import { Progress } from '../progress'
import { Stepper } from '../stepper'
import { provideQuestionnaire, type QuestionnaireStepEntry } from './context'

const props = withDefaults(
  defineProps<{
    /** How progress is shown: a bar with "Step 2 of 4", the named steps, or nothing. */
    indicator?: 'progress' | 'stepper' | 'none'
    backLabel?: string
    nextLabel?: string
    /** Text of the button on the last step. */
    submitLabel?: string
    /** What the questionnaire is for, for screen readers. */
    label?: string
  }>(),
  { indicator: 'progress', backLabel: 'Back', nextLabel: 'Next', submitLabel: 'Submit' },
)

const emit = defineEmits<{
  /** Next was pressed on the last step, and that step's check passed. */
  submit: []
}>()

/** The step on screen, starting at 1 and counting only steps that are not skipped. */
const step = defineModel<number>('step', { default: 1 })

const root = ref<HTMLElement | null>(null)
const registered = shallowRef<QuestionnaireStepEntry[]>([])
const busy = ref(false)

const steps = computed(() => registered.value.filter((entry) => !entry.skip.value))
const index = computed(() => Math.max(0, Math.min(step.value - 1, steps.value.length - 1)))
const current = computed(() => steps.value[index.value])
const isLast = computed(() => index.value === steps.value.length - 1)

provideQuestionnaire({
  register: (entry) => {
    registered.value = [...registered.value, entry]
    return () => {
      registered.value = registered.value.filter((other) => other !== entry)
    }
  },
  currentId: computed(() => current.value?.id),
})

// If steps drop out (an answer changed and some are now skipped), stay within the ones that are left.
watch(
  () => steps.value.length,
  (count) => {
    if (count && step.value > count) step.value = count
  },
)

async function goTo(next: number) {
  step.value = Math.max(1, Math.min(next, steps.value.length))
  await nextTick()
  root.value?.querySelector<HTMLElement>(`[data-step="${current.value?.id}"] .sb-questionnaire-title`)?.focus()
}

async function next() {
  if (busy.value || !current.value) return
  busy.value = true
  try {
    if ((await current.value.validate()) === false) return
    if (isLast.value) emit('submit')
    else await goTo(step.value + 1)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <!-- A real form, so Enter in a text field moves on just as pressing Next does. -->
  <form ref="root" class="sb-questionnaire" novalidate :aria-label="label" @submit.prevent="next">
    <div v-if="indicator === 'progress' && steps.length" class="sb-questionnaire-progress">
      <p>Step {{ index + 1 }} of {{ steps.length }}</p>
      <Progress :value="index + 1" :max="steps.length" aria-label="Steps completed" />
    </div>
    <Stepper
      v-else-if="indicator === 'stepper' && steps.length"
      :model-value="index + 1"
      :steps="steps.map((entry) => entry.title.value)"
      @update:model-value="goTo"
    />

    <slot :step="index + 1" :count="steps.length" :go-to="goTo" />

    <div class="sb-questionnaire-footer">
      <Button v-if="index > 0" variant="outline" :disabled="busy" @click="goTo(step - 1)">{{ backLabel }}</Button>
      <Button type="submit" :disabled="busy">{{ isLast ? submitLabel : nextLabel }}</Button>
    </div>
  </form>
</template>

<style>
@layer components {
  .sb-questionnaire {
    display: grid;
    gap: 1.5rem;
    width: 100%;
    min-width: 0;
  }

  .sb-questionnaire-progress {
    display: grid;
    gap: 0.5rem;
  }

  .sb-questionnaire-progress p {
    margin: 0;
    color: var(--sb-muted-foreground);
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
  }

  .sb-questionnaire-step {
    display: grid;
    gap: 0.5rem;
    min-width: 0;
  }

  .sb-questionnaire-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.3;
    outline: none;
  }

  .sb-questionnaire-description {
    margin: 0;
    color: var(--sb-muted-foreground);
    font-size: 0.875rem;
  }

  .sb-questionnaire-fields {
    display: grid;
    gap: 1rem;
    margin-top: 0.75rem;
  }

  .sb-questionnaire-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}
</style>
