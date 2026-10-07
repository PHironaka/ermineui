import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface QuestionnaireStepEntry {
  id: string
  title: Ref<string>
  /** Left out of the sequence while true — for questions that depend on an earlier answer. */
  skip: Ref<boolean>
  /** Run before moving on. Return false (or a promise of false) to stay on the step. */
  validate: () => boolean | void | Promise<boolean | void>
}

export interface QuestionnaireContext {
  /** Adds a step in the order the steps are written; returns the function that removes it. */
  register: (step: QuestionnaireStepEntry) => () => void
  /** id of the step on screen. */
  currentId: Ref<string | undefined>
}

export const [provideQuestionnaire, useQuestionnaire] = createContext<QuestionnaireContext>('Questionnaire')
