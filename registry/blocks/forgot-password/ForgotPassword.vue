<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import { Alert, AlertDescription } from '../../ui/alert'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import { Field, email, required, useValidation } from '../../ui/field'
import { Input } from '../../ui/input'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    /** Set while the request is running: the button shows a spinner and cannot be pressed twice. */
    loading?: boolean
    /** What went wrong on the server, e.g. "Too many attempts. Try again in a few minutes." */
    error?: string
    /** Where "Back to sign in" goes. Leave out to hide the link. */
    signInHref?: string
  }>(),
  { title: 'Reset your password', description: 'Enter the email you signed up with and we will send you a link to choose a new password.' },
)

const emit = defineEmits<{
  /** The form passed its checks. Ask your server to send the link, then set `sent`. */
  submit: [values: { email: string }]
}>()

/**
 * Set to true once the request has gone through. Do so whether or not the address has an account:
 * saying "no such account" tells a stranger who is and is not a customer.
 */
const sent = defineModel<boolean>('sent', { default: false })

const values = reactive({ email: '' })
const form = useValidation(values, { email: [required('Enter your email address.'), email()] })
const root = ref<HTMLElement | null>(null)

function submit() {
  if (form.validate()) emit('submit', { ...values })
}

async function again() {
  sent.value = false
  // The button that was pressed is gone; focus goes to the field it brought back.
  await nextTick()
  root.value?.querySelector('input')?.focus()
}
</script>

<template>
  <div ref="root" class="er-forgot-password">
    <Card>
      <CardHeader>
        <CardTitle>{{ sent ? 'Check your inbox' : title }}</CardTitle>
        <CardDescription v-if="!sent && description">{{ description }}</CardDescription>
      </CardHeader>

      <!-- Always in the page, so the change from the form to the confirmation is announced. -->
      <CardContent class="er-forgot-password-sent" role="status">
        <p v-if="sent">
          If there is an account for <strong>{{ values.email }}</strong>, a link to reset its password is on its way. It can take a few minutes, and may land in spam.
        </p>
      </CardContent>

      <CardFooter v-if="sent" class="er-forgot-password-footer">
        <Button variant="outline" @click="again">Use a different email</Button>
        <a v-if="signInHref" :href="signInHref" class="er-forgot-password-link">Back to sign in</a>
      </CardFooter>

      <!-- novalidate: the messages come from the rules above, so they look and read the same in every browser. -->
      <form v-else novalidate @submit.prevent="submit">
        <CardContent class="er-forgot-password-fields">
          <Alert v-if="error" variant="destructive">
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>
          <Field v-slot="{ control }" label="Email" required :error="form.errors.email">
            <Input v-bind="control" v-model="values.email" type="email" name="email" autocomplete="email" />
          </Field>
        </CardContent>
        <CardFooter class="er-forgot-password-footer">
          <Button type="submit" :loading="loading">{{ loading ? 'Sending…' : 'Send reset link' }}</Button>
          <a v-if="signInHref" :href="signInHref" class="er-forgot-password-link">Back to sign in</a>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>

<style>
@layer components {
  .er-forgot-password {
    width: 100%;
    max-width: 24rem;
  }

  .er-forgot-password form {
    display: grid;
    gap: 1.5rem;
  }

  .er-forgot-password-fields {
    display: grid;
    gap: 1rem;
  }

  .er-forgot-password .er-forgot-password-sent {
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .er-forgot-password .er-forgot-password-sent:empty {
    display: none;
  }

  .er-forgot-password-sent p {
    margin: 0;
  }

  .er-forgot-password-sent strong {
    color: var(--er-foreground);
    font-weight: var(--er-weight-semibold);
    overflow-wrap: anywhere;
  }

  .er-forgot-password .er-forgot-password-footer {
    display: grid;
    gap: 0.75rem;
  }

  .er-forgot-password-link {
    color: var(--er-foreground);
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
    text-align: center;
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .er-forgot-password-link:focus-visible {
    border-radius: var(--er-radius-sm);
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }
}
</style>
