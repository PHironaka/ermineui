import type { Ref } from 'vue'
import { createContext } from '../../lib/context'

export interface DialogContext {
  open: Ref<boolean>
  setOpen: (open: boolean) => void
  titleId: string
  descriptionId: string
  /** Set by DialogDescription, so the dialog only points at a description that exists. */
  hasDescription: Ref<boolean>
}

export const [provideDialog, useDialog] = createContext<DialogContext>('Dialog')
