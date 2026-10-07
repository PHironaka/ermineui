# Ermine UI

Vue 3 components you copy into your project and own, in the spirit of shadcn/ui.

- **Vue 3 single-file components.** Works in Vue + Vite, Nuxt, and Astro (as Vue islands).
- **Plain CSS and variables.** No Tailwind, no CSS-in-JS, no build plugin. One stylesheet holds the theme.
- **Behavior written from scratch.** Positioning, focus trapping, dismissal, keyboard navigation and scroll locking live in six small helper files that are copied in alongside the components. The only dependency is Vue (3.5 or newer).
- **Copy-in distribution.** A small command line copies component source into your project. Nothing is imported from `node_modules`, so every line is yours to edit.

The npm package for the command line is `ermineui` (published on 7 October 2026). The project was called Sable until then; everything was renamed together, including the CSS prefix, which went from `sb-` to `er-`.

## Components

| | |
|---|---|
| `button` | Six variants, four sizes; renders as any tag or component |
| `input`, `textarea`, `label` | Native fields with `v-model` and invalid styling |
| `input-group` | Input with a prefix or suffix, plus password (show / hide) and search (clear) fields |
| `tags-input` | Free-form values typed in and shown as removable tags |
| `time-picker`, `date-time-picker` | Times at regular steps; a date and time as one value |
| `color-picker` | Colour by dragging, hue, presets or hex code |
| `toggle` | A single button that stays pressed |
| `field` | Label, hint and error wired to any control, plus a small validation helper |
| `pin-input` | One box per character for short codes, with paste and autofill |
| `rating` | Stars to choose a score, or show one with part-filled stars |
| `number-input` | Number field with minus and plus buttons, limits and steps |
| `file-upload` | Drop zone and file picker with type, size and count limits and per-file progress |
| `checkbox`, `switch` | Native checkboxes, restyled; checkbox supports indeterminate |
| `radio-group` | Native radio buttons, restyled; vertical or horizontal |
| `select` | Listbox with keyboard navigation, type-to-select, form support |
| `multi-select` | Several choices from a filterable list, shown as removable tags |
| `combobox` | Select you can type in to filter; keyboard navigation, form support |
| `slider` | Native range input, restyled, with a filled track |
| `toggle-group` | Row of buttons with one, or several, switched on |
| `date-picker` | Field that opens a calendar; min / max, disabled dates, form support |
| `date-range-picker` | Field for a start and end date, with quick presets beside the calendar |
| `calendar` | Month grid for choosing a date, with full keyboard navigation |
| `haptics` | Short vibration patterns on phones that support it, added with `v-haptic` |
| `view-transition` | Animated changes: elements glide to new places, or a new look sweeps in from a point |
| `share-button` | The device's share sheet where there is one; copies the link where there is not |
| `qr-code` | A scannable code for a link or short text, generated in the page |
| `signature-pad` | Sign with finger, pen or mouse; exported as an image |
| `scroll-progress`, `reveal`, `count-up` | A reading progress bar; content that appears as it scrolls into view; numbers that run up |
| `offline-banner` | Appears when the connection drops |
| `wake-lock`, `fullscreen`, `notification-prompt` | Keep the screen on; fill the screen with one element; ask for notification permission politely |
| `sound` | Short synthesized sounds for buttons and other controls, with a mute button and volume |
| `typography` | Headings and text sized fluidly with `clamp()`; `Prose` styles long-form HTML |
| `badge`, `card`, `separator` | Static building blocks |
| `avatar` | Round picture that falls back to initials; `AvatarGroup` stacks several |
| `alert` | Inline message in five variants, with an optional icon |
| `progress`, `spinner` | Bar for known or unknown amounts; ring for short waits |
| `stat` | Headline number with change since last period and optional sparkline |
| `table` | Styled HTML table in parts |
| `data-table` | Table from rows and columns, with sorting, row selection and pages |
| `pagination`, `breadcrumb` | Numbered pages with gaps shortened; trail of links to the current page |
| `chart` | Line, area, bar, donut, scatter and heatmap charts, a ranked bar list and a gauge; hover readouts, keyboard support, table views |
| `skeleton` | Loading placeholder with pulse or shimmer; still under reduced motion |
| `questionnaire` | Form shown one step at a time, with per-step checks and skippable steps |
| `stepper` | Numbered progress: done, current and still to come |
| `tabs` | Arrow-key navigation, horizontal or vertical |
| `accordion` | Sections that expand and collapse, one at a time or several |
| `tree` | Nested list that expands, collapses and selects, with full keyboard support |
| `carousel` | Slides on native scroll snapping, with buttons, dots and arrow keys |
| `resizable` | Panels with handles to drag or move with the arrow keys |
| `collapsible` | One section that a button shows and hides |
| `alert-dialog` | Confirmation before something irreversible; closes only by choosing |
| `dialog` | Modal with focus trap, scroll lock, Escape and outside-press to close |
| `sheet` | Panel that slides in from any edge, built on the dialog |
| `navigation-menu` | A site's main links, some opening a panel of further links |
| `menubar` | File / Edit / View style menus, filled with the dropdown menu's items |
| `tour` | Step-by-step introduction that points at parts of the page |
| `command` | Command palette: search and run actions by name, opened with ⌘K / Ctrl+K |
| `popover` | Anchored floating panel that flips and shifts to stay on screen |
| `dropdown-menu` | Menu with arrow keys, Home/End, type-to-select, checkbox and radio items, submenus |
| `context-menu` | Right-click menu, filled with the dropdown menu's items |
| `tooltip` | Hover and keyboard-focus hint |
| `hover-card` | Preview shown on hover or focus that the pointer can move into |
| `sidebar` | App navigation in groups that shrinks to a rail of icons, or slides in on phones |
| `banner` | Announcement strip across the top of the page, optionally dismissible |
| `timeline` | Things that happened, in order, joined by a line |
| `code-block`, `copy-button`, `kbd` | Code with a copy button; a button that copies any text; keycaps |
| `scroll-area` | Scrolling box with slim themed scrollbars |
| `event-calendar` | Month grid of days, each listing its events |
| `kanban` | Columns of cards to drag or move with the keyboard |
| `virtual-list` | Very long list that only draws the rows in view |
| `empty-state` | Icon, heading, text and actions for when there is nothing to list |
| `toast` | `toast()` from anywhere, with one `<Toaster />` mounted |
| `icon` | 62 built-in line icons that take the size and colour of the text around them; add your own with `registerIcons()` |

