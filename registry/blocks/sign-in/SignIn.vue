<script setup lang="ts">
import { reactive } from 'vue'
import { Alert, AlertDescription } from '../../ui/alert'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import { Checkbox } from '../../ui/checkbox'
import { Field, email, required, useValidation } from '../../ui/field'
import { Input } from '../../ui/input'
import { PasswordInput } from '../../ui/input-group'
import { Label } from '../../ui/label'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    /** Set while the sign-in request is running: the button shows a spinner and cannot be pressed twice. */
    loading?: boolean
    /** What went wrong on the server, e.g. "That email and password do not match." */
    error?: string
    /** Where "Forgot password?" goes. Leave out to hide the link. */
    forgotHref?: string
    /** Where "Create an account" goes. Leave out to hide the line. */
    signUpHref?: string
  }>(),
  { title: 'Sign in', description: 'Enter your email and password to continue.' },
)

const emit = defineEmits<{
  /** The form passed its checks. Send these to your server. */
  submit: [values: { email: string; password: string; remember: boolean }]
}>()

const values = reactive({ email: '', password: '', remember: false })
const form = useValidation(values, {
  email: [required('Enter your email address.'), email()],
  password: [required('Enter your password.')],
})

function submit() {
  if (form.validate()) emit('submit', { ...values })
}
</script>

<template>
  <Card class="er-sign-in">
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>
      <CardDescription v-if="description">{{ description }}</CardDescription>
    </CardHeader>

    <!-- novalidate: the messages come from the rules above, so they look and read the same in every browser. -->
    <form novalidate @submit.prevent="submit">
      <CardContent class="er-sign-in-fields">
        <Alert v-if="error" variant="destructive">
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>

        <Field v-slot="{ control }" label="Email" required :error="form.errors.email">
          <Input v-bind="control" v-model="values.email" type="email" name="email" autocomplete="email" @blur="form.touch('email')" />
        </Field>
        <Field v-slot="{ control }" label="Password" required :error="form.errors.password">
          <PasswordInput v-bind="control" v-model="values.password" name="password" autocomplete="current-password" />
        </Field>

        <div class="er-sign-in-row">
          <Label><Checkbox v-model="values.remember" name="remember" /> Keep me signed in</Label>
          <a v-if="forgotHref" :href="forgotHref" class="er-sign-in-link">Forgot password?</a>
        </div>
      </CardContent>

      <CardFooter class="er-sign-in-footer">
        <Button type="submit" :loading="loading">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </Button>
        <slot />
        <p v-if="signUpHref" class="er-sign-in-note">
          New here? <a :href="signUpHref" class="er-sign-in-link">Create an account</a>
        </p>
      </CardFooter>
    </form>
  </Card>
</template>

<style>
@layer components {
  .er-sign-in {
    width: 100%;
    max-width: 24rem;
  }

  .er-sign-in form {
    display: grid;
    gap: 1.5rem;
  }

  .er-sign-in-fields {
    display: grid;
    gap: 1rem;
  }

  .er-sign-in-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .er-sign-in .er-sign-in-footer {
    display: grid;
    gap: 0.75rem;
  }

  .er-sign-in-note {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    text-align: center;
  }

  .er-sign-in-link {
    color: var(--er-foreground);
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .er-sign-in-link:focus-visible {
    border-radius: var(--er-radius-sm);
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }
}
</style>
