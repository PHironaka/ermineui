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
| `button` | Six variants, four sizes, a loading state; renders as any tag or component |
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
| `range-slider` | Two thumbs on one track for a lowest and a highest value, such as a price range |
| `masked-input` | Field that lays out what is typed in a fixed shape: card numbers, expiry dates, phone numbers |
| `swatch` | One choice from a few as colour dots or small labelled boxes; unavailable ones struck through |
| `option-card` | A radio button as a whole card with a title, a line of detail and a price |
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
| `data-table` | Table from rows and columns, with sorting, search, filters, row selection and bulk actions, rows that open, columns to hide, a fixed heading and pages; or all of that done by your server |
| `filter-bar` | A menu of tick boxes per property, the choices in use as removable tags, and one button to clear them |
| `price` | An amount as money, with the old price struck through and the saving when it is reduced |
| `product-card` | A product's picture, name, score and price as one link, with room for a badge and actions |
| `product-gallery` | One large picture with thumbnails to switch between; swipe, arrow keys and hover zoom |
| `cart-line-item` | One product in a cart: picture, name, variant, quantity, line total and a remove button |
| `order-summary` | Subtotal, discount, shipping and tax added up to a total |
| `quantity-stepper` | A compact minus, count and plus; at one, the minus can become a bin that removes the item |
| `wishlist-button` | A heart that fills when something is saved for later, alone or with its words |
| `shipping-method` | Ways to deliver as cards to pick one from, each with when it arrives and what it costs |
| `mini-cart` | The cart as a panel from the side: items, quantities, subtotal and the way to the checkout |
| `order-tracker` | Where a parcel has got to, as a line that fills, with the date of each stage |
| `comparison-table` | Products or plans side by side, one row per property, with ticks for what each has |
| `pricing-table` | Plans with what each costs and includes, a monthly / yearly switch, and one plan marked out |
| `size-guide` | Measurements for each size, in centimetres or inches, with one size marked |
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
| `image-fan` | A few framed pictures overlapping like a hand of cards, tilted outward from the middle; each lifts to the front on hover or focus, and the whole fan shrinks to fit |
| `sticky-scroll` | Two columns: one stays put showing a picture or a large heading, and changes as each step's copy scrolls past the middle of the window; one column on narrow screens |
| `icon` | 62 built-in line icons that take the size and colour of the text around them; add your own with `registerIcons()` |
| `segmented-control` | One choice from two to five, side by side in a single track |
| `toolbar` | A row of controls that takes one stop in the tab order; arrow keys move between them |
| `meter` | A bar for a reading in a known range, changing colour past the levels you call low and high |
| `phone-input` | A calling code and a number as one international value, laid out the way that country writes it |
| `password-strength` | A four-step bar and a word for how strong a password is, with the rules ticked off |
| `rich-text-editor` | Bold, italic, headings, lists, quotes and links, giving back clean HTML; no editor library |
| `markdown` | Markdown shown as styled content; safe for text written by other people |
| `emoji-picker` | Emoji in groups with a search box, arrow-key movement and a name for each |
| `image-cropper` | Drag and zoom a picture behind a fixed frame, then cut it out as a file |
| `chat` | A conversation as bubbles that stays scrolled to the newest message, and a box that sends on Enter |
| `comment-thread` | Comments with replies nested under them and a reply box that opens under any one |
| `notification-center` | A bell with an unread count, opening a list that is marked read as it is pressed |
| `json-viewer` | Any value as a tree to open and close, each kind of value in its own colour |
| `diff-viewer` | Two versions of a text compared line by line, in one column or side by side |
| `media-player` | Video or audio with its own controls: play, seek, volume, captions, speed, full screen |
| `marquee` | Items drifting sideways in a loop, with a pause button; still under reduced motion |
| `app-bar` | A phone's top bar: back button, the name of the screen and a few actions |
| `bottom-nav` | A phone's tab bar: a few destinations along the bottom edge, with an optional count |
| `fab` | A round button over the corner of the screen that can open into a short stack of actions |
| `action-sheet` | A short list of things to do, sliding up from the bottom with Cancel underneath |
| `swipe-actions` | A row that slides aside under a finger to uncover buttons; the keyboard reaches them by tabbing |
| `pull-to-refresh` | Drag the top of a list down to load it again, with a `refresh` function for everyone else |
| `infinite-scroll` | Asks for the next page as the end of a list comes into view, with a retry and an end line |
| `install-prompt`, `update-prompt` | Offer to add the app to the home screen; say a new version is ready and reload into it |