## Blocks

A block is a section of a page, or a whole page, already put together from the components above. `ermine add <block>` copies it into a `blocks` folder beside your components, along with every component it uses. It is a starting point: open the file and change it.

| | |
|---|---|
| `dashboard` | App page with a collapsing sidebar, a top bar with a user menu, headline numbers, an area chart, a bar list and a sortable table. `DashboardShell` is the frame on its own, for your other pages |
| `sign-in` | Email and password on a card, checked before it is sent, with a loading state and a place for the server's error |
| `settings` | Account settings in tabs: a profile form, notification switches, and a delete button behind a confirmation |

## Try it

```sh
npm install
npm run dev        # playground with every component, at http://localhost:5173
```

## Use it in a project

```sh
# from your app's folder
npx ermineui init
npx ermineui add button dialog select
npx ermineui add dashboard          # a block, with the components it is built from
```

To try changes that are not published yet, run the CLI from this folder: `node /path/to/ermineui/cli/bin/ermine.mjs add button`.

`init` detects the framework, suggests folders, writes `ermine.json` and copies the theme stylesheet. `add` copies the components and blocks you name plus the helpers and components they depend on. Blocks go in a `blocks` folder beside the components folder; add a `"blocks"` path to `ermine.json` to put them somewhere else. Files that already exist are kept unless you pass `--overwrite`.

The theme stylesheet is yours and is never overwritten, even with `--overwrite`. If a component you add later relies on variables your copy does not have yet (chart colours and the type scale arrived after the first release), `add` appends just those variables to the end of your file, says so, and leaves everything already there untouched.

| Command | What it does |
|---|---|
| `ermine init` | Create `ermine.json` and the theme stylesheet (`-y` accepts the suggested folders) |
| `ermine add <name...>` | Copy components or blocks and their dependencies (`--all` for every component) |
| `ermine list` | Show available components and blocks, and which are already installed |
| `--registry <url or path>` | Read components from a different `registry.json`, such as your own fork |

### Vue + Vite

```ts
// src/main.ts
import './styles/ermine.css'
```

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="outline">Save</Button>
</template>
```

### Nuxt

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/assets/css/ermine.css'],
  components: [
    // Auto-import the components by their own names: <Button>, <DialogContent>, ...
    { path: '~/components/ui', pathPrefix: false, extensions: ['.vue'] },
    // The same for blocks, if you add any: <Dashboard>, <SignIn>, ...
    { path: '~/components/blocks', pathPrefix: false, extensions: ['.vue'] },
    '~/components',
  ],
})
```

Components are then available in templates without imports. `toast` is a function, so import it: `import { toast } from '~/components/ui/toast'`.

### Astro

Add the Vue integration (`npx astro add vue`), import the stylesheet in a layout, and use the components inside a Vue island:

```astro
---
import '../styles/ermine.css'
import SettingsForm from '../components/SettingsForm.vue'
---
<SettingsForm client:load />
```

Compound components (dialog, select, tabs and so on) share state between their parts, so compose them inside one `.vue` file rather than across separate islands. Static components such as `Button`, `Badge` and `Card` can also be used directly in `.astro` files with no client directive.

In an `.astro` file, Astro's type-checker only accepts the attributes a component declares, so `<Button as="a" href="/docs">` is reported by `astro check` even though it renders correctly. Pass such attributes with a spread, `<Button as="a" {...{ href: '/docs' }}>`, or write the link inside a `.vue` file, where it type-checks as is.

## Theming

`ermine.css` defines every colour, radius, shadow and duration as a CSS variable. Edit the values and all components follow.

```css
:root {
  --er-primary: light-dark(oklch(0.5 0.2 265), oklch(0.75 0.15 265));
  --er-radius: 0.375rem;
}
```

- **Dark mode** follows the operating system by default. Force a theme with `class="dark"` or `class="light"` (or `data-theme`) on `<html>`, or on any element to theme only that subtree.
- **Overriding a component.** Component styles sit in `@layer components`, so any rule you write outside a layer wins without `!important`:

  ```css
  .er-button[data-variant='outline'] { border-style: dashed; }
  ```

  Or edit the `<style>` block in the component file; it is your code.
- **Variants and state are data attributes** (`data-variant`, `data-size`, `data-state`, `data-side`), which keeps selectors readable.
- **With Tailwind.** The layer is named `components`, the same layer Tailwind uses, so utility classes on a Ermine component override its defaults.

## Patterns

**Icons.** `Icon` draws a named icon at the size and colour of the text around it. Beside text it is decoration and hidden from screen readers; on its own, give it a `label`.

```vue
<Button><Icon name="plus" /> New project</Button>
<Button size="icon" aria-label="Delete"><Icon name="trash" /></Button>
<Icon name="circle-check" label="Passed" :size="20" />
```

The set is small on purpose (`iconNames()` lists it, and the playground shows every one). Add your own once, when the app starts, with the `d` of a path drawn on a 24 by 24 grid; or pass a path straight in; or put any shapes in the slot:

```ts
import { registerIcons } from '@/components/ui/icon'
registerIcons({ rocket: 'M5 19c0-2 1-4 3-5l3 3c-1 2-3 3-5 3Z' })
```

```vue
<Icon name="rocket" />
<Icon d="M4 12h16" />
<Icon><circle cx="12" cy="12" r="9" /></Icon>
```

