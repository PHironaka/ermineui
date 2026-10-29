<script setup lang="ts">
import { computed } from 'vue'
import { defaultRequirements, scorePassword, type PasswordRequirement, type PasswordScore } from './strength'

const props = withDefaults(
  defineProps<{
    /** The password as typed so far. */
    password: string
    /** The rules to tick off underneath. Pass an empty list to show the bar alone. */
    requirements?: readonly PasswordRequirement[]
    /** What each score is called, weakest first. */
    labels?: readonly [string, string, string, string]
    /** Work the score out your own way, e.g. with zxcvbn. Return 0 to 4. */
    score?: (password: string) => PasswordScore
  }>(),
  { requirements: () => defaultRequirements, labels: () => ['Weak', 'Fair', 'Good', 'Strong'] as const },
)

const level = computed(() => (props.score ?? scorePassword)(props.password))
const word = computed(() => (level.value ? props.labels[level.value - 1] : ''))
const checks = computed(() => props.requirements.map((requirement) => ({ label: requirement.label, met: requirement.test(props.password) })))
</script>

<template>
  <div class="er-password-strength" :data-score="level">
    <div class="er-password-strength-top">
      <div class="er-password-strength-bars" aria-hidden="true">
        <span v-for="step in 4" :key="step" :data-on="step <= level ? '' : undefined" />
      </div>
      <!-- Announced a moment after typing stops, rather than the bar being described at every key. -->
      <span class="er-password-strength-word" role="status"><template v-if="word"><span class="er-password-strength-hidden">Password strength: </span>{{ word }}</template></span>
    </div>
    <ul v-if="checks.length" class="er-password-strength-list">
      <li v-for="check in checks" :key="check.label" :data-met="check.met ? '' : undefined">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path v-if="check.met" d="M5 12.500l4.500 4.500L19 7.500" />
          <circle v-else cx="12" cy="12" r="3" />
        </svg>
        <span class="er-password-strength-hidden">{{ check.met ? 'Met: ' : 'Not met: ' }}</span>{{ check.label }}
      </li>
    </ul>
  </div>
</template>

<style>
@layer components {
  .er-password-strength {
    display: grid;
    gap: 0.5rem;
    width: 100%;
    --er-password-strength-color: var(--er-destructive);
  }

  .er-password-strength[data-score='2'] {
    --er-password-strength-color: var(--er-warning);
  }

  .er-password-strength[data-score='3'],
  .er-password-strength[data-score='4'] {
    --er-password-strength-color: var(--er-success);
  }

  .er-password-strength-top {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .er-password-strength-bars {
    display: grid;
    flex: 1;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.25rem;
  }

  .er-password-strength-bars span {
    height: 0.25rem;
    border-radius: 999px;
    background: var(--er-muted);
    transition: background-color var(--er-duration);
  }

  .er-password-strength-bars span[data-on] {
    background: var(--er-password-strength-color);
  }

  /* How many bars are lit, and the word, carry the meaning; the colour only backs them up. */
  .er-password-strength-word {
    min-width: 3.25rem;
    font-size: 0.8125rem;
    font-weight: var(--er-weight-medium);
    line-height: 1rem;
    text-align: right;
  }

  .er-password-strength-list {
    display: grid;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    line-height: 1.25rem;
    list-style: none;
  }

  .er-password-strength-list li {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .er-password-strength-list li[data-met] {
    color: var(--er-foreground);
  }

  .er-password-strength-list svg {
    flex-shrink: 0;
    width: 0.875rem;
    height: 0.875rem;
  }

  .er-password-strength-list li[data-met] svg {
    color: var(--er-success);
  }

  .er-password-strength-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
