import { createContext } from '../../lib/context'

export interface FabContext {
  close: () => void
}

export const [provideFab, useFab] = createContext<FabContext>('Fab')
