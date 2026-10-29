<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../ui/alert-dialog'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import { Field, email, maxLength, required, useValidation } from '../../ui/field'
import { Input } from '../../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../ui/select'
import { Switch } from '../../ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Textarea } from '../../ui/textarea'

export interface SettingsProfile {
  name: string
  email: string
  bio: string
  timezone: string
}

export interface SettingsNotification {
  /** Name the choice is saved under. */
  key: string
  label: string
  description: string
}

const props = withDefaults(
  defineProps<{
    /** Values the profile form starts with. */
    profile?: Partial<SettingsProfile>
    /** The switches on the Notifications tab. */
    notifications?: readonly SettingsNotification[]
    /** Which switches start turned on, by key. */
    enabled?: readonly string[]
    timezones?: readonly string[]
    /** Set while a save is running: the Save buttons cannot be pressed twice. */
    saving?: boolean
  }>(),
  {
    notifications: () => [
      { key: 'security', label: 'Security alerts', description: 'Sign-ins from a new device, and password changes.' },
      { key: 'activity', label: 'Account activity', description: 'Comments, mentions and invitations.' },
      { key: 'digest', label: 'Weekly summary', description: 'One email on Monday with what happened last week.' },
      { key: 'news', label: 'Product news', description: 'New features, a few times a year.' },
    ],
    enabled: () => ['security', 'activity'],
    timezones: () => ['UTC', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo'],
  },
)

const emit = defineEmits<{
  /** The profile form passed its checks. */
  saveProfile: [profile: SettingsProfile]
  /** The keys of the switches that are on. */
  saveNotifications: [enabled: string[]]
  /** Deleting the account was confirmed in the dialog. */
  deleteAccount: []
}>()

const tab = ref('profile')

const profile = reactive<SettingsProfile>({ name: '', email: '', bio: '', timezone: 'UTC', ...props.profile })
const form = useValidation(profile, {
  name: [required('Enter your name.')],
  email: [required('Enter your email address.'), email()],
  bio: [maxLength(160)],
})

const switches = reactive<Record<string, boolean>>(
  Object.fromEntries(props.notifications.map((item) => [item.key, props.enabled.includes(item.key)])),
)

function saveProfile() {
  if (form.validate()) emit('saveProfile', { ...profile })
}

function saveNotifications() {
  emit('saveNotifications', props.notifications.map((item) => item.key).filter((key) => switches[key]))
}
</script>

<template>
  <Tabs v-model="tab" class="er-settings">
    <TabsList>
      <TabsTrigger value="profile">Profile</TabsTrigger>
      <TabsTrigger value="notifications">Notifications</TabsTrigger>
      <TabsTrigger value="account">Account</TabsTrigger>
    </TabsList>

    <TabsContent value="profile">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear to the people you work with.</CardDescription>
        </CardHeader>
        <form class="er-settings-form" novalidate @submit.prevent="saveProfile">
          <CardContent class="er-settings-fields">
            <Field v-slot="{ control }" label="Name" required :error="form.errors.name">
              <Input v-bind="control" v-model="profile.name" name="name" autocomplete="name" @blur="form.touch('name')" />
            </Field>
            <Field v-slot="{ control }" label="Email" required hint="Used to sign in and for the notifications you turn on." :error="form.errors.email">
              <Input v-bind="control" v-model="profile.email" type="email" name="email" autocomplete="email" @blur="form.touch('email')" />
            </Field>
            <Field v-slot="{ control }" label="About you" :hint="`${profile.bio.length} of 160 characters`" :error="form.errors.bio">
              <Textarea v-bind="control" v-model="profile.bio" name="bio" rows="3" @blur="form.touch('bio')" />
            </Field>
            <Field v-slot="{ control }" label="Time zone" hint="Dates and times are shown in this zone.">
              <Select v-model="profile.timezone" name="timezone">
                <SelectTrigger v-bind="control" placeholder="Choose a time zone" />
                <SelectContent>
                  <SelectItem v-for="zone in timezones" :key="zone" :value="zone">{{ zone.replace(/_/g, ' ') }}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </CardContent>
          <CardFooter>
            <Button type="submit" :disabled="saving">Save profile</Button>
          </CardFooter>
        </form>
      </Card>
    </TabsContent>

    <TabsContent value="notifications">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose which emails we send you.</CardDescription>
        </CardHeader>
        <form class="er-settings-form" @submit.prevent="saveNotifications">
          <CardContent>
            <ul class="er-settings-switches">
              <li v-for="item in notifications" :key="item.key">
                <div>
                  <label :for="`er-settings-${item.key}`" class="er-settings-switch-label">{{ item.label }}</label>
                  <p :id="`er-settings-${item.key}-hint`">{{ item.description }}</p>
                </div>
                <Switch :id="`er-settings-${item.key}`" v-model="switches[item.key]" :name="item.key" :aria-describedby="`er-settings-${item.key}-hint`" />
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button type="submit" :disabled="saving">Save notifications</Button>
          </CardFooter>
        </form>
      </Card>
    </TabsContent>

    <TabsContent value="account">
      <Card class="er-settings-danger">
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>This removes your profile, your settings and everything you have made. It cannot be undone.</CardDescription>
        </CardHeader>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger as-child><Button variant="destructive">Delete account</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>Your profile, your settings and everything you have made will be removed for good.</AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel />
                <AlertDialogAction variant="destructive" @click="emit('deleteAccount')">Delete account</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </TabsContent>
  </Tabs>
</template>

<style>
@layer components {
  .er-settings {
    width: 100%;
    max-width: 40rem;
  }

  .er-settings-form {
    display: grid;
    gap: 1.5rem;
  }

  .er-settings-fields {
    display: grid;
    gap: 1rem;
  }

  .er-settings-switches {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .er-settings-switches li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 0;
  }

  .er-settings-switches li + li {
    border-top: 1px solid var(--er-border);
  }

  .er-settings-switch-label {
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
  }

  .er-settings-switches p {
    margin: 0.125rem 0 0;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
  }

  .er-settings-danger {
    border-color: color-mix(in oklab, var(--er-destructive) 45%, var(--er-border));
  }
}
</style>