## Blocks

A block is a section of a page, or a whole page, already put together from the components above. `ermine add <block>` copies it into a `blocks` folder beside your components, along with every component it uses. It is a starting point: open the file and change it.

| | |
|---|---|
| `dashboard` | App page with a collapsing sidebar, a top bar with a user menu, headline numbers, an area chart, a bar list and a sortable table. `DashboardShell` is the frame on its own, for your other pages |
| `sign-in` | Email and password on a card, checked before it is sent, with a loading state and a place for the server's error |
| `settings` | Account settings in tabs: a profile form, notification switches, and a delete button behind a confirmation |
| `cart` | The items in a cart with quantities to change, a discount code field, the sums and a checkout button; an empty state when there is nothing in it, and a link to share the cart if you want one |
| `checkout` | Contact, delivery address, delivery choice and card details in one checked form, beside a summary of the order |
| `product-detail` | A product's page: pictures, price, stock, options, quantity and "Add to cart", then details and reviews |
| `product-listing` | A grid of products with filters, a way to sort, a wishlist heart on each, and pages |
| `order-confirmation` | The page after paying: the order number, where it has got to, where it is going and what was bought |
| `order-history` | Past orders with their status and contents; ones still on their way show how far they have got |
| `sign-up` | Name, email and a password with a strength meter, terms to agree to, and a link to sign in |
| `forgot-password` | Asks for an email to send a reset link to, then says to check the inbox |
| `not-found` | The page for a wrong address or an error: what happened, a search box and the way home |

**Sharing a cart.** Give `Cart` the `shareable` prop and it shows a "Share cart" button, which opens the share sheet on a phone and copies the link elsewhere. The link holds only product ids and quantities, such as `/cart?cart=mug-sand:2,lamp-ink:1`. The page it opens reads the cart back with `readCartLink`, looking each id up in your own catalogue. An edited link cannot change a price, and an old one shows today's. Lines the catalogue does not know are left out and listed in `skipped`. Quantities over a product's `max` are lowered, and those products are listed in `limited`.

```ts
import { readCartLink } from '@/components/blocks/cart'

const shared = readCartLink(window.location.href, (id) => products.find((product) => product.id === id))
if (shared) items.value = shared.items // null when the address has no cart in it
```

`shareUrl` sets the page the link opens (by default the one the cart is on), and `shareParam` the query parameter's name.

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
| `ermine theme <base> <accent>` | Apply colour themes to your stylesheet (no names: list them; `--reset` removes them) |
| `ermine mcp` | Run as an MCP server for AI coding tools (see below) |
| `--registry <url or path>` | Read components from a different `registry.json`, such as your own fork |

### With AI coding tools

`ermine mcp` is a Model Context Protocol server. Connect it and your coding assistant can list the components, read one's source before using it, set the project up and add components itself. It has five tools: `list_components`, `get_component`, `init_project`, `add_components` and `set_theme`.

```sh
claude mcp add ermine -- npx -y ermineui mcp          # Claude Code
```

```toml
# Codex: ~/.codex/config.toml
[mcp_servers.ermine]
command = "npx"
args = ["-y", "ermineui", "mcp"]
```

```json
// Cursor: .cursor/mcp.json
{ "mcpServers": { "ermine": { "command": "npx", "args": ["-y", "ermineui", "mcp"] } } }
```

The website also serves `/llms.txt`, an index of every component for tools that read the web, and a Markdown page per component (`/components/button.md`) with its source.

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

