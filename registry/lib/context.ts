import { inject, provide, type InjectionKey } from 'vue'

/**
 * Typed provide/inject pair for compound components.
 * `const [provideTabs, useTabs] = createContext<TabsContext>('Tabs')`
 */
export function createContext<T>(name: string) {
  const key: InjectionKey<T> = Symbol(name)

  function provideContext(value: T): T {
    provide(key, value)
    return value
  }

  function useContext(): T {
    const value = inject(key, null)
    if (value === null) throw new Error(`[ermine] This component must be used inside <${name}>.`)
    return value
  }

  return [provideContext, useContext] as const
}
