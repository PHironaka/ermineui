import { reactive, toValue, watch, type MaybeRefOrGetter } from 'vue'

/** Returns the message to show when the value is not acceptable, or nothing when it is. */
export type Rule<T = unknown> = (value: T) => string | undefined | null | false

const isEmpty = (value: unknown) =>
  value === undefined || value === null || value === '' || value === false || (Array.isArray(value) && value.length === 0)

/** Something must be entered, chosen or ticked. */
export const required =
  (message = 'This field is required.'): Rule =>
  (value) =>
    isEmpty(value) && message

// The rules below pass on an empty value, so "optional, but if given it must be an email" needs no extra code.
// Combine with required() when the field must be filled in.

export const minLength =
  (length: number, message = `Use at least ${length} characters.`): Rule =>
  (value) =>
    !isEmpty(value) && String(value).length < length && message

export const maxLength =
  (length: number, message = `Use at most ${length} characters.`): Rule =>
  (value) =>
    !isEmpty(value) && String(value).length > length && message

export const pattern =
  (expression: RegExp, message = 'This is not in the expected format.'): Rule =>
  (value) =>
    !isEmpty(value) && !expression.test(String(value)) && message

export const email = (message = 'Enter an email address, such as name@example.com.'): Rule => pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message)

export const min =
  (limit: number, message = `Enter ${limit} or more.`): Rule =>
  (value) =>
    !isEmpty(value) && Number(value) < limit && message

export const max =
  (limit: number, message = `Enter ${limit} or less.`): Rule =>
  (value) =>
    !isEmpty(value) && Number(value) > limit && message

/** The first message from `rules` that applies to `value`, or undefined when every rule passes. */
export function check<T>(value: T, rules: ReadonlyArray<Rule<T>> = []): string | undefined {
  for (const rule of rules) {
    const message = rule(value)
    if (message) return message
  }
  return undefined
}

/**
 * Validation for a group of values.
 *
 *   const form = useValidation(() => answers, { email: [required(), email()] })
 *   form.errors.email      the message to show, once the field has been checked
 *   form.validate()        check everything (or just the named fields); true when all pass
 *   form.touch('email')    check one field — bind it to @blur
 *
 * A field is quiet until it is checked. Once it shows an error, it is re-checked as the
 * value changes, so the message clears the moment the problem is fixed.
 */
export function useValidation<T extends Record<string, unknown>>(
  values: MaybeRefOrGetter<T>,
  rules: { [K in keyof T]?: ReadonlyArray<Rule<T[K]>> },
) {
  const keys = Object.keys(rules) as Array<keyof T & string>
  const errors = reactive({}) as { [K in keyof T]?: string }

  function touch(key: keyof T & string): boolean {
    const message = check(toValue(values)[key], rules[key])
    ;(errors as Record<string, string | undefined>)[key] = message
    return !message
  }

  function validate(only: ReadonlyArray<keyof T & string> = keys): boolean {
    // Every field is checked, not just up to the first failure, so all the messages appear at once.
    return only.map(touch).every(Boolean)
  }

  function reset() {
    for (const key of keys) (errors as Record<string, string | undefined>)[key] = undefined
  }

  for (const key of keys) {
    watch(
      () => toValue(values)[key],
      () => {
        if (errors[key]) touch(key)
      },
      { deep: true },
    )
  }

  return { errors, validate, touch, reset }
}