**Colour themes.** Ready-made sets of those variables, in two kinds you combine: a **base** tints the surfaces, text and lines (`neutral`, the default, `slate`, `stone`, `zinc`, `mauve`, `sage`, `olive`, `sand`, `mist`, `blush`) and an **accent** sets the primary colour and focus ring (`red`, `orange`, `amber`, `green`, `teal`, `cyan`, `blue`, `indigo`, `violet`, `fuchsia`, `pink`, `rose`). Every pairing keeps text at 4.5:1 contrast and the focus ring at 3:1, in light and dark.

```sh
npx ermineui theme slate blue    # or one at a time; picking a base keeps the accent, and the other way round
npx ermineui theme --reset       # back to the stylesheet's own colours
npx ermineui init --theme slate,blue
```

The command writes each theme at the end of your stylesheet in its own marked block and replaces only that block next time; nothing else in the file changes. To adjust a colour, set it again in a rule after the block. The website's Themes page previews them and gives the CSS to paste by hand.

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
<Spinner />
<Button :loading="saving" @click="save">Save</Button>  <!-- a spinner, and no second press, while saving is true -->
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

The rest is switched on a piece at a time:

```vue
<DataTable
  v-model:selected="selected"
  v-model:filters="filters"
  :rows="deployments"
  :columns="columns"
  row-key="id"
  selectable
  searchable
  column-toggle
  max-height="24rem"
  label="Deployments"
>
  <template #toolbar>
    <FilterBar v-model="filters" :facets="[{ key: 'status', label: 'Status', options: facetOptions(deployments, 'status') }]" />
  </template>
  <template #bulk="{ selected, clear }">
    <Button size="sm" variant="outline" @click="redeploy(selected).then(clear)">Redeploy</Button>
  </template>
  <template #expanded="{ row }">Deployed from {{ row.branch }} by {{ row.author }}.</template>
</DataTable>
```

- `searchable` adds a search field that looks through the text of every column (`v-model:search`).
- `v-model:filters` is an object of column key to the values to keep, which is exactly what `FilterBar` produces; `facetOptions(rows, key)` lists a column's different values with a count of each. `FilterBar` works on its own too, above a chart or a grid of cards.
- `column-toggle` adds a "Columns" menu (`v-model:hidden`); give a column `hideable: false` to keep it out of the menu.
- The `#bulk` slot is shown above the table while any row is ticked. The `#expanded` slot adds a button to each row that opens it underneath (`v-model:expanded`).
- `max-height` scrolls the rows inside a box with the headings staying in view. On a surface other than the page, set `--er-data-table-surface` to that surface's colour.
- `manual` is for rows that come from a server already searched, filtered, sorted and cut into pages: the table shows `rows` as given and takes its page count from `total`. Watch `sort`, `page`, `search` and `filters`, fetch to match, and set `loading` while you wait.

**Price, swatch, product card, product gallery**

```vue
<Price :amount="96" :compare-at="120" show-saving />   <!-- $96.00, $120.00 struck through, "Save 20%" -->
<Price :amount="9" unit="/ month" currency="EUR" locale="de-DE" />

<SwatchGroup v-model="colour" label="Colour">
  <Swatch value="sand" color="#c9b79c" label="Sand" />
  <Swatch value="chalk" color="#f5f3ee" label="Chalk" unavailable />
</SwatchGroup>
<SwatchGroup v-model="size" label="Size">
  <Swatch value="s">S</Swatch>
  <Swatch value="m">M</Swatch>
</SwatchGroup>

<ProductCard title="Wool throw" href="/products/wool-throw" image="/img/throw.jpg" brand="Fell & Co" :price="96" :compare-at="120" :rating="4.8" :reviews="64" badge="Sale">
  <template #action><Button variant="secondary" size="icon" aria-label="Save for later"><Icon name="heart" /></Button></template>
  <Button variant="outline" size="sm" @click="add">Add to cart</Button>
</ProductCard>

<ProductGallery v-model="picture" :images="[{ src: '/img/mug-1.jpg', alt: 'Front of the mug' }, …]" thumbnails="left" zoom />
```

