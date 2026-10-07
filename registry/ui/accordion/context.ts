import type { ComputedRef, Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface AccordionContext {
  isOpen: (value: string) => boolean
  toggle: (value: string) => void
  disabled: Ref<boolean>
}

export interface AccordionItemContext {
  open: ComputedRef<boolean>
  disabled: ComputedRef<boolean>
  toggle: () => void
  triggerId: string
  contentId: string
}

export const [provideAccordion, useAccordion] = createContext<AccordionContext>('Accordion')
export const [provideAccordionItem, useAccordionItem] = createContext<AccordionItemContext>('AccordionItem')
