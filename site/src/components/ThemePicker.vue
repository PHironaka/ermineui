<script setup lang="ts">
// Try the colour themes on a few components, then copy the command (or the CSS) that applies them in a project.
import { computed, ref } from 'vue'
import { Badge } from '@registry/ui/badge'
import { Button } from '@registry/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@registry/ui/card'
import { Checkbox } from '@registry/ui/checkbox'
import { CopyButton } from '@registry/ui/copy-button'
import { Input } from '@registry/ui/input'
import { Label } from '@registry/ui/label'
import { Progress } from '@registry/ui/progress'
import { Slider } from '@registry/ui/slider'
import { Swatch, SwatchGroup } from '@registry/ui/swatch'
import { Switch } from '@registry/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@registry/ui/tabs'
import type { ThemeEntry } from '../data/catalog'

const props = defineProps<{ themes: ThemeEntry[] }>()

const bases = computed(() => props.themes.filter((theme) => theme.kind === 'base'))
const accents = computed(() => props.themes.filter((theme) => theme.kind === 'accent'))
const base = ref('slate')
const accent = ref('blue')
const chosen = computed(() => props.themes.filter((theme) => theme.name === base.value || theme.name === accent.value))

// The themes are written for :root; here they are pointed at the preview alone, so the rest of the page keeps its look.
const scoped = computed(() => chosen.value.map((theme) => theme.css.replace(':root', '.theme-preview')).join('\n'))
const command = computed(() => `npx ermineui theme ${base.value}${accent.value === 'mono' ? '' : ` ${accent.value}`}`)
const css = computed(() => chosen.value.map((theme) => theme.css).join('\n\n'))

const name = ref('northwind-storefront')
const previews = ref(true)
const checks = ref(true)
const memory = ref(60)
</script>

<template>
  <div class="theme-picker">
    <component :is="'style'">{{ scoped }}</component>
    <div class="theme-controls">
      <div>
        <p class="theme-label">Base <span class="muted">· surfaces, text and lines</span></p>
        <SwatchGroup v-model="base" label="Base colours">
          <Swatch v-for="theme in bases" :key="theme.name" :value="theme.name" :color="theme.dot" :label="theme.title" />
        </SwatchGroup>
      </div>
      <div>
        <p class="theme-label">Accent <span class="muted">· primary colour and focus ring</span></p>
        <SwatchGroup v-model="accent" label="Accent colour">
          <Swatch value="mono" color="var(--er-foreground)" label="Mono (no accent)" />
          <Swatch v-for="theme in accents" :key="theme.name" :value="theme.name" :color="theme.dot" :label="theme.title" />
        </SwatchGroup>
      </div>
    </div>

    <div class="theme-preview" aria-label="Preview" role="region">
      <Card>
        <CardHeader>
          <CardTitle>Project settings</CardTitle>
          <CardDescription>Changes apply to the next deployment.</CardDescription>
        </CardHeader>
        <CardContent class="theme-preview-body">
          <Tabs default-value="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="builds">Builds</TabsTrigger>
            </TabsList>
            <TabsContent value="general" class="theme-preview-body">
              <div class="theme-field">
                <Label for="theme-name">Project name</Label>
                <Input id="theme-name" v-model="name" />
              </div>
              <div class="theme-row"><Switch v-model="previews" aria-label="Preview deployments" /> Preview deployments <Badge>New</Badge></div>
              <div class="theme-row"><Checkbox v-model="checks" aria-label="Run checks before deploying" /> Run checks before deploying</div>
            </TabsContent>
            <TabsContent value="builds" class="theme-preview-body">
              <div class="theme-field">
                <Label for="theme-memory">Memory, {{ memory }}%</Label>
                <Slider id="theme-memory" v-model="memory" :min="0" :max="100" />
              </div>
              <Progress :value="memory" label="Memory used" />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter class="theme-row">
          <Button>Save</Button>
          <Button variant="outline">Cancel</Button>
          <Button variant="secondary">Preview</Button>
          <Badge variant="outline">Draft</Badge>
        </CardFooter>
      </Card>
    </div>

    <div class="theme-output">
      <p class="theme-label">In your project</p>
      <div class="theme-code">
        <code>{{ command }}</code>
        <CopyButton :value="command" label="Copy command" />
      </div>
      <details>
        <summary>Or paste the CSS at the end of your theme stylesheet</summary>
        <div class="theme-code">
          <pre><code>{{ css }}</code></pre>
          <CopyButton :value="css" label="Copy CSS" />
        </div>
      </details>
    </div>
  </div>
</template>

<style>
.theme-picker {
  display: grid;
  gap: 1.5rem;
}
.theme-controls {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
}
.theme-label {
  margin: 0 0 0.5rem;
  font-weight: 600;
}
.theme-label .muted {
  font-weight: 400;
}
.theme-preview {
  padding: 1.5rem;
  border: 1px solid var(--er-border);
  border-radius: var(--er-radius-xl);
  background: var(--er-background);
  color: var(--er-foreground);
}
.theme-preview-body,
.theme-field {
  display: grid;
  gap: 0.75rem;
}
.theme-field {
  gap: 0.375rem;
}
.theme-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.theme-output {
  display: grid;
  gap: 0.75rem;
}
.theme-code {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.5rem 0.5rem 0.875rem;
  border: 1px solid var(--er-border);
  border-radius: var(--er-radius-md);
  background: var(--er-muted);
  font-family: var(--er-font-mono);
  font-size: 0.8125rem;
}
.theme-code > code {
  align-self: center;
}
.theme-code pre {
  margin: 0;
  overflow-x: auto;
  min-width: 0;
}
.theme-output summary {
  cursor: pointer;
  margin-bottom: 0.75rem;
}
</style>
