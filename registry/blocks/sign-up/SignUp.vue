<script setup lang="ts">
import { reactive } from 'vue'
import { Alert, AlertDescription } from '../../ui/alert'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import { Checkbox } from '../../ui/checkbox'
import { Field, email, minLength, required, useValidation } from '../../ui/field'
import { Input } from '../../ui/input'
import { PasswordInput } from '../../ui/input-group'
import { Label } from '../../ui/label'
import { PasswordStrength } from '../../ui/password-strength'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    /** Set while the account is being made: the button shows a spinner and cannot be pressed twice. */
    loading?: boolean
    /** What went wrong on the server, e.g. "There is already an account with that email." */
    error?: string
    /** The shortest password allowed. Keep it the same as the rule on your server. */
    minPassword?: number
    /** Where the terms are. With either link, a box to agree has to be ticked. */
    termsHref?: string
    privacyHref?: string
    /** Where "Sign in" goes. Leave out to hide the line. */
    signInHref?: string
  }>(),
  { title: 'Create an account', description: 'It takes less than a minute.', minPassword: 8 },
)

const emit = defineEmits<{
  /** The form passed its checks. Send these to your server. */
  submit: [values: { name: string; email: string; password: string }]
}>()

const values = reactive({ name: '', email: '', password: '', agreed: false })
const form = useValidation(values, {
  name: [required('Enter your name.')],
  email: [required('Enter your email address.'), email()],
  password: [required('Choose a password.'), minLength(props.minPassword, `Use at least ${props.minPassword} characters.`)],
  agreed: [(value) => Boolean(props.termsHref || props.privacyHref) && !value && 'Tick the box to agree before continuing.'],
})

function submit() {
  if (!form.validate()) return
  const { name, email: address, password } = values
  emit('submit', { name, email: address, password })
}
</script>

<template>
  <Card class="er-sign-up">
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>
      <CardDescription v-if="description">{{ description }}</CardDescription>
    </CardHeader>

    <!-- novalidate: the messages come from the rules above, so they look and read the same in every browser. -->
    <form novalidate @submit.prevent="submit">
      <CardContent class="er-sign-up-fields">
        <Alert v-if="error" variant="destructive">
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>

        <Field v-slot="{ control }" label="Name" required :error="form.errors.name">
          <Input v-bind="control" v-model="values.name" name="name" autocomplete="name" />
        </Field>
        <Field v-slot="{ control }" label="Email" required :error="form.errors.email">
          <Input v-bind="control" v-model="values.email" type="email" name="email" autocomplete="email" @blur="form.touch('email')" />
        </Field>
        <Field v-slot="{ control }" label="Password" required :error="form.errors.password">
          <PasswordInput v-bind="control" v-model="values.password" name="password" autocomplete="new-password" />
        </Field>
        <PasswordStrength :password="values.password" :requirements="[{ label: `At least ${minPassword} characters`, test: (password) => password.length >= minPassword }]" />

        <Field v-if="termsHref || privacyHref" v-slot="{ control }" :error="form.errors.agreed">
          <Label>
            <Checkbox v-bind="control" v-model="values.agreed" name="agreed" />
            <span>
              I agree to the
              <a v-if="termsHref" :href="termsHref" class="er-sign-up-link">terms</a>
              <template v-if="termsHref && privacyHref"> and </template>
              <a v-if="privacyHref" :href="privacyHref" class="er-sign-up-link">privacy policy</a>
            </span>
          </Label>
        </Field>
      </CardContent>

      <CardFooter class="er-sign-up-footer">
        <Button type="submit" :loading="loading">
          {{ loading ? 'Creating account…' : 'Create account' }}
        </Button>
        <!-- Other ways in: "Continue with Google", a passkey button. -->
        <slot />
        <p v-if="signInHref" class="er-sign-up-note">
          Already have an account? <a :href="signInHref" class="er-sign-up-link">Sign in</a>
        </p>
      </CardFooter>
    </form>
  </Card>
</template>

<style>
@layer components {
  .er-sign-up {
    width: 100%;
    max-width: 24rem;
  }

  .er-sign-up form {
    display: grid;
    gap: 1.5rem;
  }

  .er-sign-up-fields {
    display: grid;
    gap: 1rem;
  }

  .er-sign-up .er-sign-up-footer {
    display: grid;
    gap: 0.75rem;
  }

  .er-sign-up-note {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    text-align: center;
  }

  .er-sign-up-link {
    color: var(--er-foreground);
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .er-sign-up-link:focus-visible {
    border-radius: var(--er-radius-sm);
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }
}
</style>
