<script setup lang="ts">
// The homepage's "how it works" steps, told with the sticky scroll component itself.
import { ref } from 'vue'
import { Button } from '@registry/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@registry/ui/card'
import { Input } from '@registry/ui/input'
import { Label } from '@registry/ui/label'
import { StickyScroll, StickyScrollItem } from '@registry/ui/sticky-scroll'
import { Switch } from '@registry/ui/switch'

const name = ref('northwind-storefront')
const previews = ref(true)
</script>

<template>
  <StickyScroll top="3rem" class="how">
    <StickyScrollItem heading="Set up once.">
      <p>Run <code>npx ermineui init</code> in a Vue, Nuxt or Astro project. It finds the framework, suggests where the files go and copies in one stylesheet that holds the theme.</p>
    </StickyScrollItem>
    <StickyScrollItem heading="Add what you need.">
      <p><code>npx ermineui add dialog</code> copies the dialog's source into your project, with the helpers it needs. Add a block such as <code>dashboard</code> and you get a whole page section, built from the same parts.</p>
    </StickyScrollItem>
    <StickyScrollItem heading="Pick your colours.">
      <p>
        Choose a base for the greys and an accent for the primary colour, or set the CSS variables yourself. Every pairing is checked for contrast in
        light and dark. Try one from the palette at the top of this page, or see <a href="/themes/">the themes</a>.
      </p>
    </StickyScrollItem>
    <StickyScrollItem>
      <template #media>
        <Card class="how-card">
          <CardHeader><CardTitle>Project settings</CardTitle></CardHeader>
          <CardContent class="how-card-body">
            <div class="how-field">
              <Label for="how-name">Project name</Label>
              <Input id="how-name" v-model="name" />
            </div>
            <label class="how-row"><Switch v-model="previews" /> Preview deployments</label>
          </CardContent>
          <CardFooter class="how-row">
            <Button>Save</Button>
            <Button variant="outline">Cancel</Button>
          </CardFooter>
        </Card>
      </template>
      <h3>Then it is yours.</h3>
      <p>
        The card beside this is real: the same components, running on this page. In your project they are plain <code>.vue</code> files, so change the markup,
        the styles or the behaviour, and nothing is overwritten on your next update. <a href="/docs/installation/">Read the installation guide</a>.
      </p>
    </StickyScrollItem>
  </StickyScroll>
</template>

<style>
.how .er-sticky-scroll-heading {
  font-size: clamp(2.25rem, 6cqi, 4rem);
}
.how .er-sticky-scroll-copy {
  color: var(--er-muted-foreground);
  font-size: clamp(1.125rem, 2vw, 1.3125rem);
  line-height: 1.5;
}
.how .er-sticky-scroll-copy h3 {
  margin: 0 0 0.75rem;
  color: var(--er-foreground);
  font-size: clamp(1.5rem, 3vw, 2rem);
  letter-spacing: -0.02em;
}
.how .er-sticky-scroll-copy p {
  margin: 0;
}
.how .er-sticky-scroll-copy a {
  color: var(--site-accent);
}
.how .er-sticky-scroll-copy code {
  color: var(--er-foreground);
  font-family: var(--er-font-mono);
  font-size: 0.85em;
}
.how-card {
  width: min(100%, 24rem);
  text-align: start;
}
.how-card-body,
.how-field {
  display: grid;
  gap: 0.75rem;
}
.how-field {
  gap: 0.375rem;
}
.how-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
