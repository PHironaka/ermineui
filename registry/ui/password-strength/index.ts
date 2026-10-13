/** Password strength — a four-step bar and a word for how strong a password is as it is typed, with a checklist of the rules it must meet. */
export { default as PasswordStrength } from './PasswordStrength.vue'
export { defaultRequirements, scorePassword, type PasswordRequirement, type PasswordScore } from './strength'
