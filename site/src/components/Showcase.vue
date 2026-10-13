<script setup lang="ts">
import { ref } from 'vue'
import { Avatar, AvatarGroup } from '@registry/ui/avatar'
import { Badge } from '@registry/ui/badge'
import { Button } from '@registry/ui/button'
import { Calendar } from '@registry/ui/calendar'
import { Chart } from '@registry/ui/chart'
import { Checkbox } from '@registry/ui/checkbox'
import { CommandGroup, CommandItem, CommandPalette } from '@registry/ui/command'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@registry/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@registry/ui/dropdown-menu'
import { Input } from '@registry/ui/input'
import { Kanban, type KanbanColumn } from '@registry/ui/kanban'
import { Kbd } from '@registry/ui/kbd'
import { Label } from '@registry/ui/label'
import { Price } from '@registry/ui/price'
import { Progress } from '@registry/ui/progress'
import { Rating } from '@registry/ui/rating'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@registry/ui/select'
import { Slider } from '@registry/ui/slider'
import { Stat } from '@registry/ui/stat'
import { Switch } from '@registry/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@registry/ui/tabs'
import { Toaster, toast } from '@registry/ui/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@registry/ui/tooltip'

const name = ref('northwind-storefront')
const region = ref('fra1')
const previews = ref(true)
const checks = ref(true)
const memory = ref(1024)
const date = ref('2026-10-23')
const score = ref(4)
const commandOpen = ref(false)
const lastCommand = ref('')

const traffic = [
  { week: 'Aug 3', requests: 41200, cached: 28100 },
  { week: 'Aug 10', requests: 43800, cached: 30400 },
  { week: 'Aug 17', requests: 47100, cached: 31900 },
  { week: 'Aug 24', requests: 45300, cached: 33800 },
  { week: 'Aug 31', requests: 52600, cached: 37200 },
  { week: 'Sep 7', requests: 58900, cached: 43100 },
  { week: 'Sep 14', requests: 61400, cached: 46800 },
  { week: 'Sep 21', requests: 59200, cached: 47900 },
  { week: 'Sep 28', requests: 66800, cached: 52300 },
]
const trafficSeries = [
  { key: 'requests', label: 'Requests' },
  { key: 'cached', label: 'Served from cache' },
]

const board = ref<KanbanColumn[]>([
  { id: 'todo', title: 'To do', cards: [{ id: 'k1', title: 'Add saved addresses' }, { id: 'k2', title: 'Search filters' }] },
  { id: 'doing', title: 'In progress', cards: [{ id: 'k4', title: 'Checkout redesign' }] },
  { id: 'done', title: 'Done', cards: [{ id: 'k5', title: 'Cart rounding fix' }] },
])
</script>