Icons from another library, such as `lucide-vue-next`, work in every slot that takes an icon; nothing here depends on `Icon`.

**Blocks.** A block takes its content through props and reports back through events, so it works before you change a line, and the sample data lives in one file you can delete.

```vue
<script setup lang="ts">
import { Dashboard, DashboardShell } from '@/components/blocks/dashboard'
import { RouterLink } from 'vue-router'
</script>

<template>
  <!-- The whole sample page, with your data. -->
  <Dashboard :navigation="navigation" :user="user" :revenue="revenue" :orders="orders" :link-as="RouterLink" current="/" @sign-out="signOut" />

  <!-- Or just the frame, around a page of your own. -->
  <DashboardShell title="Customers" :navigation="navigation" :user="user" current="/customers">
    <template #actions><Button size="sm">Add customer</Button></template>
    <CustomerTable />
  </DashboardShell>
</template>
```

The dashboard fills the window; set `--er-dashboard-height` to fit it into a smaller space. Its grids follow the width of the page area (container queries), so they are right whether the sidebar is wide, shrunk or hidden.

**`as` and `as-child`.** Buttons, triggers and menu items render any tag or component:

```vue
<Button as="a" href="/docs">Docs</Button>
<Button :as="NuxtLink" to="/docs">Docs</Button>
```

Triggers accept `as-child` to use your own element instead of rendering one:

```vue
<Dialog v-model:open="open">
  <DialogTrigger as-child>
    <Button variant="outline">Edit profile</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>Changes are saved when you press Save.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose as-child><Button variant="outline">Cancel</Button></DialogClose>
      <Button @click="save">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Open state** is optional: every overlay works uncontrolled, or bind `v-model:open`.

**Select**

```vue
<Select v-model="region" name="region">
  <SelectTrigger placeholder="Choose a region" />
  <SelectContent>
    <SelectItem value="fra1">Frankfurt</SelectItem>
    <SelectItem value="lhr1">London</SelectItem>
  </SelectContent>
</Select>
```

**Combobox**

```vue
<Combobox v-model="timezone" name="timezone" placeholder="Search cities…">
  <ComboboxItem value="Europe/Berlin">Berlin</ComboboxItem>
  <ComboboxItem value="Asia/Tokyo">Tokyo</ComboboxItem>
  <template #empty>No city matches.</template>
</Combobox>
```

Typing filters on each item's text (or its `text-value`). Emptying the field and leaving it clears the value.

**Radio group**

```vue
<RadioGroup v-model="plan" name="plan" aria-label="Plan">
  <Label><RadioGroupItem value="hobby" /> Hobby</Label>
  <Label><RadioGroupItem value="pro" /> Pro</Label>
</RadioGroup>
```

**Accordion**

```vue
<Accordion v-model="open" type="multiple">
  <AccordionItem value="domains">
    <AccordionTrigger>How do I add a custom domain?</AccordionTrigger>
    <AccordionContent>Open the Domains tab and add the DNS record it shows.</AccordionContent>
  </AccordionItem>
</Accordion>
```

`type="single"` (the default) takes a string; `type="multiple"` takes an array. `AccordionTrigger` wraps its button in an `h3`; change it with `heading="h2"`.

**Sheet** has the same parts as the dialog, with a `side` on the content:

```vue
<Sheet>
  <SheetTrigger as-child><Button>Filters</Button></SheetTrigger>
  <SheetContent side="left">
    <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
  </SheetContent>
</Sheet>
```

**Alert, avatar, progress, spinner**

```vue
<Alert variant="destructive">
  <svg>…</svg>  <!-- optional: an svg placed first becomes the icon -->
  <AlertTitle>Build failed</AlertTitle>
  <AlertDescription>Type error in cart/total.ts on line 42.</AlertDescription>
</Alert>

<Avatar src="/people/ines.jpg" alt="Ines Kovač">IK</Avatar>

<Progress :value="35" aria-label="Upload" />  <!-- leave value out when the amount is unknown -->
<Button disabled><Spinner label="" /> Saving</Button>
```

**Chart**

```vue
<Chart
  type="bar"
  stacked
  :data="[{ month: 'Apr', production: 14, preview: 52 }, { month: 'May', production: 18, preview: 61 }]"
  x="month"
  :series="[{ key: 'production', label: 'Production' }, { key: 'preview', label: 'Preview' }]"
  label="Deployments by month"
/>
```

`type` is `line`, `area` or `bar`. Each row of `data` is one position along the bottom axis; each entry in `series` names the property to plot. The value axis always starts at zero. Colours come from `--er-chart-1` to `--er-chart-8` in `ermine.css`, handed out in the order of `series`, so keep that order stable and a series keeps its colour. Pointing at the chart, or focusing it and pressing the arrow keys, shows every series' value at that position, and "Show table" swaps the chart for the same numbers as a table. Give the chart a visible heading of your own; `label` is for screen readers. On a surface other than the page or a card, set `--er-chart-surface` to that surface's colour.

Clicking a legend entry hides that series and rescales the chart; the rest keep their colours. Bind `v-model:hidden` (an array of series keys) to control it yourself.

The same folder has two more charts, with the same readout, keyboard support and table view:

```vue
<DonutChart :data="regions" name="region" value="gb" label="Bandwidth by region" />  <!-- add `pie` for a full pie -->

<ScatterChart :data="builds" x="size" y="seconds" group="framework" name="project" label="Build time against bundle size" />
```

`DonutChart` draws at most six slices and adds the rest together as "Other", because thin slices cannot be compared by eye; each slice's value and share are listed beside it. `ScatterChart` has number scales on both axes that fit the data (they do not start at zero) and colours the first three `group` values, with any others sharing grey — with points scattered freely, only three of the colours stay distinct in every pairing.

**Field and validation**

```vue
<script setup lang="ts">
import { Field, email, required, useValidation } from '@/components/ui/field'