Amounts are in whole units of the currency (24.5 is $24.50), and `formatMoney(amount, currency, locale)` from the same folder writes one as text. A reduced price is read to screen readers as "Now … Was …". Swatches are real radio buttons; one with a `color` is a round dot and needs a `label` to name it. The product card's title is its link and the whole card is the press area; what goes in the `#action` slot and the default slot stays pressable on top. The gallery is built on the carousel, so it swipes and takes the arrow keys; `zoom` magnifies under a mouse pointer only.

**Range slider and masked input**

```vue
<RangeSlider v-model="priceRange" :min="0" :max="200" :step="5" :min-gap="10" low-label="Lowest price" high-label="Highest price" />

<MaskedInput v-model="card" :mask="masks.card" autocomplete="cc-number" />
<MaskedInput v-model="code" mask="AA-####" />
```

The range slider's value is a pair, `[low, high]`, and the thumbs stop short of each other by `min-gap`. It is two native range inputs on one track, so each thumb has its own keyboard support and label; with a `name`, a form gets `<name>-min` and `<name>-max`. In a mask, `#` is a digit, `A` a letter and `*` either; anything else is put in for the typist. The value you get is what was typed, without those extras (`4242424242424242`, not `4242 4242 …`). `masks` has `card`, `amex`, `expiry`, `cvc`, `phoneUS` and `zipUS`.

**Option card, cart line item, order summary**

```vue
<RadioGroup v-model="delivery" aria-label="Delivery">
  <OptionCard value="standard" title="Standard" description="3 to 5 working days"><template #end>Free</template></OptionCard>
  <OptionCard value="express" title="Express" description="1 to 2 working days"><template #end>$12.00</template></OptionCard>
</RadioGroup>

<CartLineItem v-model:quantity="item.quantity" :title="item.title" :image="item.image" options="Sand / 350 ml" :price="24" :max="6" @remove="remove(item)" />

<OrderSummary :subtotal="144" :discount="10" discount-label="SAVE10" :shipping="0" :tax="11.52">
  <template #footer><Button size="lg">Checkout</Button></template>
</OrderSummary>
```

An option card goes inside a `RadioGroup` and is that group's radio button with a card for a label. `CartLineItem` with `readonly` shows the quantity as text, for an order being paid for or already placed. `OrderSummary` works out the total unless you pass one; a `shipping` of 0 reads "Free", and leaving it out reads "Calculated at checkout".

**Cart and checkout blocks**

```vue
<Cart v-model:items="items" :shipping="shipping" :discount="discount" :code-error="codeError" @apply-code="checkCode" @checkout="goToCheckout" />

<Checkout :items="items" :shipping-methods="methods" :tax="tax" :loading="paying" :error="paymentError" @submit="placeOrder">
  <!-- For real payments: your provider's own card fields, so card numbers never touch your pages. -->
  <template #payment><div id="card-element" /></template>
</Checkout>
```

The cart emits `applyCode` and leaves the checking to you: set `discount` when the code is good, `codeError` when it is not. The checkout emits `submit` only once every field passes. Its built-in card fields are for prototypes and for providers that take card details from you; with the `#payment` slot filled they are not shown or checked, and `submit` carries no card.

**Quantity stepper, wishlist button, segmented control**

```vue
<QuantityStepper v-model="quantity" :max="stock" removable label="Quantity of Wool throw" @remove="remove(item)" />
<WishlistButton v-model="saved" label="Save Wool throw for later" />

<SegmentedControl v-model="view" label="View">
  <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
  <SegmentedControlItem value="list">List</SegmentedControlItem>
</SegmentedControl>
```

`QuantityStepper` is for counts that are pressed, not typed; use `number-input` where typing a number makes sense. A segmented control is a radio group underneath, so it works in forms and with the arrow keys.

**Shipping method, order tracker, mini cart**

```vue
<ShippingMethod v-model="method" :methods="[{ id: 'standard', title: 'Standard', eta: '3 to 5 working days', price: 0 }]" />

<OrderTracker :current="3" :stages="[{ label: 'Ordered', date: 'Oct 12' }, 'Packed', 'Shipped', 'Delivered']">Arriving Friday.</OrderTracker>

<MiniCart v-model:open="open" v-model:items="items" cart-href="/cart" @checkout="goToCheckout">
  <template #trigger="{ count }"><Button variant="outline">Cart ({{ count }})</Button></template>
</MiniCart>
```

