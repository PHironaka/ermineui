/**
 * A mask is the shape of the finished text. `#` stands for a digit, `A` for a letter and `*` for either;
 * every other character is put in for the typist: '##/##', '(###) ###-####', 'AA## ####'.
 */
const slots: Record<string, RegExp> = {
  '#': /\d/,
  A: /[a-z]/i,
  '*': /[a-z\d]/i,
}

/** Ready-made masks for the fields a checkout needs. */
export const masks = {
  /** Sixteen digits in fours. Covers Visa, Mastercard and Discover; American Express groups 4-6-5. */
  card: '#### #### #### ####',
  amex: '#### ###### #####',
  /** Month and year, MM/YY. */
  expiry: '##/##',
  cvc: '####',
  phoneUS: '(###) ###-####',
  zipUS: '#####',
} as const

/** Whether a mask takes digits only, in which case a phone can show its number pad. */
export const digitsOnly = (mask: string) => !/[A*]/.test(mask)

/** What the typist entered, without the characters the mask adds. Anything the mask has no place for is dropped. */
export function unmask(text: string, mask: string): string {
  const wanted = [...mask].filter((character) => character in slots)
  let raw = ''
  for (const character of text) {
    const slot = wanted[raw.length]
    if (!slot) break
    if (slots[slot]!.test(character)) raw += character
  }
  return raw
}

/**
 * The raw characters laid out in the mask. Separators appear only once there is something to put after
 * them, so Backspace never gets stuck on one: '12' stays '12', and '123' becomes '12/3'.
 */
export function applyMask(raw: string, mask: string): string {
  let out = ''
  let used = 0
  for (const character of mask) {
    if (used >= raw.length) break
    out += character in slots ? raw[used++] : character
  }
  return out
}

/** Where the caret belongs in masked text so that `count` raw characters sit before it. */
export function caretAfter(masked: string, mask: string, count: number): number {
  if (count <= 0) return 0
  let seen = 0
  for (let index = 0; index < masked.length; index++) {
    if (mask[index]! in slots && ++seen === count) return index + 1
  }
  return masked.length
}