const account = ref({ name: '', email: '' })
const form = useValidation(account, {
  name: [required('Give the team a name.')],
  email: [required(), email()],
})
const save = () => form.validate() && send(account.value)
</script>

<template>
  <Field v-slot="{ control }" label="Email" required hint="Invoices are sent here." :error="form.errors.email">
    <Input v-bind="control" v-model="account.email" @blur="form.touch('email')" />
  </Field>
</template>
```

`Field` gives its slot a `control` object (id and the right ARIA attributes); bind it to whatever control is inside, whether an input, a select trigger or a date picker. `useValidation` keeps a field quiet until it is checked (`touch` for one field, `validate` for all or some), then re-checks it as the value changes so the message clears once the problem is fixed. Rules are plain functions that return a message: `required`, `email`, `minLength`, `maxLength`, `pattern`, `min`, `max`, or your own.

**Questionnaire**

```vue
<Questionnaire v-model:step="step" submit-label="Send" @submit="send">
  <template #default="{ goTo }">
    <QuestionnaireStep title="About you" :validate="() => form.validate(['name', 'email'])">
      <!-- any fields -->
    </QuestionnaireStep>
    <QuestionnaireStep title="About your team" :skip="answers.kind !== 'team'">
      <!-- only shown to teams -->
    </QuestionnaireStep>
    <QuestionnaireStep title="Check your answers">
      <Button variant="link" @click="goTo(1)">Edit</Button>
    </QuestionnaireStep>
  </template>
</Questionnaire>
```

Each step holds whatever you put in it: one question, or several fields. Next runs the step's `validate` and stays put if it returns `false` (it may be async); the last step's button emits `submit`. A step with `skip` is left out of the sequence and the count. Answers live in your own state, so nothing is lost going back and forth. `indicator="stepper"` shows the named steps in place of the progress bar. Write the steps in order, in one template: a step added later by `v-if` joins at the end.

**Stepper, multi-select, number input, file upload**

```vue
<Stepper v-model="step" :steps="['Cart', 'Shipping', 'Payment']" />

<MultiSelect v-model="regions" name="regions" placeholder="Search regions…" :max="3">
  <MultiSelectItem value="fra1">Frankfurt</MultiSelectItem>
  <MultiSelectItem value="lhr1">London</MultiSelectItem>
</MultiSelect>

<NumberInput v-model="replicas" :min="1" :max="10" />

<FileUpload v-model="files" multiple accept=".csv,image/*" :max-size="2 * 1024 * 1024" :progress="progressByName" />
```

`FileUpload` collects `File` objects and turns away ones that break the limits (with the reason shown, and a `reject` event). It does not send anything: upload them yourself and pass `progress` (0 to 100, keyed by file name) to show a bar per file.

**Command palette**

```vue
<CommandPalette v-model:open="open">  <!-- ⌘K / Ctrl+K toggles it; :shortcut="false" turns that off -->
  <CommandGroup heading="Project">
    <CommandItem keywords="env secrets" shortcut="⌘E" @select="openEnv">Environment variables</CommandItem>
  </CommandGroup>
</CommandPalette>
```

**Context menu** uses the dropdown menu's items, groups and submenus inside its own content:

```vue
<ContextMenu>
  <ContextMenuTrigger>Right-click here</ContextMenuTrigger>
  <ContextMenuContent>
    <DropdownMenuItem @select="rename">Rename</DropdownMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

**Collapsible, hover card, sidebar, empty state**

```vue
<Collapsible v-model:open="open">
  <CollapsibleTrigger as-child><Button variant="outline">Details</Button></CollapsibleTrigger>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>

<HoverCard>
  <HoverCardTrigger href="/people/ines">Ines Kovač</HoverCardTrigger>
  <HoverCardContent>Owner · 214 deployments this year</HoverCardContent>
</HoverCard>

<Sidebar v-model:collapsed="collapsed">
  <SidebarGroup label="Project">
    <SidebarItem :as="NuxtLink" to="/deployments" active>
      <template #icon><svg>…</svg></template>
      Deployments
    </SidebarItem>
  </SidebarGroup>
</Sidebar>

<EmptyState title="No deployments yet" description="Push to main and it will show up here.">
  <Button>Deploy now</Button>
</EmptyState>
```

The sidebar is the navigation only; placing it beside your page is up to your layout. Add `off-canvas` and bind `v-model:open` to a menu button, and below 48rem wide it leaves the layout and slides in over the page as a dialog (focus trapped, Escape or a press outside closes it, following a link closes it). The width is set in two places in `Sidebar.vue`, the media query and the script; change both together. A hover card is a preview for pointer and keyboard users; it never opens on touch, so do not put anything in it that cannot be reached another way.

**PIN input, rating, tree**

```vue
<PinInput v-model="code" :length="6" name="code" @complete="verify" />

<Rating v-model="score" label="Deploy experience" />
<Rating :model-value="3.5" readonly label="Average rating" />

<Tree v-model:expanded="open" v-model:selected="file" :nodes="[
  { id: 'app', label: 'app', children: [{ id: 'app/app.vue', label: 'app.vue' }] },
  { id: 'package.json', label: 'package.json' },
]" label="Project files" />
```

`PinInput` is numeric by default (`type="alphanumeric"` for letters too) and spreads a pasted or autofilled code across the boxes. `Rating` is 0 until rated, and pressing the chosen star again clears it. In `Tree`, a node with a `children` array is a folder, even when the array is empty; use the `#item` slot to add icons.

**Carousel, resizable panels**

```vue
<Carousel v-model="slide" label="Recent releases">
  <CarouselSlide v-for="release in releases" :key="release.id">…</CarouselSlide>
</Carousel>

<ResizablePanels v-model:sizes="sizes">  <!-- direction="vertical" stacks them -->
  <ResizablePanel :default-size="25" :min-size="15">Files</ResizablePanel>
  <ResizableHandle grip />
  <ResizablePanel>Editor</ResizablePanel>
</ResizablePanels>
```