`current` counts stages from 1; one past the last shows them all as done. Set `problem` and say what is wrong in the slot when an order is held up.

**Comparison table, pricing table, size guide**

```vue
<ComparisonTable caption="Mugs compared" :columns="[{ key: 'mug', title: 'Mug' }, { key: 'travel', title: 'Travel mug', highlight: true }]" :rows="[{ label: 'Lid included', values: { mug: false, travel: true } }]" />

<PricingTable v-model:billing="billing" :plans="plans" current="hobby" @select="(plan, billing) => choose(plan, billing)" />

<SizeGuide v-model:unit="unit" :measures="[{ key: 'chest', label: 'Chest' }]" :sizes="[{ size: 'M', measurements: { chest: [96, 101] } }]" selected="M" />
```

In a comparison, `true` and `false` are drawn as a tick and a dash and read out as "Yes" and "No". A plan's `price` is a number, or `{ monthly, yearly }` to offer both; leave it out for "Contact us". Size measurements are given in centimetres and converted to the nearest half inch.

**Phone input, password strength, toolbar, meter**

```vue
<PhoneInput v-model="phone" default-country="GB" />   <!-- "+447700900123" -->
<PasswordStrength :password="password" />

<Toolbar label="Text alignment">
  <ToolbarButton label="Align left" :pressed="align === 'left'" @click="align = 'left'"><Icon name="menu" /></ToolbarButton>
  <ToolbarSeparator />
  <ToolbarButton @click="copy">Copy</ToolbarButton>
</Toolbar>

<Meter label="Storage used" :value="42" :max="64" :low="32" :high="56" optimum="low" :format="(value, max) => `${value} GB of ${max} GB`" />
```

`PasswordStrength` is a nudge for the person typing, not a check: pass `requirements` that match what your server enforces, or a `score` function to use a library such as zxcvbn. `phoneCountries` in `phone.ts` is a starting list of 28 countries; add the ones you need.

**Rich text editor and Markdown**

```vue
<RichTextEditor v-model="html" label="Description" placeholder="Describe the product" />
<Markdown :source="text" :heading-offset="1" />
```

The editor gives back HTML limited to the formatting on its toolbar, and strips what is pasted in down to the same. Clean it again on your server before storing it (`cleanHtml` needs a browser). `Markdown` escapes everything in its source and writes only its own tags, so it is safe for text from strangers; it is a small renderer, not full CommonMark, and takes a `render` function if you would rather use a library.

**Emoji picker and image cropper**

```vue
<EmojiPicker v-model:recent="recent" @select="(emoji) => (message += emoji)" />

<ImageCropper ref="cropper" v-model="crop" :src="pictureUrl" round />
<Button @click="async () => upload(await cropper.crop({ width: 512 }))">Save</Button>
```

`crop()` resolves to a `Blob`, or to `null` if the picture has not loaded or comes from a site that does not allow it (set `crossorigin` for those). Put the picker in a `Popover` to open it from a button.

**Chat, comment thread, notification centre**

```vue
<ChatThread label="Chat with support" :typing="typing">
  <ChatMessage v-for="message in messages" :key="message.id" :mine="message.mine" author="Support" :time="message.time">{{ message.text }}</ChatMessage>
</ChatThread>
<ChatComposer @send="send" />

<CommentThread :comments="comments" @submit="add" @reply="(text, parent) => reply(text, parent)" @delete="remove" />

<NotificationCenter v-model:items="notifications" @select="open" />
```

Give `ChatThread` a height (it fills a flex column); it stays at the newest message unless the reader has scrolled up, and then offers a "New messages" button instead. Comments and replies are plain text.

**JSON viewer, diff viewer, media player, marquee**

```vue
<JsonViewer :value="payload" :expand-depth="2" />
<DiffViewer :before="oldText" :after="newText" view="split" title="config.ts" />

<MediaPlayer title="Product tour" src="/tour.mp4" poster="/tour.jpg">
  <track kind="captions" src="/tour.vtt" srclang="en" label="English" />
</MediaPlayer>

<Marquee label="Customers"><img v-for="logo in logos" :key="logo.name" :src="logo.src" :alt="logo.name" /></Marquee>
```

