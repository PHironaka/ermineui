/** 0 is nothing typed; 1 weak, 2 fair, 3 good, 4 strong. */
export type PasswordScore = 0 | 1 | 2 | 3 | 4

export interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

/** The usual house rules. Pass your own list to match what your server really enforces. */
export const defaultRequirements: readonly PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (password) => password.length >= 8 },
  { label: 'A lower-case and an upper-case letter', test: (password) => /[a-z]/.test(password) && /[A-Z]/.test(password) },
  { label: 'A number or a symbol', test: (password) => /[^A-Za-z\s]/.test(password) },
]

// The ones attackers try first. A password built on one of these is weak however it is dressed up.
const common = ['password', 'passw0rd', '123456', '12345678', 'qwerty', 'letmein', 'welcome', 'admin', 'iloveyou', 'abc123', 'monkey', 'dragon', 'football', '111111']
const runs = ['abcdefghijklmnopqrstuvwxyz', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm', '01234567890']

/**
 * A rough guess at how hard a password is to crack, from its length and how varied it is, marked down for
 * the tricks that add length without adding difficulty. It is a nudge for the person typing, not a check:
 * the real rules belong on your server.
 */
export function scorePassword(password: string): PasswordScore {
  if (!password) return 0
  const lower = password.toLowerCase()

  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z\d]/].filter((kind) => kind.test(password)).length
  // Repeated characters count once: "aaaaaaaa" is as easy to guess as "a".
  const distinct = new Set(password).size
  let points = Math.min(password.length, distinct * 2) * (1 + (kinds - 1) * 0.35)

  if (common.some((word) => lower.includes(word))) points *= 0.35
  // Three or more keys in a row from the alphabet, the number line or the keyboard.
  for (const run of runs) {
    for (let start = 0; start + 4 <= run.length; start++) {
      const piece = run.slice(start, start + 4)
      if (lower.includes(piece) || lower.includes([...piece].reverse().join(''))) {
        points *= 0.7
        break
      }
    }
  }

  if (points < 8) return 1
  if (points < 12) return 2
  if (points < 18) return 3
  return 4
}