The carousel has no autoplay. Set `--er-carousel-size: 50%` on it to show two slides at a time. Panel sizes are percentages; `ResizablePanels` fills its parent, so give the parent a height. Nest a second `ResizablePanels` inside a panel for a grid of splits.

**Haptics**

```vue
<Button v-haptic>Save</Button>
<Button v-haptic="'heavy'" variant="destructive">Delete</Button>
<Switch v-haptic.toggle v-model="on" />
```

The twin of `v-sound`. Patterns are `light`, `medium` (the default), `heavy`, `success`, `error` and `selection`; `haptic('success')` plays one from code. Only Android phones vibrate from a web page: iPhones and desktop browsers ignore it, so it can only ever be a garnish. `hapticSettings.enabled` switches it off for the page and is remembered; like sound, it starts off for anyone whose system asks for reduced motion. `canVibrate()` tells you whether to show a vibration setting at all.

**View transitions**

```vue
<script setup lang="ts">
import { revealTransition, vTransitionName, viewTransition } from '@/components/ui/view-transition'

const sort = () => viewTransition(() => { items.value = sorted(items.value) })
const switchTheme = (event: MouseEvent) => revealTransition(() => toggleTheme(), event)
</script>

<template>
  <li v-for="item in items" :key="item.id" v-transition-name="`item-${item.id}`">{{ item.name }}</li>
</template>
```

`viewTransition(update)` runs your state change and animates the page from before to after. Elements given the same `v-transition-name` before and after glide from their old place to their new one; each name must be on one element at a time. `revealTransition(update, event)` uncovers the new look in a circle growing from where the press happened, which suits a theme switch. Where the browser lacks the View Transitions API, or the reader asks for reduced motion, the change simply happens at once.

**Share button and QR code**

```vue
<ShareButton url="https://example.com/post" title="A post" text="Worth a read." />
<QrCode value="https://example.com/post" :size="160" />
```

`ShareButton` opens the device's own share sheet where the browser has one (phones, and some desktop browsers) and otherwise copies the link and says "Link copied". `QrCode` is generated in the page, with no service called. It is always dark on white, since many scanners cannot read an inverted code. `level` (`L`, `M`, `Q`, `H`) trades capacity for resistance to damage; text too long to fit shows a message instead of a broken code. Shorter text makes bigger squares, which scan from further away.

**Signature pad**

```vue
<SignaturePad v-model="signature" label="Your signature">Sign above, or type your name below</SignaturePad>
```

The value is a PNG data URL with a transparent background, or `''` while empty. The exported ink is dark whatever the theme (`export-color` changes it). A drawn signature cannot be made with a keyboard or a screen reader, so always offer another way to sign beside it, such as a typed name. It records the picture only: who signed and when is for your form to capture.

**Scroll progress, reveal, count up**

```vue
<ScrollProgress />                         <!-- the whole page; target="#article" for one element -->
<section v-reveal>…</section>              <!-- v-reveal="120" delays it by 120ms -->
<CountUp :value="1284306" />
<Stat label="Deployments" :value="21480" count-up />
```

`v-reveal` only hides elements that are below the fold when the page loads, and only in a browser that can show them again, so nothing is hidden without JavaScript or on the server. `CountUp` gives screen readers the final number from the start, not every number on the way. All three stand still for readers who ask for reduced motion.

**Offline banner, wake lock, fullscreen, notification prompt**

```vue
<OfflineBanner />
<WakeLockToggle v-model="keepAwake" />
<FullscreenButton target="#chart" />
<NotificationPrompt title="Get told when a deployment fails?" description="One notification per failure." @granted="subscribe" />
```

Each wraps one browser feature and leaves itself out where the browser cannot do it. `OfflineBanner` reports the browser's own view of the network: a connection that is up but cannot reach your server still counts as online. `NotificationPrompt` only triggers the browser's permission question when its button is pressed, never on page load, and explains where the setting lives if the answer was no. It asks for permission; sending notifications is up to you.

The colour picker also gained a "pick a colour from the screen" button, shown only in browsers with the EyeDropper API (Chrome and Edge on desktop).

**Sound**

```vue
<script setup lang="ts">
import { SoundToggle, playSound, soundSettings, vSound } from '@/components/ui/sound'
</script>

<template>
  <Button v-sound>Save</Button>                   <!-- the default click -->
  <Button v-sound="'pop'">Add</Button>            <!-- a named sound -->
  <Switch v-sound.toggle v-model="on" />          <!-- "on" or "off", to match the new state -->
  <Button v-sound.hover>Menu</Button>             <!-- plus a faint tick when the pointer arrives -->
  <SoundToggle />                                 <!-- a mute button for the whole page -->
</template>
```

`v-sound` works on any element or single-root component, so nothing about `Button` changes. The sounds are `click`, `tap`, `pop`, `tick`, `on`, `off`, `success`, `error` and `notify`. They are made by the browser's Web Audio API from short recipes in `sound.ts`, so there are no audio files; edit a recipe or add your own. Call `playSound('success')` from code for things that are not a press, such as a form saving.

Sounds are for decoration only: never make one the only sign that something happened. Sound follows the click event, so keyboard users hear the same as mouse users, and disabled controls stay silent. `soundSettings.enabled` and `soundSettings.volume` (0 to 1) apply to the whole page and are remembered in the browser. Sound starts switched off for anyone whose system asks for reduced motion, until they turn it on.

**Typography**

```vue
<Typography variant="display">Ship it</Typography>
<Typography variant="h2">Every push gets a preview</Typography>
<Typography variant="lead">A short introduction.</Typography>
<Typography>Body text.</Typography>
<Typography as="h2" variant="h4">Looks like an h4, is an h2 in the page's outline</Typography>

<Prose><!-- rendered Markdown or CMS content: h1–h6, p, lists, blockquote, code --></Prose>
```