**App bar, FAB, action sheet, swipe actions**

```vue
<AppBar title="Orders" back @back="router.back()">
  <template #end><button class="er-app-bar-button" aria-label="Search"><Icon name="search" /></button></template>
</AppBar>

<Fab label="New"><template #actions><FabAction @select="newOrder">New order</FabAction></template></Fab>

<ActionSheet title="Wool throw">
  <template #trigger><Button>Options</Button></template>
  <ActionSheetItem @select="share">Share</ActionSheetItem>
  <ActionSheetItem destructive @select="remove">Remove</ActionSheetItem>
</ActionSheet>

<SwipeActions>
  <div class="row">…</div>
  <template #actions><button data-destructive @click="remove">Delete</button></template>
</SwipeActions>
```

Without the `actions` slot a `Fab` is a plain button that emits `click`. Set `--er-fab-offset` to lift it above a bottom nav.

**Pull to refresh, infinite scroll, install and update prompts**

```vue
<PullToRefresh v-slot="{ refresh }" :on-refresh="reload">
  <Button @click="refresh">Refresh</Button>
  <InfiniteScroll :loading="loading" :done="!hasMore" :error="error" @load="loadNextPage">…your list…</InfiniteScroll>
</PullToRefresh>

<InstallPrompt description="Opens straight to your orders, and works offline." />
<UpdatePrompt />
```

A pull cannot be done with a keyboard or a mouse, so keep a button that calls `refresh`. `InstallPrompt` shows only when the browser offers installing (or, on iPhones, with the steps to do it by hand) and remembers "Not now" for 14 days. `UpdatePrompt` watches your service worker and posts `{ type: 'SKIP_WAITING' }` to the waiting one; the worker has to call `skipWaiting()` when it gets that.

**Shop blocks**

```vue
<ProductDetail :product="product" v-model:saved="saved" :loading="adding" @add-to-cart="add" />
<ProductListing :products="products" v-model:saved="wishlist" :page-size="12" @add-to-cart="add" />
<OrderConfirmation :order="order" track-href="/orders/10482" />
<OrderHistory :orders="orders" @view="open" @reorder="buyAgain" />
```

`ProductListing` filters, sorts and pages the products you give it in the browser; for a large catalogue, do that on your server and build the page from `filter-bar`, `product-card` and `pagination` directly.

**Sign up, forgot password, not found**

```vue
<SignUp :loading="loading" :error="error" terms-href="/terms" sign-in-href="/sign-in" @submit="createAccount" />
<ForgotPassword v-model:sent="sent" :loading="loading" @submit="sendLink" />
<NotFound search @search="(query) => router.push({ path: '/search', query: { q: query } })" />
```

Set `sent` whether or not the address has an account, so the form does not tell a stranger who is a customer. `NotFound` takes a `code`, `title` and `description`, so the same block serves a 500 or an offline page; `retry` adds a "Try again" button.

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
  themes/base|accent/   colour themes: :root blocks of variables that "ermine theme" writes into a project
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

- The suite above passes: 92 unit tests and 786 browser tests (283 in Chromium, 247 in Firefox, 248 in WebKit, 8 on the phone profile). Firefox and WebKit skip the axe scans and the simulated screen reader tests, which read the page's structure and so do not differ by browser, and two tests that need clipboard access only Chromium grants.
- On 6 October 2026 the CLI was run in three fresh projects with the 72 components that existed then (the 14 added since have been through the per-component registry check, not this run): `init`, `add --all`, `list`, then the project's own type-check and production build, with a page that renders every component.
  - Vue 3.5 + Vite 8 + TypeScript 6 (`npm create vite`, `vue-ts` template): `vue-tsc -b` and build pass; the built page runs with no console errors.
  - Nuxt 4.6: `nuxt typecheck` and `nuxt build` pass, with the `components` auto-import setting shown above. The page renders on the server and hydrates with no hydration warnings in development mode, and components used by auto-import alone (no import statements) work.
  - Astro 7.3 with `@astrojs/vue`: `astro check` and `astro build` pass. The page hydrates as one island with no warnings, and `Button`, `Badge` and `Card` render straight from an `.astro` file with no client directive.