<template>
  <div class="bento">
    <section class="tile span-2" aria-label="Form controls">
      <header><h3>Forms</h3><p>Native inputs underneath, so they are small, fast and work in a plain form.</p></header>
      <div class="form">
        <div class="field"><Label for="show-name">Project</Label><Input id="show-name" v-model="name" /></div>
        <div class="field">
          <Label for="show-region">Region</Label>
          <Select v-model="region">
            <SelectTrigger id="show-region" placeholder="Choose a region" />
            <SelectContent>
              <SelectItem value="fra1">Frankfurt (fra1)</SelectItem>
              <SelectItem value="lhr1">London (lhr1)</SelectItem>
              <SelectItem value="cdg1">Paris (cdg1)</SelectItem>
              <SelectItem value="iad1">Washington (iad1)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="field">
          <div class="between"><Label for="show-memory">Function memory</Label><span class="readout">{{ memory }} MB</span></div>
          <Slider id="show-memory" v-model="memory" :min="128" :max="3008" :step="64" />
        </div>
        <div class="between"><Label for="show-previews">Preview every pull request</Label><Switch id="show-previews" v-model="previews" /></div>
        <Label><Checkbox v-model="checks" /> Require checks to pass before deploying</Label>
      </div>
    </section>

    <section class="tile span-4" aria-label="Chart">
      <header><h3>Charts</h3><p>Plain SVG. Read values with the pointer or the arrow keys, or switch to a table.</p></header>
      <Chart type="area" :data="traffic" x="week" x-label="Week starting" :series="trafficSeries" label="Weekly requests, and how many were served from cache" />
    </section>

    <section class="tile span-2" aria-label="Headline numbers">
      <header><h3>Stats</h3></header>
      <div class="stack">
        <Stat label="Requests" :value="1842300" :delta="12.4" delta-label="vs last month" :trend="traffic.map((week) => week.requests)" />
        <Stat label="Error rate" value="0.42%" :delta="-8.1" delta-label="vs last month" :up-is-good="false" :trend="[0.61, 0.58, 0.55, 0.57, 0.5, 0.49, 0.46, 0.44, 0.42]" />
      </div>
    </section>

    <section class="tile span-2 centred" aria-label="Calendar">
      <Calendar v-model="date" />
    </section>

    <section class="tile span-2" aria-label="Overlays">
      <header><h3>Overlays</h3><p>Focus is trapped and returned, Escape closes, and the page behind does not scroll.</p></header>
      <div class="row">
        <Dialog>
          <DialogTrigger as-child><Button variant="outline">Dialog</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a teammate</DialogTitle>
              <DialogDescription>They get an email with a link to join northwind-storefront.</DialogDescription>
            </DialogHeader>
            <div class="field"><Label for="show-invite">Email</Label><Input id="show-invite" type="email" placeholder="name@example.com" /></div>
            <DialogFooter>
              <DialogClose as-child><Button variant="outline">Cancel</Button></DialogClose>
              <DialogClose as-child><Button @click="toast.success('Invitation sent')">Send invite</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger as-child><Button variant="outline">Menu</Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>4f2c9a1</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @select="toast('Promoted to production')">Promote to production</DropdownMenuItem>
            <DropdownMenuItem @select="toast('Redeploying')">Redeploy</DropdownMenuItem>
            <DropdownMenuItem disabled>Roll back</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger as-child><Button variant="outline">Tooltip</Button></TooltipTrigger>
          <TooltipContent>Restored 412 MB from the previous build</TooltipContent>
        </Tooltip>
        <Button variant="outline" @click="toast.success('Deployed to production', { description: 'northwind-storefront is live in fra1.' })">Toast</Button>
        <Button variant="outline" @click="commandOpen = true">Command palette <Kbd>⌘K</Kbd></Button>
      </div>
      <p v-if="lastCommand" class="readout">{{ lastCommand }}</p>
    </section>

    <section class="tile span-4" aria-label="Kanban board">
      <header><h3>Kanban</h3><p>Drag cards between columns, or focus one and hold Alt with an arrow key.</p></header>
      <Kanban v-model="board" label="Sprint board" />
    </section>

    <section class="tile span-2" aria-label="Small parts">
      <header><h3>Small parts</h3></header>
      <div class="stack">
        <div class="row">
          <Button size="sm">Deploy</Button>
          <Button size="sm" variant="secondary">Preview</Button>
          <Button size="sm" variant="destructive">Delete</Button>
        </div>
        <div class="row">
          <Badge>Live</Badge>
          <Badge variant="secondary">Preview</Badge>
          <Badge variant="outline">Draft</Badge>
          <AvatarGroup :max="3" label="Team members">
            <Avatar size="sm" alt="Ines Kovač">IK</Avatar>
            <Avatar size="sm" alt="Tomás Ortega">TO</Avatar>
            <Avatar size="sm" alt="Priya Nair">PN</Avatar>
            <Avatar size="sm" alt="Jonas Weber">JW</Avatar>
          </AvatarGroup>
        </div>
        <div class="row">
          <Rating v-model="score" label="Deploy experience" />
          <Price :amount="96" :compare-at="120" show-saving />
        </div>
        <div class="field">
          <Label id="show-build">Build</Label>
          <Progress :value="68" aria-labelledby="show-build" />
        </div>
      </div>
    </section>

    <section class="tile span-6" aria-label="Tabs">
      <Tabs default-value="overview">
        <TabsList aria-label="Project sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><p class="hint">3 deployments this week, all healthy. Median build time 48 s.</p></TabsContent>
        <TabsContent value="deployments"><p class="hint">Latest: 4f2c9a1 “Fix cart rounding”, promoted to production.</p></TabsContent>
        <TabsContent value="logs"><p class="hint">No errors in the last 24 hours.</p></TabsContent>
      </Tabs>
    </section>

    <CommandPalette v-model:open="commandOpen">
      <CommandGroup heading="Deployments">
        <CommandItem keywords="ship release" @select="lastCommand = 'Ran: Promote to production'">Promote to production</CommandItem>
        <CommandItem shortcut="⌘R" @select="lastCommand = 'Ran: Redeploy latest'">Redeploy latest</CommandItem>
      </CommandGroup>
      <CommandGroup heading="Project">
        <CommandItem keywords="env secrets" @select="lastCommand = 'Ran: Environment variables'">Environment variables</CommandItem>
        <CommandItem @select="lastCommand = 'Ran: Domains'">Domains</CommandItem>
        <CommandItem keywords="members people" @select="lastCommand = 'Ran: Invite a teammate'">Invite a teammate</CommandItem>
      </CommandGroup>
    </CommandPalette>
    <Toaster />
  </div>
</template>

<style scoped>
.bento {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 1.25rem;
  text-align: start;
}
.tile {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-width: 0;
  padding: clamp(1.25rem, 2.5vw, 2rem);
  border-radius: 1.75rem;
  background: var(--er-background);
  box-shadow: 0 1px 2px rgb(0 0 0 / 4%);
}
.tile.centred {
  align-items: center;
  justify-content: center;
}
.span-2 {
  grid-column: span 2;
}
.span-4 {
  grid-column: span 4;
}
.span-6 {
  grid-column: span 6;
}
@media (max-width: 62rem) {
  .span-2 {
    grid-column: span 3;
  }
  .span-4 {
    grid-column: span 6;
  }
}
@media (max-width: 40rem) {
  .span-2 {
    grid-column: span 6;
  }
}
header h3 {
  margin: 0;
  font-size: 1.3125rem;
  font-weight: 600;
  letter-spacing: -0.015em;
}
header p {
  margin: 0.3rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.4;
  color: var(--er-muted-foreground);
}
.form,
.stack {
  display: grid;
  gap: 1rem;
}
.field {
  display: grid;
  gap: 0.4rem;
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}
.between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.readout {
  margin: 0;
  font-family: var(--er-font-mono);
  font-size: 0.8125rem;
  color: var(--er-muted-foreground);
}
.hint {
  margin: 0.75rem 0 0;
  color: var(--er-muted-foreground);
}
</style>