Text sizes are fluid: each one is a `clamp()` that grows smoothly from a narrow-screen size to a wide-screen size, with no breakpoints. Body text goes from 16px at 320px wide to 18px at 1280px; an `h1` from about 40px to 67px. The growing part is written as rem plus a share of the width, never width alone, so text still gets bigger when the reader raises their browser's text size.

| | |
|---|---|
| `variant` | `display`, `h1` to `h4`, `lead`, `body` (default), `small`, `caption`, `overline`. Sets size, weight, line height and the default tag. |
| `as` | The tag to render. Choose it for meaning; `variant` controls the look. |
| `step` | Overrides the size with a step on the scale: 0 is body, 1 one size up, -1 one down. Halves work. |
| `tone="muted"` | Secondary text colour. |
| `measure` | Limits lines to about 65 characters. |
| `balance` | Evens out line lengths. On by default for headings. |
| `lines` | Cuts the text off with "…" after that many lines. |

The scale comes from six variables in `ermine.css`: the body size at each end (`--er-type-min`, `--er-type-max`), how much each step multiplies it by at each end (`--er-type-ratio-min`, `--er-type-ratio-max`), and the widths between which text grows (`--er-type-from`, `--er-type-range`). Change those and every size follows.

To size text to a box instead of the screen, put the class `er-fluid-container` on the box (a card, a sidebar, a column): fluid text inside it then follows that box's width, so the same heading is smaller in a narrow column. `<Prose fluid="container">` does this for itself. To give any other element a fluid size, add the class `er-fluid-type` and set `--er-step` on it.

**Alert dialog**

```vue
<AlertDialog>
  <AlertDialogTrigger as-child><Button variant="destructive">Delete project</Button></AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Delete this project?</AlertDialogTitle>
    <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
    <AlertDialogFooter>
      <AlertDialogCancel />
      <AlertDialogAction variant="destructive" @click="remove">Delete project</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

Unlike a dialog it has no close button and ignores presses outside; Escape counts as Cancel, and focus starts on Cancel.

**Input group, tags input, toggle, pickers**

```vue
<InputGroup>
  <template #prefix>$</template>
  <Input v-model="amount" />
  <template #suffix>USD</template>
</InputGroup>
<PasswordInput v-model="password" autocomplete="new-password" />
<SearchInput v-model="query" placeholder="Search" />

<TagsInput v-model="emails" name="to" :validate="(tag) => isEmail(tag) ? undefined : 'Not an email address.'" />

<Toggle v-model="bold" aria-label="Bold"><strong>B</strong></Toggle>

<TimePicker v-model="time" :step="15" min="07:00" max="19:00" />    <!-- 'HH:MM', 24-hour -->
<DateTimePicker v-model="startsAt" />                               <!-- 'YYYY-MM-DDTHH:MM' -->
<ColorPicker v-model="colour" :presets="['#2a78d6', '#eb6834']" />  <!-- '#rrggbb' -->
```

`TagsInput` finishes a tag on Enter or a comma, and splits a pasted list. `TimePicker` offers times at regular steps from a list; it is not for typing an exact minute. `DateTimePicker`'s value stays unset until both a date and a time are chosen.

**Navigation menu and menubar**

```vue
<NavigationMenu>
  <NavigationMenuItem>
    <NavigationMenuTrigger>Product</NavigationMenuTrigger>
    <NavigationMenuContent>
      <NavigationMenuLink href="/charts" description="Line, bar and more.">Charts</NavigationMenuLink>
    </NavigationMenuContent>
  </NavigationMenuItem>
  <NavigationMenuItem><NavigationMenuLink href="/pricing" active>Pricing</NavigationMenuLink></NavigationMenuItem>
</NavigationMenu>

<Menubar label="Editor">
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <DropdownMenuItem @select="save">Save</DropdownMenuItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

Navigation panels open on hover or click and sit in the page right after their button, so Tab moves straight into them; use `align="end"` on the content for items near the right edge. The menubar is one Tab stop: the left and right arrow keys move between menus, and it takes the dropdown menu's items, like the context menu.

**Tour, banner, timeline, code block**

```vue
<Tour v-model:open="touring" :steps="[
  { target: '#deploy-button', title: 'Deploy from here', description: 'Or just push to main.' },
  { target: '#search', title: 'Find anything', side: 'bottom' },
]" />

<Banner v-model:open="showBanner" variant="info" dismissible>
  Scheduled maintenance on Sunday.
  <template #action><a href="/status">Details</a></template>
</Banner>

<Timeline>
  <TimelineItem title="Promoted to production" time="12 min ago" tone="success">4f2c9a1 by Ines.</TimelineItem>
</Timeline>

<CodeBlock :code="snippet" filename="nuxt.config.ts" line-numbers />
<CopyButton value="dpl_12d5" label="Copy deployment id" />
Press <Kbd>⌘</Kbd> <Kbd>K</Kbd>
```

`CodeBlock` shows plain text; it does no syntax highlighting. To add it, pass highlighted markup through the default slot (without `line-numbers`).

**Event calendar, kanban, virtual list**

```vue
<EventCalendar v-model:month="month" :events="[
  { id: '1', title: 'Release 2.5', start: '2026-10-06', color: 1 },
  { id: '2', title: 'On-call', start: '2026-10-08', end: '2026-10-11', color: 2 },
]" @select="openEvent" @select-date="openDay" />

<Kanban v-model="columns" label="Sprint board" @move="save" />
<!-- columns: [{ id: 'todo', title: 'To do', cards: [{ id: 'k1', title: 'Gift cards' }] }] -->

<VirtualList :items="rows" :item-height="28" style="height: 20rem">
  <template #default="{ item }">{{ item.text }}</template>
</VirtualList>
```

In the kanban board, cards are dragged with a mouse, or moved with Alt plus an arrow key when focused; each move is announced. `VirtualList` needs every row to be the same height.