- On 7 October 2026 the three blocks and the icon component were installed from the packed 0.2.0 CLI into a fresh Vue + Vite project (`npm create vite`, `vue-ts` template); `vue-tsc -b` and the build pass. Blocks have not been tried in Nuxt or Astro.

## Known limits

- Tested in Playwright's builds of Chromium, Firefox and WebKit, which are close to but not the same as Chrome, Firefox and Safari as shipped; nothing has been tried on a real phone. The CSS uses `light-dark()`, `@layer`, `color-mix()` and `oklch()`, which need browsers from 2024 onward.
- Native controls keep their browser's own keyboard habits. Radio groups, for example, wrap round at the ends in Chrome and Firefox and stop in Safari, and Safari only tabs to buttons and links with Option held unless the reader has changed that setting.
- No testing with a real screen reader yet. Roles, labels and keyboard behavior follow the WAI-ARIA authoring patterns, pass an automated axe scan, and are checked with a simulated screen reader, but none of those is a substitute for VoiceOver, NVDA or JAWS in the hands of someone who uses one.
- Overlays render after mount, not on the server. A `Select` with a value shows that raw value in server HTML and swaps in the item's label on hydration; pass the label through the trigger's slot if that flash matters.
- No right-to-left layout handling, and the select is single-choice. Submenus go one level deep in testing; deeper nesting is untried. The range slider cannot be turned on its side. The filter bar has tick-box facets only, with no date or number ranges and no saved views. The combobox is single-choice too and filters only the items you give it (no remote search). The line, area and bar chart has a category axis only (no time or number scale along the bottom), one value axis, and at most eight coloured series. The date pickers have no typed entry and no month or year dropdowns, and the range picker shows one month at a time.
- The multi-select filters only the items you give it. The file upload does not upload. The command palette searches item text and keywords by plain word match, with no fuzzy matching or ranking.
- Several components depend on browser features that vary: vibration works on Android only, the share sheet mainly on phones, the eyedropper in Chrome and Edge on desktop, wake lock and view transitions in recent browsers. Each was tested against a stand-in for the feature, which shows the component calls it correctly, not how it feels on a real device.
- Sounds are synthesized tones, not recordings, so they are simple by nature. They were checked by recipe (length, loudness, pitch) and by confirming the right tones are requested; nobody has listened to them on a range of speakers. A browser tab muted by the user stays silent, as it should.
- Fluid type uses the CSS `pow()` function and container query units, which need browsers from late 2023 onward.
- The kanban board's dragging uses the browser's built-in drag and drop, which does not work on touch screens; the keyboard moves do. The event calendar lists a multi-day event on each of its days instead of drawing one bar across them, and has no week or day view. The colour picker has no transparency. The time picker has no free typing.
- The rich text editor is built on `document.execCommand`, which browsers still support but mark as obsolete; it has no tables, images or collaborative editing, and the HTML it produces differs a little between browsers. The Markdown renderer covers the common syntax only: no raw HTML, footnotes, reference-style links or bare-URL autolinking.
- The password strength score is a rough heuristic, not an estimate of cracking time. The phone input lays numbers out by one fixed pattern per country and does not check that a number is valid; use a library such as libphonenumber for that. The emoji picker has about 350 emoji and no skin tones.
- Swipe actions, pull to refresh and the image cropper's pinch are driven by touch and have only been exercised through their keyboard and button paths in the tests, never with a finger. The install and update prompts were tested with the browser's part faked: no real install prompt or service worker update was involved. The media player was tested with audio only; video, captions and full screen are untested.
- `ProductListing` and the comparison, pricing and size tables hold everything in the page; none of them fetches or pages on a server.
- The tree selects one node and has no checkboxes, drag-and-drop or lazy loading. The carousel does not loop or autoplay. Resizable panels cannot be collapsed to nothing.