**More charts**

```vue
<BarList :data="pages" name="path" value="views" label="Top pages" />
<Heatmap :rows="days" :columns="hours" :values="matrix" label="Requests by day and hour" />
<Gauge :value="91" label="Build minutes" :warning="80" :critical="95" />
```

**Stat**

```vue
<Stat label="Requests" :value="1842300" :delta="12.4" delta-label="vs last month" :trend="[41, 44, 47, 45, 53, 59]" />
<Stat label="Error rate" value="0.42%" :delta="-8.1" :up-is-good="false" />
```

A number `value` is shortened (1.8M); a string is shown as given. `delta` is in percent. The arrow and sign show the direction, and the colour shows whether that is good news, which `up-is-good` flips for things like error rate.

**Data table**

```vue
<DataTable
  v-model:selected="selected"
  :rows="deployments"
  :columns="[
    { key: 'commit', label: 'Commit', sortable: true },
    { key: 'seconds', label: 'Build time', sortable: true, align: 'right', format: (value) => `${value} s` },
  ]"
  row-key="id"
  :page-size="10"
  selectable
>
  <template #cell-commit="{ row }"><strong>{{ row.commit }}</strong></template>
</DataTable>
```

Sorting and paging happen in the browser, on the rows you pass. Pressing a heading sorts ascending, then descending, then back to the given order. `v-model:sort`, `v-model:page` and `v-model:selected` are all optional. For a table you lay out yourself, use the `table` parts (`Table`, `TableHeader`, `TableRow`, `TableHead`, `TableCell` ...) directly.

**Pagination, breadcrumb, slider, toggle group**

```vue
<Pagination v-model="page" :page-count="24" />

<Breadcrumb>
  <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
  <BreadcrumbItem :as="NuxtLink" to="/projects/storefront">Storefront</BreadcrumbItem>
  <BreadcrumbItem current>Deployments</BreadcrumbItem>
</Breadcrumb>

<Slider v-model="memory" :min="128" :max="3008" :step="64" />

<ToggleGroup v-model="period" aria-label="Period">  <!-- type="multiple" takes an array -->
  <ToggleGroupItem value="7d">7 days</ToggleGroupItem>
  <ToggleGroupItem value="30d">30 days</ToggleGroupItem>
</ToggleGroup>
```

**Dropdown menu: checkbox items, radio items and submenus**

```vue
<DropdownMenuContent>
  <DropdownMenuCheckboxItem v-model="showPreviews">Preview deployments</DropdownMenuCheckboxItem>
  <DropdownMenuRadioGroup v-model="density">
    <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
    <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
  </DropdownMenuRadioGroup>
  <DropdownMenuSub>
    <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
    <DropdownMenuSubContent>
      <DropdownMenuItem @select="exportCsv">CSV</DropdownMenuItem>
    </DropdownMenuSubContent>
  </DropdownMenuSub>
</DropdownMenuContent>
```

Checkbox and radio items leave the menu open, so several can be changed in one visit; add `close-on-select` to close it. A submenu opens on hover, or with the right arrow key, and the left arrow key or Escape steps back out.

**Date range picker**

```vue
<DateRangePicker v-model="range" start-name="from" end-name="to" :max="today()" />
```

The value is `{ start, end }`, both `'YYYY-MM-DD'` and both included. Press a first day, then a last day (in either order). The presets beside the calendar default to the last 7, 30 and 90 days and month to date; pass your own `presets`, or an empty array for the calendar alone.

**Date picker**

```vue
<DatePicker v-model="due" name="due" :min="today()" :is-date-disabled="isWeekend" />
```

The value is a `'YYYY-MM-DD'` string, the same as `<input type="date">`, so it carries no time or time zone. Month names and the button text use `en-US` unless you pass `locale`; `format` takes any `Intl.DateTimeFormat` options. `Calendar` takes the same `min`, `max`, `is-date-disabled`, `locale` and `week-starts-on` props when you want the grid inline, and the `calendar` folder exports small helpers (`today`, `addDays`, `addMonths`, `formatDate`).

**Skeleton**

```vue
<div :aria-busy="loading">
  <template v-if="loading">
    <Skeleton circle style="height: 2.5rem" />
    <Skeleton style="width: 60%" />
    <Skeleton animation="shimmer" style="height: 8rem" />
  </template>
  <Profile v-else :user="user" />
</div>
```

A skeleton is one line of text by default; size it with `width` and `height`. Each one is hidden from screen readers, so put `aria-busy` on the region that is loading. Set `--er-skeleton` to change the colour and `--er-skeleton-highlight` to change the shimmer band.

**Toast**

```vue
<Toaster />  <!-- once, near the root of the app -->
```

```ts
toast('Settings saved')
toast.error('Build failed', { description: 'Type error in cart/total.ts' })
toast('Deployment archived', { action: { label: 'Undo', onClick: restore } })
```

## How the project is laid out

```
registry/
  styles/ermine.css     theme tokens, base styles, shared floating styles
  lib/                 behavior helpers (copied into the user's project)
    primitive.ts         Primitive (as / as-child) and Portal
    floating.ts          positioning: flip, shift, follow scroll and resize
    layer.ts             Escape / outside press, focus in and out, nested layers
    collection.ts        arrow-key navigation and type-to-select
    scroll-lock.ts       page scroll lock for modals
    context.ts           typed provide / inject for compound components
  ui/<name>/           one folder per component, with an index.ts
  blocks/<name>/       one folder per block; imports components as ../../ui/<name>
cli/                   the `ermine` command (no dependencies) and registry.json
scripts/build-registry.mjs   packs registry/ into cli/registry.json
playground/            Vite app showing every component
```

### Adding a component

1. Create `registry/ui/<name>/` with the `.vue` files and an `index.ts` that exports them. Start `index.ts` with a `/** Name — one-line description. */` comment; `ermine list` shows it.
2. Import helpers as `../../lib/<helper>`. The CLI rewrites these paths for each project.
3. Put styles in a `<style>` block wrapped in `@layer components { ... }`, with classes prefixed `er-`.
4. Run `npm run registry`. Dependencies are read from the import statements, so there is no manifest to maintain.
5. Add a demo to `playground/src/App.vue`.

## Testing

```sh
npm test                # everything below, in order
npm run typecheck       # vue-tsc in strict mode
npm run check:registry  # every component installs cleanly on its own
npm run test:unit       # helper functions, with Node's built-in test runner
npm run test:e2e        # the playground in real browsers, with Playwright
```

The browser tests need the browsers once: `npx playwright install chromium firefox webkit`. To run part of the suite, name a file or a browser: `npx playwright test menus --project=webkit`.

- **Unit tests** (`tests/unit`) cover the pure logic: date arithmetic, chart scales and paths, colour conversion, validation rules, overlay positioning, the sound recipes, the command line (run for real in throwaway folders) and the QR code generator (every size and error-correction level is decoded by an independent reader).
- **Browser tests** (`tests/e2e`) build the playground and drive it with real keyboard and mouse input in Chromium, Firefox and WebKit, plus a phone-sized screen. They find things the way a person or a screen reader does (by role and name), so a missing label fails a test. Each test also fails if the page logs an error.
- **Accessibility scan** (`tests/e2e/accessibility.spec.ts`) runs axe over the whole page and over open overlays, in light and dark themes. It checks what a machine can check (names, roles, ARIA usage, colour contrast); it is not a substitute for testing with a screen reader.
- **Screen reader tests** (`tests/e2e/screen-reader.spec.ts`) run a simulated screen reader inside the page and check what would be spoken: each control's role, name and state, the order things are read in, and the announcements made when something changes (an error appearing, a toast, a chart value, a card moving). The simulator follows the same accessibility rules real screen readers do, but it is not one. It has no speech and none of the quirks of VoiceOver, NVDA or JAWS, so it catches a missing name or a silent change, not an awkward experience.
- **Registry check** (`scripts/check-registry.mjs`) runs the real CLI once per component and block into an empty folder and confirms every import in what was copied points at a file that was also copied.

## What has been checked

- The suite above passes: 55 unit tests and 512 browser tests (191 in Chromium, 158 each in Firefox and WebKit, 5 on the phone profile). Firefox and WebKit skip the axe scans and the simulated screen reader tests, which read the page's structure and so do not differ by browser, and two tests that need clipboard access only Chromium grants.
- On 6 October 2026 the CLI was run in three fresh projects with the 72 components that existed then (the 14 added since have been through the per-component registry check, not this run): `init`, `add --all`, `list`, then the project's own type-check and production build, with a page that renders every component.
  - Vue 3.5 + Vite 8 + TypeScript 6 (`npm create vite`, `vue-ts` template): `vue-tsc -b` and build pass; the built page runs with no console errors.
  - Nuxt 4.6: `nuxt typecheck` and `nuxt build` pass, with the `components` auto-import setting shown above. The page renders on the server and hydrates with no hydration warnings in development mode, and components used by auto-import alone (no import statements) work.
  - Astro 7.3 with `@astrojs/vue`: `astro check` and `astro build` pass. The page hydrates as one island with no warnings, and `Button`, `Badge` and `Card` render straight from an `.astro` file with no client directive.

## Known limits

- Tested in Playwright's builds of Chromium, Firefox and WebKit, which are close to but not the same as Chrome, Firefox and Safari as shipped; nothing has been tried on a real phone. The CSS uses `light-dark()`, `@layer`, `color-mix()` and `oklch()`, which need browsers from 2024 onward.
- Native controls keep their browser's own keyboard habits. Radio groups, for example, wrap round at the ends in Chrome and Firefox and stop in Safari, and Safari only tabs to buttons and links with Option held unless the reader has changed that setting.
- No testing with a real screen reader yet. Roles, labels and keyboard behavior follow the WAI-ARIA authoring patterns, pass an automated axe scan, and are checked with a simulated screen reader, but none of those is a substitute for VoiceOver, NVDA or JAWS in the hands of someone who uses one.
- Overlays render after mount, not on the server. A `Select` with a value shows that raw value in server HTML and swaps in the item's label on hydration; pass the label through the trigger's slot if that flash matters.
- No right-to-left layout handling, and the select is single-choice. Submenus go one level deep in testing; deeper nesting is untried. The slider has one thumb. The data table sorts and pages in the browser only. The combobox is single-choice too and filters only the items you give it (no remote search). The line, area and bar chart has a category axis only (no time or number scale along the bottom), one value axis, and at most eight coloured series. The date pickers have no typed entry and no month or year dropdowns, and the range picker shows one month at a time.
- The multi-select filters only the items you give it. The file upload does not upload. The command palette searches item text and keywords by plain word match, with no fuzzy matching or ranking.
- Several components depend on browser features that vary: vibration works on Android only, the share sheet mainly on phones, the eyedropper in Chrome and Edge on desktop, wake lock and view transitions in recent browsers. Each was tested against a stand-in for the feature, which shows the component calls it correctly, not how it feels on a real device.
- Sounds are synthesized tones, not recordings, so they are simple by nature. They were checked by recipe (length, loudness, pitch) and by confirming the right tones are requested; nobody has listened to them on a range of speakers. A browser tab muted by the user stays silent, as it should.
- Fluid type uses the CSS `pow()` function and container query units, which need browsers from late 2023 onward.
- The kanban board's dragging uses the browser's built-in drag and drop, which does not work on touch screens; the keyboard moves do. The event calendar lists a multi-day event on each of its days instead of drawing one bar across them, and has no week or day view. The colour picker has no transparency. The time picker has no free typing.
- The tree selects one node and has no checkboxes, drag-and-drop or lazy loading. The carousel does not loop or autoplay. Resizable panels cannot be collapsed to nothing.
