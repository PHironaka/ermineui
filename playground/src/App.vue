<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../registry/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '../../registry/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../registry/ui/alert-dialog'
import { Avatar, AvatarGroup } from '../../registry/ui/avatar'
import { Badge } from '../../registry/ui/badge'
import { Banner } from '../../registry/ui/banner'
import { Breadcrumb, BreadcrumbItem } from '../../registry/ui/breadcrumb'
import { Button } from '../../registry/ui/button'
import { Calendar, addDays, today } from '../../registry/ui/calendar'
import { Carousel, CarouselSlide } from '../../registry/ui/carousel'
import { CartLineItem } from '../../registry/ui/cart-line-item'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../registry/ui/card'
import { BarList, Chart, DonutChart, Gauge, Heatmap, ScatterChart } from '../../registry/ui/chart'
import { Checkbox } from '../../registry/ui/checkbox'
import { CodeBlock } from '../../registry/ui/code-block'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../registry/ui/collapsible'
import { ColorPicker } from '../../registry/ui/color-picker'
import { Combobox, ComboboxItem } from '../../registry/ui/combobox'
import { CommandGroup, CommandItem, CommandPalette } from '../../registry/ui/command'
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '../../registry/ui/context-menu'
import { CountUp } from '../../registry/ui/count-up'
import { CopyButton } from '../../registry/ui/copy-button'
import { DataTable, type DataTableColumn, type DataTableSort } from '../../registry/ui/data-table'
import { DatePicker } from '../../registry/ui/date-picker'
import { DateRangePicker, type DateRange } from '../../registry/ui/date-range-picker'
import { DateTimePicker } from '../../registry/ui/date-time-picker'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../registry/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../../registry/ui/dropdown-menu'
import { EmptyState } from '../../registry/ui/empty-state'
import { EventCalendar, type CalendarEvent } from '../../registry/ui/event-calendar'
import { Field, email, min, required, useValidation } from '../../registry/ui/field'
import { FileUpload } from '../../registry/ui/file-upload'
import { FilterBar, facetOptions, type FilterBarFacet, type FilterBarValue } from '../../registry/ui/filter-bar'
import { FullscreenButton } from '../../registry/ui/fullscreen'
import { canVibrate, useHaptics, vHaptic } from '../../registry/ui/haptics'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../../registry/ui/hover-card'
import { Input } from '../../registry/ui/input'
import { InputGroup, PasswordInput, SearchInput } from '../../registry/ui/input-group'
import { Kanban, type KanbanColumn } from '../../registry/ui/kanban'
import { Kbd } from '../../registry/ui/kbd'
import { Label } from '../../registry/ui/label'
import { MaskedInput, masks } from '../../registry/ui/masked-input'
import { Menubar, MenubarContent, MenubarMenu, MenubarTrigger } from '../../registry/ui/menubar'
import { MultiSelect, MultiSelectItem } from '../../registry/ui/multi-select'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from '../../registry/ui/navigation-menu'
import { NotificationPrompt } from '../../registry/ui/notification-prompt'
import { NumberInput } from '../../registry/ui/number-input'
import { OfflineBanner } from '../../registry/ui/offline-banner'
import { OptionCard } from '../../registry/ui/option-card'
import { OrderSummary } from '../../registry/ui/order-summary'
import { Pagination } from '../../registry/ui/pagination'
import { PinInput } from '../../registry/ui/pin-input'
import { Popover, PopoverContent, PopoverTrigger } from '../../registry/ui/popover'
import { Price } from '../../registry/ui/price'
import { ProductCard } from '../../registry/ui/product-card'
import { ProductGallery, type ProductGalleryImage } from '../../registry/ui/product-gallery'
import { Progress } from '../../registry/ui/progress'
import { QrCode } from '../../registry/ui/qr-code'
import { Questionnaire, QuestionnaireStep } from '../../registry/ui/questionnaire'
import { RadioGroup, RadioGroupItem } from '../../registry/ui/radio-group'
import { RangeSlider } from '../../registry/ui/range-slider'
import { Rating } from '../../registry/ui/rating'
import { ResizableHandle, ResizablePanel, ResizablePanels } from '../../registry/ui/resizable'
import { vReveal } from '../../registry/ui/reveal'
import { ScrollArea } from '../../registry/ui/scroll-area'
import { ScrollProgress } from '../../registry/ui/scroll-progress'
import { Select, SelectContent, SelectItem, SelectLabel, SelectSeparator, SelectTrigger } from '../../registry/ui/select'
import { Separator } from '../../registry/ui/separator'
import { ShareButton } from '../../registry/ui/share-button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../../registry/ui/sheet'
import { Sidebar, SidebarGroup, SidebarItem } from '../../registry/ui/sidebar'
import { SignaturePad } from '../../registry/ui/signature-pad'
import { Skeleton } from '../../registry/ui/skeleton'
import { Slider } from '../../registry/ui/slider'
import { SoundToggle, soundSettings, vSound } from '../../registry/ui/sound'
import { Spinner } from '../../registry/ui/spinner'
import { Stat } from '../../registry/ui/stat'
import { Stepper } from '../../registry/ui/stepper'
import { Swatch, SwatchGroup } from '../../registry/ui/swatch'
import { Switch } from '../../registry/ui/switch'
import { TagsInput } from '../../registry/ui/tags-input'
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '../../registry/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../registry/ui/tabs'
import { Textarea } from '../../registry/ui/textarea'
import { TimePicker } from '../../registry/ui/time-picker'
import { Timeline, TimelineItem } from '../../registry/ui/timeline'
import { Toggle } from '../../registry/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '../../registry/ui/toggle-group'
import { Toaster, toast } from '../../registry/ui/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../registry/ui/tooltip'
import { Tour, type TourStep } from '../../registry/ui/tour'
import { Tree, type TreeNode } from '../../registry/ui/tree'
import { revealTransition, vTransitionName, viewTransition } from '../../registry/ui/view-transition'
import { WakeLockToggle } from '../../registry/ui/wake-lock'
import { Prose, Typography } from '../../registry/ui/typography'
import { VirtualList } from '../../registry/ui/virtual-list'
import { Icon, iconNames, registerIcons } from '../../registry/ui/icon'
import { ImageFan, type ImageFanImage } from '../../registry/ui/image-fan'
import { Cart, sampleCart, type CartItem } from '../../registry/blocks/cart'
import { Checkout, type CheckoutValues } from '../../registry/blocks/checkout'
import { Dashboard } from '../../registry/blocks/dashboard'
import { SettingsPage } from '../../registry/blocks/settings'
import { SignIn } from '../../registry/blocks/sign-in'
import Demo from './Demo.vue'
import BlockDemos from './demos/BlockDemos.vue'
import GeneralDemos from './demos/GeneralDemos.vue'
import MobileDemos from './demos/MobileDemos.vue'
import ShopDemos from './demos/ShopDemos.vue'

// Theme: follows the system until the visitor picks one. Read after mount, so the page can also be rendered on a server.
const theme = ref<'light' | 'dark'>('light')
onMounted(() => {
  const chosen = document.documentElement.dataset.theme as 'light' | 'dark' | undefined
  theme.value = chosen ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
})
function toggleTheme(event?: MouseEvent) {
  // The new theme is uncovered in a circle growing from the button, where the browser can do that.
  void revealTransition(() => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme.value
  }, event && event.clientX ? event : undefined)
}

// Button: loading
const saving = ref(false)
function save() {
  saving.value = true
  setTimeout(() => (saving.value = false), 1500)
}

// Form controls
const projectName = ref('northwind-storefront')
const notes = ref('')
const region = ref('fra1')
const framework = ref<string>()
const autoDeploy = ref(true)
const previews = ref(false)

// Date picker and calendar
const launchDate = ref<string>()
const reviewDate = ref(addDays(today(), 3))
const earliestReview = today()
const latestReview = addDays(today(), 60)
const isWeekend = (date: string) => [0, 6].includes(new Date(date).getUTCDay())
const freezeDate = ref(addDays(today(), 10))

// Radio group
const plan = ref('pro')
const billing = ref('monthly')

// Accordion
const openQuestions = ref<string[]>(['domains'])

// Combobox
const timezone = ref<string>()
const timezones = [
  ['Pacific/Auckland', 'Auckland'],
  ['Europe/Berlin', 'Berlin'],
  ['America/Chicago', 'Chicago'],
  ['Asia/Kolkata', 'Kolkata'],
  ['Europe/London', 'London'],
  ['America/Los_Angeles', 'Los Angeles'],
  ['America/New_York', 'New York'],
  ['America/Sao_Paulo', 'São Paulo'],
  ['Asia/Singapore', 'Singapore'],
  ['Australia/Sydney', 'Sydney'],
  ['Asia/Tokyo', 'Tokyo'],
] as const

// Progress and spinner
const buildProgress = ref(35)
const building = ref(false)
function runBuild() {
  building.value = true
  buildProgress.value = 0
  const timer = setInterval(() => {
    buildProgress.value = Math.min(100, buildProgress.value + 12)
    if (buildProgress.value < 100) return
    clearInterval(timer)
    building.value = false
  }, 350)
}

// Sheet
const sheetSide = ref<'top' | 'right' | 'bottom' | 'left'>('right')
const envName = ref('STRIPE_WEBHOOK_SECRET')

// Chart
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
const deployments = [
  { month: 'Apr', production: 14, preview: 52, failed: 4 },
  { month: 'May', production: 18, preview: 61, failed: 7 },
  { month: 'Jun', production: 16, preview: 48, failed: 3 },
  { month: 'Jul', production: 22, preview: 73, failed: 9 },
  { month: 'Aug', production: 25, preview: 80, failed: 5 },
  { month: 'Sep', production: 21, preview: 66, failed: 2 },
]
const deploymentSeries = [
  { key: 'production', label: 'Production' },
  { key: 'preview', label: 'Preview' },
  { key: 'failed', label: 'Failed' },
]
const buildTimes = [
  { day: 'Mon', seconds: 48 },
  { day: 'Tue', seconds: 52 },
  { day: 'Wed', seconds: 47 },
  { day: 'Thu', seconds: 71 },
  { day: 'Fri', seconds: 55 },
  { day: 'Sat', seconds: null },
  { day: 'Sun', seconds: 44 },
]
const seconds = (value: number) => `${value} s`
const bandwidth = [
  { region: 'Frankfurt', gb: 412 },
  { region: 'Washington, D.C.', gb: 356 },
  { region: 'London', gb: 198 },
  { region: 'San Francisco', gb: 143 },
  { region: 'Paris', gb: 87 },
  { region: 'Singapore', gb: 41 },
  { region: 'Sydney', gb: 22 },
]
const gigabytes = (value: number) => `${value.toLocaleString('en-US')} GB`
const builds = [
  { project: 'storefront', framework: 'Nuxt', size: 412, seconds: 71 },
  { project: 'checkout', framework: 'Nuxt', size: 268, seconds: 52 },
  { project: 'admin', framework: 'Nuxt', size: 530, seconds: 88 },
  { project: 'accounts', framework: 'Nuxt', size: 344, seconds: 63 },
  { project: 'search', framework: 'Nuxt', size: 301, seconds: 49 },
  { project: 'reports', framework: 'Nuxt', size: 476, seconds: 94 },
  { project: 'docs', framework: 'Astro', size: 96, seconds: 34 },
  { project: 'blog', framework: 'Astro', size: 74, seconds: 22 },
  { project: 'marketing', framework: 'Astro', size: 148, seconds: 41 },
  { project: 'changelog', framework: 'Astro', size: 58, seconds: 18 },
  { project: 'careers', framework: 'Astro', size: 112, seconds: 29 },
  { project: 'status', framework: 'Astro', size: 131, seconds: 47 },
  { project: 'widget', framework: 'Vite', size: 64, seconds: 12 },
  { project: 'dashboard', framework: 'Vite', size: 388, seconds: 44 },
  { project: 'playground', framework: 'Vite', size: 212, seconds: 27 },
  { project: 'embed', framework: 'Vite', size: 43, seconds: 9 },
  { project: 'studio', framework: 'Vite', size: 455, seconds: 58 },
  { project: 'kiosk', framework: 'Vite', size: 176, seconds: 21 },
  { project: 'legacy-portal', framework: 'Webpack', size: 590, seconds: 132 },
  { project: 'intranet', framework: 'Next', size: 364, seconds: 79 },
]

// Field and validation
const account = ref({ teamName: '', billingEmail: '' })
const accountForm = useValidation(account, {
  teamName: [required('Give the team a name.')],
  billingEmail: [required('Enter an email for invoices.'), email()],
})
function saveAccount() {
  if (accountForm.validate()) toast.success('Team details saved')
}

// Questionnaire
const blankAnswers = () => ({ name: '', email: '', kind: '', seats: undefined as number | undefined, regions: [] as string[], notes: '' })
const answers = ref(blankAnswers())
const quoteStep = ref(1)
const quoteForm = useValidation(answers, {
  name: [required('Tell us your name.')],
  email: [required('Enter your email.'), email()],
  kind: [required('Choose one.')],
  seats: [required('Enter how many people will use it.'), min(2, 'A team has at least 2 people.')],
})
const regionNames: Record<string, string> = { fra1: 'Frankfurt', lhr1: 'London', iad1: 'Washington, D.C.', sfo1: 'San Francisco', sin1: 'Singapore' }
function sendQuote() {
  toast.success('Request sent', { description: `We will reply to ${answers.value.email}.` })
  answers.value = blankAnswers()
  quoteForm.reset()
  quoteStep.value = 1
}

// Stepper
const checkoutStep = ref(2)

// Multi-select and number input
const notifyRegions = ref<string[]>(['fra1', 'iad1'])
const replicas = ref<number | undefined>(3)

// File upload
const uploads = ref<File[]>([])
const uploadProgress = ref<Record<string, number>>({})
watch(uploads, (files) => {
  for (const file of files) {
    if (uploadProgress.value[file.name] !== undefined) continue
    // Stand-in for a real upload: counts up to 100.
    uploadProgress.value[file.name] = 0
    const timer = setInterval(() => {
      const next = Math.min(100, (uploadProgress.value[file.name] ?? 0) + 20)
      uploadProgress.value = { ...uploadProgress.value, [file.name]: next }
      if (next === 100) clearInterval(timer)
    }, 400)
  }
})

// Command palette, context menu, collapsible, sidebar
const commandOpen = ref(false)
const lastCommand = ref('Nothing run yet')
const lastContext = ref('Nothing chosen yet')
const showHidden = ref(false)
const envOpen = ref(false)
const sidebarCollapsed = ref(false)
const sidebarPage = ref('deployments')

// Banner, alert dialog, tour
const bannerOpen = ref(true)
const deleted = ref('northwind-storefront is still here')
const tourOpen = ref(false)
const tourStep = ref(1)
const tourSteps: TourStep[] = [
  { target: '#tour-deploy', title: 'Deploy from here', description: 'Every push to main deploys by itself. This button is for doing it by hand.' },
  { target: '#tour-search', title: 'Find anything', description: 'Search deployments by commit, branch or author.', side: 'bottom' },
  { target: '#tour-team', title: 'Your team', description: 'Everyone with access to this project. Invite more from settings.', side: 'left' },
]

// Input group, tags input, toggle, time
const amount = ref('49')
const secret = ref('correct horse battery staple')
const searchText = ref('checkout')
const recipients = ref(['ines@northwind.com'])
const isEmail = (tag: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tag) ? undefined : `${tag} is not an email address.`)
const bold = ref(true)
const muted = ref(false)
const standup = ref('09:30')
const maintenance = ref<string>()
const brand = ref('#2a78d6')

// Menubar
const wordWrap = ref(true)
const zoom = ref('100')
const lastMenu = ref('Nothing chosen yet')

// Code block
// Stand-in screenshots drawn as SVG, so the demo needs no image files and no network.
const fanImages: ImageFanImage[] = [
  ['Journal', '#f4f1ea', '#1c1c1c', '#c9b79c'],
  ['Studio', '#1f2430', '#f5f5f5', '#5b8def'],
  ['Portfolio', '#ffffff', '#111111', '#e5484d'],
  ['Archive', '#0b0b0c', '#fafafa', '#f5a524'],
  ['Notes', '#13241c', '#eafff3', '#3ecf8e'],
].map(([name, background, ink, accent]) => ({
  alt: `${name} home page`,
  href: '#image-fan',
  src: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="${background}"/><rect x="20" y="18" width="46" height="8" rx="4" fill="${ink}"/><rect x="236" y="18" width="64" height="8" rx="4" fill="${ink}" opacity=".35"/><rect x="20" y="58" width="150" height="14" rx="3" fill="${ink}"/><rect x="20" y="80" width="110" height="14" rx="3" fill="${ink}"/><rect x="20" y="108" width="120" height="6" rx="3" fill="${ink}" opacity=".4"/><rect x="20" y="120" width="90" height="6" rx="3" fill="${ink}" opacity=".4"/><rect x="196" y="52" width="104" height="92" rx="8" fill="${accent}"/><rect x="20" y="160" width="84" height="40" rx="6" fill="${accent}" opacity=".5"/><rect x="118" y="160" width="84" height="40" rx="6" fill="${ink}" opacity=".15"/><rect x="216" y="160" width="84" height="40" rx="6" fill="${ink}" opacity=".15"/></svg>`,
  )}`,
}))

// An icon of our own, added beside the built-in set.
registerIcons({ rocket: 'M5 19c0-2 1-4 3-5l3 3c-1 2-3 3-5 3ZM9 13c1-5 5-9 11-9 0 6-4 10-9 11ZM15 9v.01' })
const iconSize = ref('24')
const blockEvent = ref('nothing yet')
const signInLoading = ref(false)
const signInError = ref<string>()
function signIn(values: { email: string; password: string }) {
  signInError.value = undefined
  signInLoading.value = true
  // Stands in for a request to a server.
  setTimeout(() => {
    signInLoading.value = false
    if (values.password === 'wrong') signInError.value = 'That email and password do not match.'
    else blockEvent.value = `signed in as ${values.email}`
  }, 600)
}

const installSnippet = `npx ermineui init
npx ermineui add button dialog chart`
const configSnippet = `export default defineNuxtConfig({
  css: ['~/assets/css/ermine.css'],
  components: [
    { path: '~/components/ui', pathPrefix: false, extensions: ['.vue'] },
    '~/components',
  ],
})`

// Event calendar
const monthStart = today().slice(0, 8) + '01'
const calendarEvents: CalendarEvent[] = [
  { id: 'e1', title: 'Release 2.5', start: addDays(monthStart, 5), color: 1 },
  { id: 'e2', title: 'Design review', start: addDays(monthStart, 5), color: 3 },
  { id: 'e3', title: 'On-call: Ines', start: addDays(monthStart, 7), end: addDays(monthStart, 10), color: 2 },
  { id: 'e4', title: 'Database upgrade', start: addDays(monthStart, 13), color: 1 },
  { id: 'e5', title: 'Customer call', start: addDays(monthStart, 13), color: 3 },
  { id: 'e6', title: 'Security audit', start: addDays(monthStart, 13), color: 2 },
  { id: 'e7', title: 'Team lunch', start: addDays(monthStart, 13), color: 3 },
  { id: 'e8', title: 'Planning', start: addDays(monthStart, 13), color: 1 },
  { id: 'e9', title: 'Maintenance window', start: addDays(monthStart, 20), end: addDays(monthStart, 21), color: 2 },
]
const calendarPick = ref('Nothing chosen yet')

// Kanban
const board = ref<KanbanColumn[]>([
  { id: 'todo', title: 'To do', cards: [{ id: 'k1', title: 'Add saved addresses' }, { id: 'k2', title: 'Search filters' }, { id: 'k3', title: 'Gift cards' }] },
  { id: 'doing', title: 'In progress', cards: [{ id: 'k4', title: 'Checkout redesign' }] },
  { id: 'review', title: 'In review', cards: [{ id: 'k5', title: 'Cart rounding fix' }, { id: 'k6', title: 'Image loading' }] },
  { id: 'done', title: 'Done', cards: [] },
])

// Virtual list
const logLines = Array.from({ length: 10000 }, (_line, index) => ({
  time: `${String(Math.floor(index / 3600) % 24).padStart(2, '0')}:${String(Math.floor(index / 60) % 60).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}`,
  text: ['GET /api/cart 200', 'GET /products 200', 'POST /api/checkout 201', 'GET /api/cart 304', 'GET /favicon.ico 404'][index % 5]!,
}))

// More charts
const topPages = [
  { path: '/products', views: 48210 },
  { path: '/', views: 61940 },
  { path: '/cart', views: 21730 },
  { path: '/checkout', views: 9480 },
  { path: '/account', views: 5210 },
  { path: '/help', views: 2140 },
]
const heatDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const heatHours = ['00', '03', '06', '09', '12', '15', '18', '21']
const heatValues = heatDays.map((_day, day) =>
  heatHours.map((_hour, hour) => (day === 6 && hour === 0 ? null : Math.round((day < 5 ? 40 : 14) * [0.15, 0.1, 0.3, 1, 0.85, 0.95, 0.6, 0.3][hour]! + ((day * 7 + hour * 3) % 9)))),
)

// Haptics
const { settings: hapticSettings } = useHaptics()
const vibrates = ref(false)
onMounted(() => (vibrates.value = canVibrate()))

// Share button and QR code
const shareUrl = ref('https://example.com/ermine-ui')
const shareStatus = ref('Nothing shared yet')

// Signature pad
const signature = ref('')

// Wake lock, fullscreen, notifications
const keepAwake = ref(false)
const notificationStatus = ref('Not asked yet')

// View transitions
const regions = ref([
  { id: 'fra1', city: 'Frankfurt', latency: 18 },
  { id: 'lhr1', city: 'London', latency: 24 },
  { id: 'iad1', city: 'Washington, D.C.', latency: 92 },
  { id: 'sfo1', city: 'San Francisco', latency: 148 },
  { id: 'sin1', city: 'Singapore', latency: 176 },
])
let slowestFirst = false
function sortRegions() {
  slowestFirst = !slowestFirst
  void viewTransition(() => {
    regions.value = [...regions.value].sort((a, b) => (slowestFirst ? b.latency - a.latency : a.latency - b.latency))
  })
}
function shuffleRegions() {
  void viewTransition(() => {
    // Rotates by two rather than shuffling at random, so the result is the same every time.
    regions.value = [...regions.value.slice(2), ...regions.value.slice(0, 2)]
  })
}

// Sound
const volumePercent = computed({
  get: () => Math.round(soundSettings.volume * 100),
  set: (value: number) => (soundSettings.volume = value / 100),
})
const soundNotifications = ref(true)

// Typography
// On a phone two columns side by side are too narrow to read, so the demo stacks them.
const stackColumns = ref(false)
onMounted(() => {
  const narrow = window.matchMedia('(max-width: 40rem)')
  stackColumns.value = narrow.matches
  narrow.addEventListener('change', () => (stackColumns.value = narrow.matches))
})
const typeVariants = [
  ['display', 'Ship it'],
  ['h1', 'Deploy in seconds'],
  ['h2', 'Every push gets a preview'],
  ['h3', 'Roll back with one click'],
  ['h4', 'Logs that explain themselves'],
  ['lead', 'A short introduction that sets up the page.'],
  ['body', 'Body text for paragraphs. It grows a little on wide screens and never shrinks below a comfortable size.'],
  ['small', 'Small print and secondary details.'],
  ['caption', 'A caption under a figure.'],
  ['overline', 'Section label'],
] as const

// PIN input and rating
const code = ref('')
const codeStatus = ref('Waiting for all six digits')
const score = ref(4)

// Tree
const fileTree: TreeNode[] = [
  {
    id: 'app',
    label: 'app',
    children: [
      { id: 'app/pages', label: 'pages', children: [{ id: 'app/pages/index.vue', label: 'index.vue' }, { id: 'app/pages/cart.vue', label: 'cart.vue' }] },
      { id: 'app/components', label: 'components', children: [{ id: 'app/components/CartTotal.vue', label: 'CartTotal.vue' }] },
      { id: 'app/app.vue', label: 'app.vue' },
    ],
  },
  { id: 'server', label: 'server', children: [{ id: 'server/api', label: 'api', children: [] }] },
  { id: '.env', label: '.env', disabled: true },
  { id: 'nuxt.config.ts', label: 'nuxt.config.ts' },
  { id: 'package.json', label: 'package.json' },
]
const openFolders = ref(['app'])
const openFile = ref<string>()

// Carousel and resizable panels
const releaseSlide = ref(1)
const releases = [
  { version: '2.4', title: 'Faster cold starts', text: 'Functions now start in about half the time in every region.' },
  { version: '2.3', title: 'Preview comments', text: 'Leave feedback directly on a preview deployment.' },
  { version: '2.2', title: 'Skew protection', text: 'Visitors keep the version they started on during a rollout.' },
  { version: '2.1', title: 'Log drains', text: 'Stream build and runtime logs to your own storage.' },
]
const paneSizes = ref<number[]>()
const sidebarOpen = ref(false)

// Date range picker
const reportRange = ref<DateRange>()

// Dropdown menu: view options
const showPreviews = ref(true)
const showFailed = ref(false)
const density = ref('comfortable')

// Pagination, slider, toggle group
const logPage = ref(1)
const memory = ref(1024)
const period = ref('30d')
const environments = ref<string[]>(['production'])

// Table
const invoices = [
  { id: 'INV-0912', period: 'September 2026', status: 'Paid', amount: 20 },
  { id: 'INV-0811', period: 'August 2026', status: 'Paid', amount: 20 },
  { id: 'INV-0710', period: 'July 2026', status: 'Refunded', amount: 20 },
  { id: 'INV-0609', period: 'June 2026', status: 'Paid', amount: 34.5 },
]
const dollars = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

// Data table
interface Deployment {
  id: string
  commit: string
  branch: string
  status: string
  seconds: number | null
  author: string
}
const authors = ['Ines Kovač', 'Tomás Ortega', 'Priya Nair', 'Jonas Weber']
const branches = ['main', 'feat/checkout-v2', 'fix/cart-rounding', 'chore/deps', 'feat/search-filters']
const messages = ['Fix cart rounding', 'Add saved addresses', 'Bump dependencies', 'Cache shipping estimate', 'Tidy checkout form', 'Add search filters', 'Speed up image loading']
const deploymentRows: Deployment[] = Array.from({ length: 23 }, (_row, index) => {
  const status = index % 7 === 3 ? 'Failed' : index === 0 ? 'Building' : 'Ready'
  return {
    id: `dpl_${(4821 - index * 37).toString(16)}`,
    commit: messages[index % messages.length]!,
    branch: branches[(index * 3) % branches.length]!,
    status,
    seconds: status === 'Building' ? null : 38 + ((index * 17) % 61),
    author: authors[(index * 5) % authors.length]!,
  }
})
const deploymentColumns: DataTableColumn<Deployment>[] = [
  { key: 'commit', label: 'Commit', sortable: true },
  { key: 'branch', label: 'Branch', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'seconds', label: 'Build time', sortable: true, align: 'right', format: (value) => (value === null ? '—' : `${value} s`) },
  { key: 'author', label: 'Author', sortable: true },
]
const selectedDeployments = ref<string[]>([])
const deploymentFilters = ref<FilterBarValue>({})
const deploymentFacets: FilterBarFacet[] = [
  { key: 'status', label: 'Status', options: facetOptions(deploymentRows, 'status') },
  { key: 'author', label: 'Author', options: facetOptions(deploymentRows, 'author') },
]
const bulkAction = ref('')

// A table fed by a "server": the rows are searched, filtered, sorted and cut into pages out of sight, and arrive after a pause.
const serverFilters = ref<FilterBarValue>({})
const serverSort = ref<DataTableSort>()
const serverPage = ref(1)
const serverSearch = ref('')
const serverRows = ref<Deployment[]>([])
const serverTotal = ref(0)
const serverLoading = ref(false)
let serverTimer: ReturnType<typeof setTimeout> | undefined
function fetchDeployments() {
  serverLoading.value = true
  clearTimeout(serverTimer)
  serverTimer = setTimeout(() => {
    const query = serverSearch.value.trim().toLowerCase()
    const sort = serverSort.value
    const found = deploymentRows
      .filter((row) => Object.entries(serverFilters.value).every(([key, values]) => !values.length || values.includes(String(row[key as keyof Deployment]))))
      .filter((row) => !query || `${row.commit} ${row.branch} ${row.author}`.toLowerCase().includes(query))
    if (sort) found.sort((a, b) => String(a[sort.key as keyof Deployment]).localeCompare(String(b[sort.key as keyof Deployment])) * (sort.direction === 'desc' ? -1 : 1))
    serverTotal.value = found.length
    serverRows.value = found.slice((serverPage.value - 1) * 8, serverPage.value * 8)
    serverLoading.value = false
  }, 250)
}
watch([serverFilters, serverSort, serverPage, serverSearch], fetchDeployments, { immediate: true })

// Shop: stand-in product pictures drawn as SVG, so the demos need no image files and no network.
const shopPicture = (background: string, ink: string, view = 0) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="${background}"/>${
      [
        `<rect x="130" y="120" width="140" height="170" rx="22" fill="${ink}"/><path d="M270 160h22a34 34 0 0 1 0 68h-22" fill="none" stroke="${ink}" stroke-width="18"/>`,
        `<circle cx="200" cy="200" r="96" fill="${ink}"/><circle cx="200" cy="200" r="70" fill="${background}" opacity=".55"/>`,
        `<rect x="60" y="150" width="280" height="200" rx="30" fill="${ink}"/><rect x="60" y="150" width="280" height="36" rx="18" fill="${background}" opacity=".35"/>`,
        `<rect x="150" y="70" width="100" height="120" rx="16" fill="${ink}"/><rect x="110" y="230" width="100" height="120" rx="16" fill="${ink}" opacity=".6"/><rect x="230" y="230" width="100" height="120" rx="16" fill="${ink}" opacity=".3"/>`,
      ][view]
    }</svg>`,
  )}`
const shopProducts = [
  { title: 'Stoneware mug', brand: 'Hearth', price: 24, rating: 4.5, reviews: 128, badge: 'New', image: shopPicture('#efe7da', '#c9b79c') },
  { title: 'Wool throw', brand: 'Fell & Co', price: 96, compareAt: 120, rating: 4.8, reviews: 64, badge: 'Sale', image: shopPicture('#dde5d6', '#6f8a5b', 2) },
  { title: 'Desk lamp', brand: 'Lumen', price: 148.5, rating: 4.1, reviews: 23, image: shopPicture('#dfe3ea', '#2f3a4f', 1) },
]
const wishlist = ref<string[]>([])
const toggleWish = (title: string) => (wishlist.value = wishlist.value.includes(title) ? wishlist.value.filter((other) => other !== title) : [...wishlist.value, title])
const shopEvent = ref('nothing added yet')
const mugColour = ref('sand')
const mugSize = ref('350')
const galleryImages: ProductGalleryImage[] = ['Front of the mug', 'The mug from above', 'The glaze up close', 'The mug in three colours'].map((alt, view) => ({
  alt,
  src: shopPicture('#efe7da', '#c9b79c', view),
}))
const galleryImage = ref(1)
const priceRange = ref<[number, number]>([40, 160])
const cardNumber = ref('')
const cardExpiry = ref('')
const phone = ref('')
const delivery = ref('standard')
const lineQuantity = ref(2)
const lineRemoved = ref(false)

// Blocks: cart and checkout
const cartItems = ref<CartItem[]>([...sampleCart])
const cartDiscount = ref<number>()
const cartCodeError = ref<string>()
const cartEvent = ref('nothing yet')
function applyCartCode(code: string) {
  const good = code.toUpperCase() === 'SAVE10'
  cartCodeError.value = good ? undefined : 'That code is not valid.'
  cartDiscount.value = good ? 10 : undefined
}
const checkoutLoading = ref(false)
const checkoutError = ref<string>()
const checkoutEvent = ref('nothing yet')
function placeOrder(values: CheckoutValues) {
  checkoutError.value = undefined
  checkoutLoading.value = true
  setTimeout(() => {
    checkoutLoading.value = false
    // A card number starting 4000 stands in for one the bank turns down.
    if (values.card?.number.startsWith('4000')) checkoutError.value = 'Your card was declined. Try another card.'
    else checkoutEvent.value = `order placed for ${values.email}, ${values.shippingMethod} delivery to ${values.country}`
  }, 700)
}

// Skeleton
const deploymentLoading = ref(true)

// Checkbox: a select-all box with an indeterminate state
const checks = ref([
  { id: 'build', label: 'Build succeeds', done: true },
  { id: 'tests', label: 'Tests pass', done: true },
  { id: 'review', label: 'One approving review', done: false },
])
const allDone = computed({
  get: () => checks.value.every((check) => check.done),
  set: (value: boolean) => checks.value.forEach((check) => (check.done = value)),
})
const someDone = computed(() => checks.value.some((check) => check.done) && !allDone.value)

// Dialog
const inviteOpen = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('developer')
function sendInvite() {
  inviteOpen.value = false
  toast.success('Invitation sent', { description: `${inviteEmail.value || 'teammate@example.com'} was invited as ${inviteRole.value}.` })
  inviteEmail.value = ''
}

// Popover
const width = ref('1280')
const height = ref('800')

// Dropdown menu
const lastAction = ref('Nothing chosen yet')

// Toast
function undoable() {
  toast('Deployment archived', {
    description: 'northwind-storefront · 4f2c9a1',
    action: { label: 'Undo', onClick: () => toast.info('Deployment restored') },
  })
}
</script>

<template>
  <Banner v-model:open="bannerOpen" variant="info" dismissible>
    Ermine now has 141 components and 12 blocks.
    <template #action><a href="#navigation-menu">See what is new</a></template>
  </Banner>
  <OfflineBanner />
  <ScrollProgress />
  <div class="page">
    <header class="topbar">
      <div class="brand"><span class="brand-mark" aria-hidden="true" /> Ermine UI</div>
      <div class="row">
        <Badge variant="outline">v0.1.0</Badge>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="outline" size="icon" :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`" @click="toggleTheme">
              <svg v-if="theme === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
              </svg>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Switch theme</TooltipContent>
        </Tooltip>
      </div>
    </header>

    <section class="intro" aria-label="Introduction">
      <h1>Vue components you copy in and own.</h1>
      <p>
        Eighty-six accessible components for Vue, Nuxt and Astro. Plain CSS and variables, no styling framework, no
        runtime dependencies beyond Vue. The command line copies the source into your project, so every line is
        yours to change.
      </p>
      <ul class="steps" aria-label="Getting started">
        <li><code>npx ermineui init</code></li>
        <li><code>npx ermineui add button dialog</code></li>
      </ul>
    </section>

    <main class="demos">
      <Demo name="button" title="Button" description="Six variants, four sizes, and a loading state. Renders as any tag or component." wide>
        <Button>Deploy</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Delete</Button>
        <Button variant="link" as="a" href="#dialog">Link to dialog</Button>
        <Button size="sm" variant="outline">Small</Button>
        <Button size="lg">Large</Button>
        <Button disabled>Disabled</Button>
        <Button :loading="saving" @click="save">{{ saving ? 'Saving' : 'Save' }}</Button>
        <Button variant="outline" size="icon" aria-label="Refresh" :loading="saving" @click="save"><Icon name="refresh" /></Button>
      </Demo>

      <Demo name="navigation-menu" title="Navigation menu and Menubar" description="A site's main links with panels that open on hover or click, and an application-style menu bar." wide>
        <div class="stack" style="justify-items: center; max-width: none">
          <NavigationMenu label="Site">
            <NavigationMenuItem>
              <NavigationMenuTrigger>Product</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#chart" description="Line, bar, donut, scatter and more.">Charts</NavigationMenuLink>
                <NavigationMenuLink href="#data-table" description="Sorting, selection and pages.">Data table</NavigationMenuLink>
                <NavigationMenuLink href="#questionnaire" description="Forms shown one step at a time.">Questionnaire</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#code-block">Install guide</NavigationMenuLink>
                <NavigationMenuLink href="#tour">Take the tour</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem><NavigationMenuLink href="#navigation-menu" active>Components</NavigationMenuLink></NavigationMenuItem>
            <NavigationMenuItem><NavigationMenuLink href="#timeline">Changelog</NavigationMenuLink></NavigationMenuItem>
          </NavigationMenu>

          <Menubar label="Editor">
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <DropdownMenuItem @select="lastMenu = 'New file'">New file <DropdownMenuShortcut>⌘N</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuItem @select="lastMenu = 'Save'">Save <DropdownMenuShortcut>⌘S</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem @select="lastMenu = 'Export as PDF'">PDF</DropdownMenuItem>
                    <DropdownMenuItem @select="lastMenu = 'Export as Markdown'">Markdown</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Edit</MenubarTrigger>
              <MenubarContent>
                <DropdownMenuItem @select="lastMenu = 'Undo'">Undo <DropdownMenuShortcut>⌘Z</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuItem disabled>Redo</DropdownMenuItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>View</MenubarTrigger>
              <MenubarContent>
                <DropdownMenuCheckboxItem v-model="wordWrap">Word wrap</DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup v-model="zoom" aria-label="Zoom">
                  <DropdownMenuRadioItem value="100">100%</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="125">125%</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <p class="readout">{{ lastMenu }} · word wrap: {{ wordWrap }} · zoom: {{ zoom }}%</p>
        </div>
      </Demo>

      <Demo name="view-transition" title="View transition" description="Changes that animate: rows glide to their new places, and the theme button in the top bar sweeps the new theme in from where you pressed.">
        <div class="stack">
          <div class="row">
            <Button variant="outline" size="sm" @click="sortRegions">Sort by latency</Button>
            <Button variant="outline" size="sm" @click="shuffleRegions">Rotate</Button>
          </div>
          <ol class="region-list" aria-label="Regions">
            <li v-for="region in regions" :key="region.id" v-transition-name="`region-${region.id}`">
              <span>{{ region.city }}</span><span class="readout">{{ region.latency }} ms</span>
            </li>
          </ol>
        </div>
      </Demo>

      <Demo name="haptics" title="Haptics" description="A small buzz when a control is used, on phones that can vibrate. Added with v-haptic, the twin of v-sound.">
        <div class="stack">
          <div class="row">
            <Button v-haptic>Press</Button>
            <Button v-haptic="'heavy'" variant="destructive">Heavy</Button>
            <Button v-haptic="'success'" variant="outline">Success</Button>
            <Button v-haptic="'error'" variant="outline">Error</Button>
          </div>
          <div class="row-between">
            <Label for="haptics-on">Vibration</Label>
            <Switch id="haptics-on" v-model="hapticSettings.enabled" />
          </div>
          <div class="row-between">
            <Label for="haptics-example">A switch that buzzes as it flips</Label>
            <Switch id="haptics-example" v-haptic.toggle />
          </div>
          <p class="hint">{{ vibrates ? 'This device can vibrate.' : 'This device cannot vibrate, so these buttons stay still. Try an Android phone.' }}</p>
        </div>
      </Demo>

      <Demo name="share-button" title="Share button and QR code" description="The device's own share sheet where there is one, a copied link where there is not, and a code to scan generated in the page.">
        <div class="stack">
          <div class="field">
            <Label for="share-url">Link</Label>
            <Input id="share-url" v-model="shareUrl" />
          </div>
          <div class="row" style="align-items: flex-start">
            <QrCode :value="shareUrl" :size="132" label="QR code for the link above" />
            <div class="stack" style="flex: 1; gap: 0.5rem; justify-items: start">
              <ShareButton :url="shareUrl" title="Ermine UI" text="Vue components you copy in and own." @share="shareStatus = 'Shared'" @copy="shareStatus = `Copied ${$event}`" />
              <p class="readout">{{ shareStatus }}</p>
            </div>
          </div>
        </div>
      </Demo>

      <Demo name="signature-pad" title="Signature pad" description="Sign with a finger, pen or mouse. The result is an image, in dark ink whatever the theme.">
        <div class="stack">
          <SignaturePad v-model="signature" label="Your signature">Sign above, or type your name below</SignaturePad>
          <div class="field">
            <Label for="typed-name">Or type your full name</Label>
            <Input id="typed-name" autocomplete="name" />
          </div>
          <p class="readout" :data-signature="signature || undefined">{{ signature ? `image ready, ${Math.round(signature.length / 1024)} KB` : 'not signed' }}</p>
        </div>
      </Demo>

      <Demo name="scroll-progress" title="Scroll progress, Reveal, Count up" description="The thin bar at the very top of this page fills as you scroll. Below, items appear as they come into view and numbers run up to their value.">
        <div class="stack">
          <div class="stat-row">
            <Card v-reveal><CardContent><Stat label="Deployments" :value="21480" count-up /></CardContent></Card>
            <Card v-reveal="120"><CardContent><Stat label="Uptime" value="99.98%" /></CardContent></Card>
          </div>
          <p class="hint">
            Served <strong style="color: var(--er-foreground)"><CountUp :value="1284306" /></strong> requests today.
          </p>
        </div>
      </Demo>

      <Demo name="wake-lock" title="Wake lock, Fullscreen, Notification prompt, Offline banner" description="Small wrappers around one browser feature each. Each hides itself where the browser cannot do it.">
        <div class="stack">
          <div class="row">
            <WakeLockToggle v-model="keepAwake" />
            <FullscreenButton target="#wake-lock" />
            <span class="readout">screen kept on: {{ keepAwake }}</span>
          </div>
          <NotificationPrompt
            title="Get told when a deployment fails?"
            description="One notification per failed production deployment. Nothing else."
            @granted="notificationStatus = 'Allowed'"
            @denied="notificationStatus = 'Blocked'"
            @dismiss="notificationStatus = 'Not now'"
          />
          <p class="readout">notifications: {{ notificationStatus }}</p>
          <p class="hint">The offline banner is at the top of this page: turn off your network to see it.</p>
        </div>
      </Demo>

      <Demo name="sound" title="Sound" description="Short synthesized sounds for buttons and other controls, added with v-sound. No audio files: the browser makes them.">
        <div class="stack">
          <div class="row-between">
            <Label for="sound-volume">Sound</Label>
            <div class="row" style="flex: 1; flex-wrap: nowrap; justify-content: flex-end">
              <Slider id="sound-volume" v-model="volumePercent" aria-label="Volume" style="max-width: 10rem" />
              <SoundToggle />
            </div>
          </div>
          <Separator />
          <div class="row">
            <Button v-sound>Click</Button>
            <Button v-sound="'tap'" variant="secondary">Tap</Button>
            <Button v-sound="'pop'" variant="outline">Pop</Button>
            <Button v-sound.hover variant="ghost">Hover, then press</Button>
          </div>
          <div class="row">
            <Button v-sound="'success'" variant="outline">Success</Button>
            <Button v-sound="'error'" variant="outline">Error</Button>
            <Button v-sound="'notify'" variant="outline">Notify</Button>
            <Button v-sound disabled>Disabled</Button>
          </div>
          <div class="row-between">
            <Label for="sound-switch">A switch that says which way it went</Label>
            <Switch id="sound-switch" v-model="soundNotifications" v-sound.toggle />
          </div>
          <p class="hint">Sound starts off for anyone whose system asks for reduced motion, and the choice is remembered.</p>
        </div>
      </Demo>

      <Demo name="typography" title="Typography" description="Headings and text that size themselves to the screen with clamp(), with no breakpoints. Resize the window, or drag the handle below." wide>
        <div class="stack" style="max-width: none">
          <div class="type-specimen">
            <template v-for="[variant, sample] in typeVariants" :key="variant">
              <code class="readout">{{ variant }}</code>
              <Typography :variant="variant" as="p">{{ sample }}</Typography>
            </template>
          </div>
          <Separator />
          <p class="hint">The same article in two panels. Each sizes its text to its own width, not the screen's: on a wide screen, drag the handle between them.</p>
          <div class="app-frame" :style="{ height: stackColumns ? '34rem' : '22rem' }">
            <ResizablePanels :direction="stackColumns ? 'vertical' : 'horizontal'">
              <ResizablePanel :default-size="62" :min-size="25">
                <Prose fluid="container" class="type-pane">
                  <h1>Zero-downtime deploys</h1>
                  <p>Every deployment is built in isolation and only takes traffic once it is <strong>healthy</strong>. Visitors already on the site keep the version they started with.</p>
                  <h2>How it works</h2>
                  <ul>
                    <li>Build the new version beside the old one.</li>
                    <li>Run <code>health</code> checks against it.</li>
                    <li>Move traffic over, a region at a time.</li>
                  </ul>
                  <blockquote>If a check fails, nothing changes for your visitors.</blockquote>
                </Prose>
              </ResizablePanel>
              <ResizableHandle grip label="Resize article columns" />
              <ResizablePanel :min-size="25">
                <Prose fluid="container" class="type-pane">
                  <h1>Zero-downtime deploys</h1>
                  <p>Every deployment is built in isolation and only takes traffic once it is <strong>healthy</strong>.</p>
                  <h2>How it works</h2>
                  <p>Build beside the old version, check it, then move traffic over.</p>
                </Prose>
              </ResizablePanel>
            </ResizablePanels>
          </div>
        </div>
      </Demo>

      <Demo name="stat" title="Stat" description="A headline number with its change since last period and an optional sparkline." wide>
        <div class="stat-row">
          <Card><CardContent><Stat label="Requests" :value="1842300" :delta="12.4" delta-label="vs last month" :trend="traffic.map((week) => week.requests)" /></CardContent></Card>
          <Card><CardContent><Stat label="Error rate" value="0.42%" :delta="-8.1" delta-label="vs last month" :up-is-good="false" :trend="[0.61, 0.58, 0.55, 0.57, 0.5, 0.49, 0.46, 0.44, 0.42]" /></CardContent></Card>
          <Card><CardContent><Stat label="Median build time" value="48 s" :delta="6.3" delta-label="vs last month" :up-is-good="false" /></CardContent></Card>
          <Card><CardContent><Stat label="Team members" :value="14" :delta="0" delta-label="vs last month" /></CardContent></Card>
        </div>
      </Demo>

      <Demo name="questionnaire" title="Questionnaire" description="A form shown one step at a time. Each step is checked before moving on, and steps can be skipped by earlier answers.">
        <Questionnaire v-model:step="quoteStep" label="Request a quote" submit-label="Send request" style="max-width: 26rem" @submit="sendQuote">
          <template #default="{ goTo }">
            <QuestionnaireStep title="About you" :validate="() => quoteForm.validate(['name', 'email'])">
              <Field v-slot="{ control }" label="Name" required :error="quoteForm.errors.name">
                <Input v-bind="control" v-model="answers.name" autocomplete="name" @blur="quoteForm.touch('name')" />
              </Field>
              <Field v-slot="{ control }" label="Work email" required :error="quoteForm.errors.email">
                <Input v-bind="control" v-model="answers.email" type="email" autocomplete="email" @blur="quoteForm.touch('email')" />
              </Field>
            </QuestionnaireStep>

            <QuestionnaireStep title="Who is this for?" description="Teams get a couple of extra questions." :validate="() => quoteForm.validate(['kind'])">
              <Field label="Account type" required :error="quoteForm.errors.kind">
                <RadioGroup v-model="answers.kind" aria-label="Account type">
                  <Label><RadioGroupItem value="personal" /> Just me</Label>
                  <Label><RadioGroupItem value="team" /> A team</Label>
                </RadioGroup>
              </Field>
            </QuestionnaireStep>

            <QuestionnaireStep title="About your team" :skip="answers.kind !== 'team'" :validate="() => quoteForm.validate(['seats'])">
              <Field v-slot="{ control }" label="People who will deploy" required :error="quoteForm.errors.seats">
                <NumberInput v-bind="control" v-model="answers.seats" :min="1" :max="500" />
              </Field>
              <Field v-slot="{ control }" label="Regions you need" hint="Optional. Choose any number.">
                <MultiSelect v-bind="control" v-model="answers.regions" placeholder="Search regions…">
                  <MultiSelectItem v-for="(city, code) in regionNames" :key="code" :value="code">{{ city }}</MultiSelectItem>
                </MultiSelect>
              </Field>
            </QuestionnaireStep>

            <QuestionnaireStep title="Anything else?" description="Optional.">
              <Field v-slot="{ control }" label="Notes">
                <Textarea v-bind="control" v-model="answers.notes" placeholder="Deadlines, compliance needs, questions…" />
              </Field>
            </QuestionnaireStep>

            <QuestionnaireStep title="Check your answers">
              <dl class="review">
                <div><dt>Name</dt><dd>{{ answers.name }}</dd><Button variant="link" @click="goTo(1)">Edit</Button></div>
                <div><dt>Email</dt><dd>{{ answers.email }}</dd><Button variant="link" @click="goTo(1)">Edit</Button></div>
                <div><dt>For</dt><dd>{{ answers.kind === 'team' ? `A team of ${answers.seats}` : 'Just me' }}</dd><Button variant="link" @click="goTo(2)">Edit</Button></div>
                <div v-if="answers.kind === 'team'"><dt>Regions</dt><dd>{{ answers.regions.map((code) => regionNames[code]).join(', ') || 'None chosen' }}</dd><Button variant="link" @click="goTo(3)">Edit</Button></div>
              </dl>
            </QuestionnaireStep>
          </template>
        </Questionnaire>
      </Demo>

      <Demo name="field" title="Field and validation" description="Label, hint and error wired to any control. Quiet until checked, then clears as soon as the problem is fixed.">
        <form class="stack" novalidate @submit.prevent="saveAccount">
          <Field v-slot="{ control }" label="Team name" required :error="accountForm.errors.teamName">
            <Input v-bind="control" v-model="account.teamName" @blur="accountForm.touch('teamName')" />
          </Field>
          <Field v-slot="{ control }" label="Billing email" required hint="Invoices are sent here." :error="accountForm.errors.billingEmail">
            <Input v-bind="control" v-model="account.billingEmail" type="email" @blur="accountForm.touch('billingEmail')" />
          </Field>
          <div class="row"><Button type="submit">Save</Button></div>
        </form>
      </Demo>

      <Demo name="stepper" title="Stepper" description="Done, current and still to come. Press a finished step to go back to it.">
        <div class="stack" style="max-width: none">
          <Stepper v-model="checkoutStep" :steps="['Cart', 'Shipping', 'Payment', 'Review']" label="Checkout progress" />
          <Stepper
            :model-value="2"
            orientation="vertical"
            :clickable="false"
            :steps="[
              { label: 'Domain added', description: 'shop.northwind.com' },
              { label: 'Waiting for DNS', description: 'Usually takes a few minutes.' },
              { label: 'Certificate issued' },
            ]"
            label="Domain setup"
          />
          <div class="row">
            <Button size="sm" variant="outline" :disabled="checkoutStep <= 1" @click="checkoutStep--">Back</Button>
            <Button size="sm" :disabled="checkoutStep > 4" @click="checkoutStep++">{{ checkoutStep >= 4 ? 'Finish' : 'Next' }}</Button>
          </div>
        </div>
      </Demo>

      <Demo name="multi-select" title="Multi-select and Number input" description="Several choices as removable tags, and a number with minus and plus buttons.">
        <div class="stack">
          <div class="field">
            <Label for="notify-regions">Alert me about</Label>
            <MultiSelect id="notify-regions" v-model="notifyRegions" name="regions" placeholder="Search regions…" :max="3">
              <MultiSelectItem v-for="(city, code) in regionNames" :key="code" :value="code">{{ city }}</MultiSelectItem>
              <template #empty>No region matches.</template>
            </MultiSelect>
            <p class="hint">Up to three.</p>
          </div>
          <div class="field" style="max-width: 10rem">
            <Label for="replicas">Replicas</Label>
            <NumberInput id="replicas" v-model="replicas" :min="1" :max="10" />
          </div>
          <p class="readout">regions: {{ notifyRegions.join(', ') || 'none' }} · replicas: {{ replicas ?? 'empty' }}</p>
        </div>
      </Demo>

      <Demo name="file-upload" title="File upload" description="Drop files or open the picker. Type, size and count limits, with progress per file.">
        <div class="stack">
          <FileUpload v-model="uploads" multiple accept=".csv,.json,image/*" :max-size="2 * 1024 * 1024" :max-files="3" :progress="uploadProgress" aria-label="Import files">
            <template #hint>CSV, JSON or images, up to 2 MB each, three at most.</template>
          </FileUpload>
        </div>
      </Demo>

      <Demo name="input-group" title="Input group, Tags input, Toggle" description="Inputs with something before or after, ready-made password and search fields, free-form tags, and a button that stays pressed.">
        <div class="stack">
          <div class="field">
            <Label for="amount">Monthly budget</Label>
            <InputGroup>
              <template #prefix>$</template>
              <Input id="amount" v-model="amount" inputmode="decimal" />
              <template #suffix>USD</template>
            </InputGroup>
          </div>
          <div class="field">
            <Label for="secret">API secret</Label>
            <PasswordInput id="secret" v-model="secret" autocomplete="off" />
          </div>
          <div class="field">
            <Label for="deploy-search">Search deployments</Label>
            <SearchInput id="deploy-search" v-model="searchText" placeholder="Commit, branch or author" />
          </div>
          <div class="field">
            <Label for="recipients">Send the report to</Label>
            <TagsInput id="recipients" v-model="recipients" name="recipients" placeholder="name@example.com" :validate="isEmail" :max="4" />
            <p class="hint">Press Enter or type a comma after each address. Up to four.</p>
          </div>
          <div class="row">
            <Toggle v-model="bold" aria-label="Bold"><strong>B</strong></Toggle>
            <Toggle v-model="muted" variant="outline">{{ muted ? 'Muted' : 'Mute alerts' }}</Toggle>
          </div>
          <p class="readout">search: {{ searchText || 'empty' }} · to: {{ recipients.join(', ') || 'nobody' }} · bold: {{ bold }}</p>
        </div>
      </Demo>

      <Demo name="time-picker" title="Time picker, Date-time picker, Colour picker" description="Times at regular steps, a date and time as one value, and a colour by dragging, hue, preset or hex code.">
        <div class="stack">
          <div class="field" style="max-width: 12rem">
            <Label for="standup">Daily stand-up</Label>
            <TimePicker id="standup" v-model="standup" name="standup" :step="15" min="07:00" max="19:00" />
          </div>
          <div class="field">
            <Label for="maintenance">Maintenance starts</Label>
            <DateTimePicker id="maintenance" v-model="maintenance" name="maintenance" :min="earliestReview" />
          </div>
          <div class="field">
            <Label for="brand">Brand colour</Label>
            <ColorPicker id="brand" v-model="brand" name="brand" label="Brand colour" :presets="['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#4a3aa7']" />
          </div>
          <p class="readout">stand-up: {{ standup }} · maintenance: {{ maintenance ?? 'not set' }} · colour: {{ brand }}</p>
        </div>
      </Demo>

      <Demo name="pin-input" title="PIN input and Rating" description="One box per character with paste and autofill, and stars to choose or show a score.">
        <div class="stack" style="justify-items: start">
          <div class="field">
            <Label for="verify-code">Verification code</Label>
            <PinInput id="verify-code" v-model="code" name="code" @complete="codeStatus = `Checking ${$event}…`" @update:model-value="$event.length < 6 && (codeStatus = 'Waiting for all six digits')" />
            <p class="hint">{{ codeStatus }}</p>
          </div>
          <div class="field">
            <Label>How was the deploy experience?</Label>
            <Rating v-model="score" label="Deploy experience" size="lg" />
          </div>
          <div class="row">
            <Rating :model-value="3.5" readonly label="Average rating" size="sm" />
            <span class="hint">3.5 from 128 reviews</span>
          </div>
          <p class="readout">code: {{ code || 'empty' }} · score: {{ score }}</p>
        </div>
      </Demo>

      <Demo name="input" title="Input, Textarea, Label" description="Native fields with v-model and validation styling.">
        <div class="stack">
          <div class="field">
            <Label for="project-name">Project name</Label>
            <Input id="project-name" v-model="projectName" placeholder="my-project" />
          </div>
          <div class="field">
            <Label for="project-domain">Custom domain</Label>
            <Input id="project-domain" model-value="shop.northwind" aria-invalid="true" aria-describedby="domain-error" />
            <p id="domain-error" class="hint" style="color: var(--er-destructive)">Add a top-level domain, such as .com.</p>
          </div>
          <div class="field">
            <Label for="project-notes">Release notes</Label>
            <Textarea id="project-notes" v-model="notes" placeholder="What changed in this release?" />
          </div>
        </div>
      </Demo>

      <Demo name="select" title="Select" description="Keyboard navigation, type-to-select, and form support.">
        <div class="stack">
          <div class="field">
            <Label for="region">Region</Label>
            <Select v-model="region" name="region">
              <SelectTrigger id="region" placeholder="Choose a region" />
              <SelectContent>
                <SelectLabel>Europe</SelectLabel>
                <SelectItem value="fra1">Frankfurt (fra1)</SelectItem>
                <SelectItem value="lhr1">London (lhr1)</SelectItem>
                <SelectItem value="cdg1">Paris (cdg1)</SelectItem>
                <SelectSeparator />
                <SelectLabel>North America</SelectLabel>
                <SelectItem value="iad1">Washington, D.C. (iad1)</SelectItem>
                <SelectItem value="sfo1">San Francisco (sfo1)</SelectItem>
                <SelectItem value="yul1" disabled>Montréal (yul1) — at capacity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="field">
            <Label for="framework">Framework</Label>
            <Select v-model="framework">
              <SelectTrigger id="framework" placeholder="Choose a framework" />
              <SelectContent>
                <SelectItem value="nuxt">Nuxt</SelectItem>
                <SelectItem value="astro">Astro</SelectItem>
                <SelectItem value="vite">Vue with Vite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p class="readout">region: {{ region }} · framework: {{ framework ?? 'none' }}</p>
        </div>
      </Demo>

      <Demo name="date-picker" title="Date picker" description="A field that opens a calendar. Arrow keys move by day and week, Page Up and Down by month.">
        <div class="stack">
          <div class="field">
            <Label for="launch-date">Launch date</Label>
            <DatePicker id="launch-date" v-model="launchDate" name="launch" />
          </div>
          <div class="field">
            <Label for="review-date">Review date</Label>
            <DatePicker
              id="review-date"
              v-model="reviewDate"
              :min="earliestReview"
              :max="latestReview"
              :is-date-disabled="isWeekend"
              :week-starts-on="1"
              :format="{ dateStyle: 'full' }"
            />
            <p class="hint">Weekdays in the next 60 days.</p>
          </div>
          <p class="readout">launch: {{ launchDate ?? 'none' }} · review: {{ reviewDate }}</p>
        </div>
      </Demo>

      <Demo name="date-range-picker" title="Date range picker" description="Quick presets beside a calendar. Press a first day, then a last day.">
        <div class="stack">
          <div class="field">
            <Label for="report-range">Report period</Label>
            <DateRangePicker id="report-range" v-model="reportRange" start-name="from" end-name="to" :max="earliestReview" />
            <p class="hint">Up to today.</p>
          </div>
          <p class="readout">{{ reportRange ? `${reportRange.start} to ${reportRange.end}` : 'none' }}</p>
        </div>
      </Demo>

      <Demo name="slider" title="Slider" description="A native range input, restyled. Arrow keys, Home and End work as usual.">
        <div class="stack" style="max-width: 20rem">
          <div class="field">
            <div class="row-between">
              <Label for="memory">Function memory</Label>
              <span class="readout">{{ memory }} MB</span>
            </div>
            <Slider id="memory" v-model="memory" :min="128" :max="3008" :step="64" />
          </div>
          <div class="field">
            <Label for="concurrency">Concurrency (plan upgrade)</Label>
            <Slider id="concurrency" :model-value="30" disabled />
          </div>
        </div>
      </Demo>

      <Demo name="toggle-group" title="Toggle group" description="One of several, like radio buttons — or any number, like checkboxes.">
        <div class="stack" style="justify-items: start">
          <ToggleGroup v-model="period" aria-label="Period">
            <ToggleGroupItem value="7d">7 days</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 days</ToggleGroupItem>
            <ToggleGroupItem value="90d">90 days</ToggleGroupItem>
            <ToggleGroupItem value="1y" disabled>1 year</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup v-model="environments" type="multiple" size="sm" aria-label="Environments">
            <ToggleGroupItem value="production">Production</ToggleGroupItem>
            <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
            <ToggleGroupItem value="development">Development</ToggleGroupItem>
          </ToggleGroup>
          <p class="readout">period: {{ period }} · environments: {{ environments.join(', ') || 'none' }}</p>
        </div>
      </Demo>

      <Demo name="calendar" title="Calendar" description="The month grid on its own, for showing inline.">
        <Calendar v-model="freezeDate" />
        <p class="readout">{{ freezeDate }}</p>
      </Demo>

      <Demo name="combobox" title="Combobox" description="A select you can type in. Arrow keys move, Enter chooses, Escape puts the text back.">
        <div class="stack">
          <div class="field">
            <Label for="timezone">Time zone</Label>
            <Combobox id="timezone" v-model="timezone" name="timezone" placeholder="Search cities…">
              <ComboboxItem v-for="[zone, city] in timezones" :key="zone" :value="zone">{{ city }}</ComboboxItem>
              <ComboboxItem value="Etc/UTC" disabled>UTC (set by your team)</ComboboxItem>
              <template #empty>No city matches.</template>
            </Combobox>
          </div>
          <p class="readout">timezone: {{ timezone ?? 'none' }}</p>
        </div>
      </Demo>

      <Demo name="radio-group" title="Radio group" description="Native radio buttons, restyled. Arrow keys move between options.">
        <div class="stack" style="max-width: 20rem">
          <RadioGroup v-model="plan" name="plan" aria-label="Plan">
            <Label><RadioGroupItem value="hobby" /> Hobby — free</Label>
            <Label><RadioGroupItem value="pro" /> Pro — $20 a month</Label>
            <Label><RadioGroupItem value="enterprise" disabled /> Enterprise (contact sales)</Label>
          </RadioGroup>
          <Separator />
          <RadioGroup v-model="billing" orientation="horizontal" aria-label="Billing period">
            <Label><RadioGroupItem value="monthly" /> Monthly</Label>
            <Label><RadioGroupItem value="yearly" /> Yearly</Label>
          </RadioGroup>
          <p class="readout">plan: {{ plan }} · billing: {{ billing }}</p>
        </div>
      </Demo>

      <Demo name="checkbox" title="Checkbox" description="A native checkbox, restyled. Supports indeterminate.">
        <div class="stack" style="max-width: 16rem">
          <Label><Checkbox v-model="allDone" :indeterminate="someDone" /> Required checks</Label>
          <Separator />
          <Label v-for="check in checks" :key="check.id"><Checkbox v-model="check.done" /> {{ check.label }}</Label>
          <Label><Checkbox disabled /> Signed commits (plan upgrade)</Label>
        </div>
      </Demo>

      <Demo name="switch" title="Switch" description="An on/off toggle built on a native checkbox.">
        <div class="stack" style="max-width: 20rem">
          <div class="row-between">
            <Label for="auto-deploy">Deploy on push to main</Label>
            <Switch id="auto-deploy" v-model="autoDeploy" />
          </div>
          <div class="row-between">
            <Label for="previews">Preview every pull request</Label>
            <Switch id="previews" v-model="previews" />
          </div>
          <div class="row-between">
            <Label for="skew">Skew protection (plan upgrade)</Label>
            <Switch id="skew" disabled />
          </div>
          <p class="readout">autoDeploy: {{ autoDeploy }} · previews: {{ previews }}</p>
        </div>
      </Demo>

      <Demo name="card" title="Card" description="Header, title, description, content and footer parts.">
        <Card style="width: 100%; max-width: 22rem">
          <CardHeader>
            <CardTitle>northwind-storefront</CardTitle>
            <CardDescription>Production · deployed 12 minutes ago from main</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="row">
              <Badge>Ready</Badge>
              <Badge variant="secondary">fra1</Badge>
              <Badge variant="outline">4f2c9a1</Badge>
              <Badge variant="destructive">2 errors</Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button size="sm">Visit</Button>
            <Button size="sm" variant="outline">View logs</Button>
          </CardFooter>
        </Card>
      </Demo>

      <Demo name="tabs" title="Tabs" description="Arrow keys move between tabs. Horizontal or vertical.">
        <Tabs default-value="overview" style="width: 100%; max-width: 24rem">
          <TabsList aria-label="Project sections">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="billing" disabled>Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><p class="hint">3 deployments this week, all healthy. Median build time 48 s.</p></TabsContent>
          <TabsContent value="deployments"><p class="hint">Latest: 4f2c9a1 “Fix cart rounding”, promoted to production.</p></TabsContent>
          <TabsContent value="logs"><p class="hint">No errors in the last 24 hours.</p></TabsContent>
        </Tabs>
      </Demo>

      <Demo name="accordion" title="Accordion" description="Sections that expand and collapse. One at a time, or several at once.">
        <div class="stack">
          <Accordion v-model="openQuestions" type="multiple">
            <AccordionItem value="domains">
              <AccordionTrigger>How do I add a custom domain?</AccordionTrigger>
              <AccordionContent>Open the project's Domains tab, enter the domain, and add the DNS record it shows you.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="rollback">
              <AccordionTrigger>Can I roll back a deployment?</AccordionTrigger>
              <AccordionContent>Yes. Every deployment is kept, and promoting an earlier one takes a few seconds. <a href="#dropdown-menu">See deployment actions.</a></AccordionContent>
            </AccordionItem>
            <AccordionItem value="regions" disabled>
              <AccordionTrigger>Which regions are available? (Pro)</AccordionTrigger>
              <AccordionContent>Frankfurt, London, Paris, Washington and San Francisco.</AccordionContent>
            </AccordionItem>
          </Accordion>
          <p class="readout">open: {{ openQuestions.join(', ') || 'none' }}</p>
        </div>
      </Demo>

      <Demo name="alert-dialog" title="Alert dialog and Tour" description="A question that must be answered before something irreversible, and a step-by-step introduction to a page.">
        <div class="stack" style="justify-items: start">
          <AlertDialog>
            <AlertDialogTrigger as-child><Button variant="destructive">Delete project</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Delete northwind-storefront?</AlertDialogTitle>
              <AlertDialogDescription>This removes the project, its 214 deployments and its domains. It cannot be undone.</AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel />
                <AlertDialogAction variant="destructive" @click="deleted = 'northwind-storefront was deleted'">Delete project</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p class="readout">{{ deleted }}</p>
          <Separator />
          <div class="row" style="width: 100%">
            <Button id="tour-deploy" size="sm">Deploy</Button>
            <div id="tour-search" style="flex: 1; min-width: 6rem"><SearchInput aria-label="Search" placeholder="Search" /></div>
            <AvatarGroup id="tour-team" :max="3" label="Team members">
              <Avatar size="sm" alt="Ines Kovač">IK</Avatar>
              <Avatar size="sm" alt="Tomás Ortega">TO</Avatar>
              <Avatar size="sm" alt="Priya Nair">PN</Avatar>
              <Avatar size="sm" alt="Jonas Weber">JW</Avatar>
              <Avatar size="sm" alt="Mei Tanaka">MT</Avatar>
            </AvatarGroup>
          </div>
          <Button variant="outline" size="sm" @click="tourStep = 1; tourOpen = true">Start the tour</Button>
          <Tour v-model:open="tourOpen" v-model:step="tourStep" :steps="tourSteps" @finish="toast.success('Tour finished')" />
        </div>
      </Demo>

      <Demo name="code-block" title="Code block, Copy button, Kbd" description="Code with a copy button and optional line numbers, a button that copies any text, and keycaps for shortcuts.">
        <div class="stack">
          <CodeBlock :code="installSnippet" />
          <CodeBlock :code="configSnippet" filename="nuxt.config.ts" line-numbers />
          <div class="row">
            <code class="readout">dpl_12d5</code>
            <CopyButton value="dpl_12d5" label="Copy deployment id" />
            <CopyButton value="https://northwind.example/preview/12d5" label="Copy link" size="sm" variant="outline" />
          </div>
          <p class="hint">Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the command palette, or <Kbd>Esc</Kbd> to close it.</p>
        </div>
      </Demo>

      <Demo name="timeline" title="Timeline and Scroll area" description="Things that happened, in order, inside a box that scrolls with slim themed scrollbars.">
        <ScrollArea label="Deployment history" style="width: 100%; max-width: 24rem; height: 16rem; padding-right: 0.75rem">
          <Timeline>
            <TimelineItem title="Promoted to production" time="12 min ago" tone="success">
              <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg></template>
              4f2c9a1 “Fix cart rounding” by Ines Kovač.
            </TimelineItem>
            <TimelineItem title="Preview ready" time="31 min ago">Checks passed in 48 seconds.</TimelineItem>
            <TimelineItem title="Build failed" time="1 hour ago" tone="destructive">
              <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg></template>
              Type error in cart/total.ts on line 42.
            </TimelineItem>
            <TimelineItem title="Usage passed 90% of the plan" time="Yesterday" tone="warning" />
            <TimelineItem title="Domain verified" time="Oct 2">shop.northwind.com now points at production.</TimelineItem>
            <TimelineItem title="Project created" time="Sep 28" />
          </Timeline>
        </ScrollArea>
      </Demo>

      <Demo name="dialog" title="Dialog" description="Traps focus, locks page scroll, closes on Escape or an outside press.">
        <Dialog v-model:open="inviteOpen">
          <DialogTrigger as-child>
            <Button variant="outline">Invite a teammate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a teammate</DialogTitle>
              <DialogDescription>They get an email with a link to join northwind-storefront.</DialogDescription>
            </DialogHeader>
            <form id="invite-form" class="stack" style="max-width: none" @submit.prevent="sendInvite">
              <div class="field">
                <Label for="invite-email">Email</Label>
                <Input id="invite-email" v-model="inviteEmail" type="email" placeholder="teammate@example.com" />
              </div>
              <div class="field">
                <Label for="invite-role">Role</Label>
                <Select v-model="inviteRole">
                  <SelectTrigger id="invite-role" />
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
            <DialogFooter>
              <DialogClose as-child><Button variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" form="invite-form">Send invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Demo>

      <Demo name="sheet" title="Sheet" description="A panel that slides in from any edge, with the dialog's focus trap and scroll lock.">
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="outline">Add environment variable</Button>
          </SheetTrigger>
          <SheetContent :side="sheetSide">
            <SheetHeader>
              <SheetTitle>Add environment variable</SheetTitle>
              <SheetDescription>Available to builds and functions after the next deployment.</SheetDescription>
            </SheetHeader>
            <div class="field">
              <Label for="env-name">Name</Label>
              <Input id="env-name" v-model="envName" />
            </div>
            <SheetFooter>
              <SheetClose as-child><Button variant="outline">Cancel</Button></SheetClose>
              <SheetClose as-child><Button @click="toast.success(`${envName} added`)">Add</Button></SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <RadioGroup v-model="sheetSide" orientation="horizontal" aria-label="Sheet side">
          <Label v-for="side in ['left', 'right', 'top', 'bottom']" :key="side"><RadioGroupItem :value="side" /> {{ side }}</Label>
        </RadioGroup>
      </Demo>

      <Demo name="popover" title="Popover" description="Anchored to its trigger; flips and shifts to stay on screen.">
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline">Screenshot size</Button>
          </PopoverTrigger>
          <PopoverContent align="start">
            <p class="popover-title">Viewport</p>
            <p class="hint" style="margin-bottom: 0.75rem">Size of the preview screenshot, in pixels.</p>
            <div class="stack" style="gap: 0.5rem">
              <div class="row-between"><Label for="vp-width">Width</Label><Input id="vp-width" v-model="width" inputmode="numeric" style="width: 8rem" /></div>
              <div class="row-between"><Label for="vp-height">Height</Label><Input id="vp-height" v-model="height" inputmode="numeric" style="width: 8rem" /></div>
            </div>
          </PopoverContent>
        </Popover>
        <p class="readout">{{ width }} × {{ height }}</p>
      </Demo>

      <Demo name="dropdown-menu" title="Dropdown menu" description="Arrow keys, Home and End, type-to-select, checkbox and radio items, and submenus.">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">Deployment actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>4f2c9a1</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @select="lastAction = 'Promote to production'">Promote to production</DropdownMenuItem>
            <DropdownMenuItem @select="lastAction = 'Redeploy'">Redeploy <DropdownMenuShortcut>⌘R</DropdownMenuShortcut></DropdownMenuItem>
            <DropdownMenuItem @select="lastAction = 'Copy URL'">Copy URL</DropdownMenuItem>
            <DropdownMenuItem disabled>Roll back (nothing earlier)</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" @select="lastAction = 'Delete deployment'">Delete deployment</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">View options</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup aria-label="Show">
              <DropdownMenuLabel>Show</DropdownMenuLabel>
              <DropdownMenuCheckboxItem v-model="showPreviews">Preview deployments</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model="showFailed">Failed deployments</DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Density</DropdownMenuLabel>
            <DropdownMenuRadioGroup v-model="density" aria-label="Density">
              <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem @select="lastAction = 'Export as CSV'">CSV</DropdownMenuItem>
                <DropdownMenuItem @select="lastAction = 'Export as JSON'">JSON</DropdownMenuItem>
                <DropdownMenuItem disabled>PDF (plan upgrade)</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
        <p class="readout">{{ lastAction }} · previews: {{ showPreviews }} · failed: {{ showFailed }} · {{ density }}</p>
      </Demo>

      <Demo name="command" title="Command palette" description="Search and run anything by name. Opens with ⌘K or Ctrl+K from anywhere on the page.">
        <Button variant="outline" @click="commandOpen = true">Open command palette <DropdownMenuShortcut>⌘K</DropdownMenuShortcut></Button>
        <p class="readout">{{ lastCommand }}</p>
        <CommandPalette v-model:open="commandOpen">
          <CommandGroup heading="Deployments">
            <CommandItem keywords="ship release" @select="lastCommand = 'Promote to production'">Promote to production</CommandItem>
            <CommandItem shortcut="⌘R" @select="lastCommand = 'Redeploy'">Redeploy latest</CommandItem>
            <CommandItem keywords="undo revert" disabled>Roll back (nothing earlier)</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Project">
            <CommandItem keywords="env secrets" @select="lastCommand = 'Open environment variables'">Environment variables</CommandItem>
            <CommandItem @select="lastCommand = 'Open domains'">Domains</CommandItem>
            <CommandItem keywords="members people" @select="lastCommand = 'Invite a teammate'">Invite a teammate</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Appearance">
            <CommandItem keywords="dark light mode" @select="toggleTheme(); lastCommand = 'Switch theme'">Switch theme</CommandItem>
          </CommandGroup>
          <template #empty>No command matches.</template>
        </CommandPalette>
      </Demo>

      <Demo name="context-menu" title="Context menu" description="A right-click menu, filled with the dropdown menu's items.">
        <ContextMenu>
          <ContextMenuTrigger class="context-area" tabindex="0">Right-click here</ContextMenuTrigger>
          <ContextMenuContent aria-label="File actions">
            <DropdownMenuItem @select="lastContext = 'Open'">Open</DropdownMenuItem>
            <DropdownMenuItem @select="lastContext = 'Rename'">Rename <DropdownMenuShortcut>F2</DropdownMenuShortcut></DropdownMenuItem>
            <DropdownMenuCheckboxItem v-model="showHidden">Show hidden files</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" @select="lastContext = 'Delete'">Delete</DropdownMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <p class="readout">{{ lastContext }} · hidden files: {{ showHidden }}</p>
      </Demo>

      <Demo name="hover-card" title="Hover card and Collapsible" description="A preview on hover or focus that you can move into, and a single section that opens and closes.">
        <div class="stack">
          <p class="hint" style="font-size: 0.875rem">
            Last deployed by
            <HoverCard>
              <HoverCardTrigger href="#avatar" class="text-link">Ines Kovač</HoverCardTrigger>
              <HoverCardContent>
                <div class="row" style="flex-wrap: nowrap; align-items: flex-start">
                  <Avatar alt="">IK</Avatar>
                  <div>
                    <p class="popover-title">Ines Kovač</p>
                    <p class="hint">Owner · 214 deployments this year</p>
                    <a href="#data-table" class="text-link" style="font-size: 0.8125rem">See her deployments</a>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            twelve minutes ago.
          </p>
          <Collapsible v-model:open="envOpen">
            <div class="row-between">
              <span style="font-size: 0.875rem; font-weight: 500">3 environment variables</span>
              <CollapsibleTrigger as-child><Button size="sm" variant="outline">{{ envOpen ? 'Hide' : 'Show' }}</Button></CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <ul class="readout" style="margin: 0.75rem 0 0; padding: 0; list-style: none; display: grid; gap: 0.375rem">
                <li>DATABASE_URL</li>
                <li>STRIPE_WEBHOOK_SECRET</li>
                <li><a href="#sheet">SESSION_SECRET</a></li>
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Demo>

      <Demo name="sidebar" title="Sidebar and Empty state" description="App navigation in groups that shrinks to a rail of icons. On a narrow screen it slides in from the Menu button.">
        <div class="app-frame">
          <Sidebar v-model:collapsed="sidebarCollapsed" v-model:open="sidebarOpen" off-canvas label="Project">
            <template #header>
              <Button variant="ghost" size="icon" :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'" :aria-expanded="!sidebarCollapsed" @click="sidebarCollapsed = !sidebarCollapsed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></svg>
              </Button>
            </template>
            <SidebarGroup label="Project">
              <SidebarItem href="#sidebar" :active="sidebarPage === 'overview'" @click="sidebarPage = 'overview'">
                <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11 12 4l9 7v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" /></svg></template>
                Overview
              </SidebarItem>
              <SidebarItem href="#sidebar" :active="sidebarPage === 'deployments'" @click="sidebarPage = 'deployments'">
                <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5" /></svg></template>
                Deployments
              </SidebarItem>
              <SidebarItem href="#sidebar" :active="sidebarPage === 'logs'" @click="sidebarPage = 'logs'">
                <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 6h14M5 12h14M5 18h9" /></svg></template>
                Logs
              </SidebarItem>
            </SidebarGroup>
            <SidebarGroup label="Settings">
              <SidebarItem href="#sidebar" :active="sidebarPage === 'domains'" @click="sidebarPage = 'domains'">
                <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.500 0 18M12 3c-3 3.5-3 14.500 0 18" /></svg></template>
                Domains
              </SidebarItem>
            </SidebarGroup>
          </Sidebar>
          <div class="app-main">
            <Button class="menu-button" variant="outline" size="sm" aria-haspopup="dialog" @click="sidebarOpen = true">Menu</Button>
            <EmptyState :title="`No ${sidebarPage} yet`" description="Push to the main branch, or deploy by hand, and it will show up here.">
              <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5" /></svg></template>
              <Button size="sm" @click="toast('Deployment started')">Deploy now</Button>
              <Button size="sm" variant="outline" as="a" href="#command">Read the guide</Button>
            </EmptyState>
          </div>
        </div>
      </Demo>

      <Demo name="tree" title="Tree" description="Folders that open and close. Arrow keys move and expand, typing a letter jumps to a match.">
        <div class="stack" style="max-width: 20rem">
          <Tree v-model:expanded="openFolders" v-model:selected="openFile" :nodes="fileTree" label="Project files" />
          <p class="readout">{{ openFile ?? 'nothing selected' }}</p>
        </div>
      </Demo>

      <Demo name="carousel" title="Carousel" description="Swipe, scroll, or use the buttons, dots and arrow keys. Built on native scroll snapping.">
        <div class="stack">
          <Carousel v-model="releaseSlide" label="Recent releases">
            <CarouselSlide v-for="release in releases" :key="release.version" :aria-label="`Version ${release.version}: ${release.title}`">
              <Card style="height: 100%">
                <CardHeader>
                  <CardDescription>Version {{ release.version }}</CardDescription>
                  <CardTitle>{{ release.title }}</CardTitle>
                </CardHeader>
                <CardContent><p class="hint" style="font-size: 0.875rem">{{ release.text }}</p></CardContent>
              </Card>
            </CarouselSlide>
          </Carousel>
          <p class="readout">slide {{ releaseSlide }} of {{ releases.length }}</p>
        </div>
      </Demo>

      <Demo name="resizable" title="Resizable panels" description="Drag the handles, or focus one and use the arrow keys. Panels stop at their minimum size." wide>
        <div class="stack" style="max-width: none">
          <div class="app-frame" style="height: 14rem">
            <ResizablePanels v-model:sizes="paneSizes">
              <ResizablePanel :default-size="25" :min-size="15"><div class="pane">Files</div></ResizablePanel>
              <ResizableHandle grip label="Resize files panel" />
              <ResizablePanel :min-size="30">
                <ResizablePanels direction="vertical">
                  <ResizablePanel :default-size="65" :min-size="20"><div class="pane">Editor</div></ResizablePanel>
                  <ResizableHandle label="Resize editor" />
                  <ResizablePanel :min-size="20"><div class="pane">Terminal</div></ResizablePanel>
                </ResizablePanels>
              </ResizablePanel>
              <ResizableHandle grip label="Resize preview panel" />
              <ResizablePanel :default-size="25" :min-size="15"><div class="pane">Preview</div></ResizablePanel>
            </ResizablePanels>
          </div>
          <p class="readout">{{ paneSizes ? paneSizes.map((size) => `${Math.round(size)}%`).join(' · ') : 'default sizes: 25% · 50% · 25%' }}</p>
        </div>
      </Demo>

      <Demo name="tooltip" title="Tooltip" description="Shows on hover or keyboard focus; hides on Escape.">
        <Tooltip>
          <TooltipTrigger as-child><Button variant="outline">Build cache</Button></TooltipTrigger>
          <TooltipContent>Restored 412 MB from the previous build</TooltipContent>
        </Tooltip>
        <Tooltip :delay="0">
          <TooltipTrigger as-child><Button variant="ghost">No delay, on the right</Button></TooltipTrigger>
          <TooltipContent side="right">Appears immediately</TooltipContent>
        </Tooltip>
      </Demo>

      <Demo name="toast" title="Toast" description="Call toast() from anywhere. Timers pause while you hover.">
        <Button variant="outline" @click="toast('Settings saved')">Default</Button>
        <Button variant="outline" @click="toast.success('Deployed to production', { description: 'northwind-storefront is live in fra1.' })">Success</Button>
        <Button variant="outline" @click="toast.error('Build failed', { description: 'Type error in cart/total.ts on line 42.' })">Error</Button>
        <Button variant="outline" @click="toast.warning('Usage at 90% of your plan')">Warning</Button>
        <Button variant="outline" @click="undoable">With action</Button>
      </Demo>

      <Demo name="chart" title="Chart" description="Line, area, bar, donut and scatter charts in plain SVG. Hover or use the arrow keys to read values, click the legend to hide a series, or switch to a table." wide>
        <div class="chart-grid">
          <div>
            <p class="chart-title">Weekly requests</p>
            <Chart type="area" :data="traffic" x="week" x-label="Week starting" :series="trafficSeries" label="Weekly requests, and how many were served from cache" />
          </div>
          <div>
            <p class="chart-title">Deployments by month</p>
            <Chart type="bar" stacked :data="deployments" x="month" x-label="Month" :series="deploymentSeries" label="Deployments by month, split by kind" />
          </div>
          <div>
            <p class="chart-title">Median build time, this week</p>
            <Chart type="bar" :data="buildTimes" x="day" x-label="Day" :series="[{ key: 'seconds', label: 'Median build time' }]" :format="seconds" label="Median build time by day this week" />
          </div>
          <div>
            <p class="chart-title">Deployments by month, side by side</p>
            <Chart type="line" :data="deployments" x="month" x-label="Month" :series="deploymentSeries" label="Deployments by month, one line per kind" />
          </div>
          <div>
            <p class="chart-title">Top pages by views</p>
            <BarList :data="topPages" name="path" value="views" label="Top pages by views" />
          </div>
          <div>
            <p class="chart-title">Requests by day and hour (thousands)</p>
            <Heatmap :rows="heatDays" :columns="heatHours" :values="heatValues" row-label="Day" label="Requests by day of week and hour, in thousands" />
          </div>
          <div>
            <p class="chart-title">Plan usage</p>
            <div class="row" style="justify-content: space-around">
              <Gauge :value="62" label="Bandwidth" :warning="80" :critical="95" :format="(value) => `${value}%`" />
              <Gauge :value="91" label="Build minutes" :warning="80" :critical="95" :format="(value) => `${value}%`" />
            </div>
          </div>
          <div>
            <p class="chart-title">Bandwidth by region, last 30 days</p>
            <DonutChart :data="bandwidth" name="region" name-label="Region" value="gb" value-label="Bandwidth" :format="gigabytes" label="Bandwidth by region over the last 30 days" />
          </div>
          <div>
            <p class="chart-title">Build time against bundle size</p>
            <ScatterChart
              :data="builds"
              x="size"
              x-label="Bundle size (KB)"
              y="seconds"
              y-label="Build time (s)"
              group="framework"
              name="project"
              label="Build time against bundle size, one point per project"
            />
          </div>
        </div>
      </Demo>

      <Demo name="data-table" title="Data table and Filter bar" description="Rows and column definitions in; sorting, search, filters, row selection with bulk actions, rows that open, columns to hide and pages out." wide>
        <DataTable
          v-model:selected="selectedDeployments"
          v-model:filters="deploymentFilters"
          :rows="deploymentRows"
          :columns="deploymentColumns"
          row-key="id"
          :page-size="6"
          selectable
          searchable
          search-placeholder="Search deployments"
          column-toggle
          label="Deployments"
        >
          <template #toolbar><FilterBar v-model="deploymentFilters" :facets="deploymentFacets" label="Filter deployments" /></template>
          <template #bulk="{ selected, clear }">
            <Button variant="outline" size="sm" @click="((bulkAction = `redeployed ${selected.length}`), clear())">Redeploy</Button>
          </template>
          <template #expanded="{ row }">
            <p class="hint">Deployment <code>{{ row.id }}</code> of “{{ row.commit }}” by {{ row.author }}.</p>
          </template>
          <template #cell-status="{ row }">
            <Badge :variant="row.status === 'Failed' ? 'destructive' : row.status === 'Building' ? 'secondary' : 'outline'">{{ row.status }}</Badge>
          </template>
          <template #cell-branch="{ value }"><code class="readout">{{ value }}</code></template>
        </DataTable>
        <p class="readout" style="width: 100%">bulk action: {{ bulkAction || 'none yet' }}</p>
      </Demo>

      <Demo name="filter-bar" title="Filter bar, and a table fed by a server" description="The filter bar on its own, driving a table whose rows arrive already searched, filtered, sorted and paged. The headings stay in view while the rows scroll." wide>
        <div class="stack" style="max-width: none">
          <FilterBar v-model="serverFilters" :facets="deploymentFacets" label="Filter server deployments">
            <SearchInput v-model="serverSearch" style="max-width: 16rem" placeholder="Search" aria-label="Search server deployments" />
          </FilterBar>
          <DataTable
            v-model:sort="serverSort"
            v-model:page="serverPage"
            :filters="serverFilters"
            :search="serverSearch"
            :rows="serverRows"
            :columns="deploymentColumns"
            row-key="id"
            :page-size="8"
            :total="serverTotal"
            :loading="serverLoading"
            manual
            max-height="17rem"
            label="Server deployments"
          />
        </div>
      </Demo>

      <Demo name="table" title="Table" description="A styled HTML table in parts, for when you lay out the rows yourself.">
        <Table>
          <TableCaption>Invoices for the last four months.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead align="right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="invoice in invoices" :key="invoice.id">
              <TableHead scope="row">{{ invoice.id }}</TableHead>
              <TableCell>{{ invoice.period }}</TableCell>
              <TableCell>{{ invoice.status }}</TableCell>
              <TableCell align="right">{{ dollars(invoice.amount) }}</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colspan="3">Total</TableCell>
              <TableCell align="right">{{ dollars(invoices.reduce((sum, invoice) => sum + invoice.amount, 0)) }}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Demo>

      <Demo name="pagination" title="Pagination and Breadcrumb" description="Numbered pages with long ranges shortened, and the trail back to where you came from.">
        <div class="stack" style="justify-items: center; max-width: none">
          <Breadcrumb>
            <BreadcrumbItem href="#button">Northwind</BreadcrumbItem>
            <BreadcrumbItem href="#card">northwind-storefront</BreadcrumbItem>
            <BreadcrumbItem href="#data-table">Deployments</BreadcrumbItem>
            <BreadcrumbItem current>Build logs</BreadcrumbItem>
          </Breadcrumb>
          <Pagination v-model="logPage" :page-count="24" label="Build log pages" />
          <p class="readout">page {{ logPage }} of 24</p>
        </div>
      </Demo>

      <Demo name="event-calendar" title="Event calendar" description="A month as a grid of days, each listing what is on. Extra events fold into a count." wide>
        <div class="stack" style="max-width: none">
          <EventCalendar :events="calendarEvents" @select="calendarPick = `Event: ${$event.title}`" @select-date="calendarPick = `Day: ${$event}`" />
          <p class="readout">{{ calendarPick }}</p>
        </div>
      </Demo>

      <Demo name="kanban" title="Kanban" description="Drag cards between columns, or focus a card and hold Alt with an arrow key." wide>
        <div class="stack" style="max-width: none">
          <Kanban v-model="board" label="Sprint board" />
          <p class="readout">{{ board.map((column) => `${column.title}: ${column.cards.length}`).join(' · ') }}</p>
        </div>
      </Demo>

      <Demo name="virtual-list" title="Virtual list" description="Ten thousand rows, with only the ones in view actually drawn.">
        <VirtualList :items="logLines" :item-height="28" label="Request log" style="width: 100%; max-width: 24rem; height: 14rem">
          <template #default="{ item, index }">
            <span class="readout" style="display: flex; gap: 0.75rem; width: 100%"><span>{{ String(index + 1).padStart(5, ' ') }}</span><span>{{ item.time }}</span><span>{{ item.text }}</span></span>
          </template>
        </VirtualList>
      </Demo>

      <Demo name="alert" title="Alert" description="An inline message that stays on the page. Five variants, optional icon.">
        <div class="stack">
          <Alert variant="destructive">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16.5v.01" />
            </svg>
            <AlertTitle>Build failed</AlertTitle>
            <AlertDescription>Type error in cart/total.ts on line 42. The previous deployment is still live.</AlertDescription>
          </Alert>
          <Alert variant="warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3 2.5 20h19L12 3ZM12 10v4M12 17v.01" />
            </svg>
            <AlertTitle>Usage at 90% of your plan</AlertTitle>
          </Alert>
          <Alert variant="success">
            <AlertTitle>Domain verified</AlertTitle>
            <AlertDescription>shop.northwind.com now points at production.</AlertDescription>
          </Alert>
          <Alert>
            <AlertDescription>Scheduled maintenance in fra1 on Sunday from 02:00 to 02:30 UTC.</AlertDescription>
          </Alert>
        </div>
      </Demo>

      <Demo name="progress" title="Progress and Spinner" description="A bar for a known amount or an unknown one, and a ring for short waits.">
        <div class="stack">
          <div class="field">
            <div class="row-between">
              <Label id="build-label">Build</Label>
              <span class="readout">{{ buildProgress }}%</span>
            </div>
            <Progress :value="buildProgress" aria-labelledby="build-label" />
          </div>
          <div class="field">
            <Label id="queue-label">Waiting for a build machine</Label>
            <Progress aria-labelledby="queue-label" />
          </div>
          <div class="row">
            <Button :loading="building" @click="runBuild">{{ building ? 'Building' : 'Run build' }}</Button>
            <Spinner size="sm" />
            <Spinner />
            <Spinner size="lg" />
          </div>
        </div>
      </Demo>

      <Demo name="avatar" title="Avatar" description="A round picture that falls back to initials when the image is missing or broken.">
        <div class="row">
          <Avatar size="sm" alt="Ines Kovač">IK</Avatar>
          <Avatar alt="Northwind Storefront">NS</Avatar>
          <Avatar size="lg" alt="Tomás Ortega">TO</Avatar>
          <Avatar alt="Ermine" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23475569'/%3E%3Cpath d='M0 40 20 14l20 26Z' fill='%2394a3b8'/%3E%3Ccircle cx='29' cy='11' r='5' fill='%23e2e8f0'/%3E%3C/svg%3E">SB</Avatar>
          <Avatar alt="Broken image" src="/missing-avatar.png">BI</Avatar>
        </div>
      </Demo>

      <Demo name="skeleton" title="Skeleton" description="Placeholder blocks while content loads. Pulse or shimmer; still when motion is reduced.">
        <div class="stack" style="max-width: 22rem">
          <Card :aria-busy="deploymentLoading">
            <CardHeader>
              <div class="row" style="flex-wrap: nowrap">
                <Skeleton v-if="deploymentLoading" circle style="height: 2.5rem" />
                <Avatar v-else>NS</Avatar>
                <div style="flex: 1; display: grid; gap: 0.375rem">
                  <template v-if="deploymentLoading">
                    <Skeleton style="width: 60%; height: 1.125rem" />
                    <Skeleton style="width: 85%; height: 0.875rem" />
                  </template>
                  <template v-else>
                    <CardTitle>northwind-storefront</CardTitle>
                    <CardDescription>Production · deployed 12 minutes ago</CardDescription>
                  </template>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div v-if="deploymentLoading" style="display: grid; gap: 0.5rem">
                <Skeleton animation="shimmer" />
                <Skeleton animation="shimmer" />
                <Skeleton animation="shimmer" style="width: 70%" />
              </div>
              <p v-else class="hint">Fix cart rounding for multi-currency orders, and cache the shipping estimate between checkout steps.</p>
            </CardContent>
          </Card>
          <div class="row-between">
            <Label for="skeleton-loading">Loading</Label>
            <Switch id="skeleton-loading" v-model="deploymentLoading" />
          </div>
        </div>
      </Demo>

      <Demo name="badge" title="Badge and Separator" description="Small status labels, and a dividing line in either direction.">
        <div class="row" style="height: 1.5rem">
          <Badge>Ready</Badge>
          <Separator orientation="vertical" />
          <Badge variant="secondary">Building</Badge>
          <Separator orientation="vertical" />
          <Badge variant="outline">Queued</Badge>
          <Separator orientation="vertical" />
          <Badge variant="destructive">Failed</Badge>
        </div>
      </Demo>

      <Demo name="icon" title="Icon" description="A small built-in set of line icons. They take the size and colour of the text around them, and you can add your own." wide>
        <div class="stack" style="max-width: none">
          <div class="row">
            <Button><Icon name="plus" /> New project</Button>
            <Button variant="outline" size="icon" aria-label="Delete"><Icon name="trash" /></Button>
            <span class="hint"><Icon name="circle-check" label="Passed" style="color: var(--er-success)" /> 512 checks</span>
            <span class="hint"><Icon name="rocket" /> rocket was added with registerIcons()</span>
          </div>
          <div class="row">
            <span class="hint">Size in px</span>
            <ToggleGroup v-model="iconSize" aria-label="Icon size">
              <ToggleGroupItem value="16">16</ToggleGroupItem>
              <ToggleGroupItem value="24">24</ToggleGroupItem>
              <ToggleGroupItem value="32">32</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <ul class="icon-grid">
            <li v-for="name in iconNames()" :key="name"><Icon :name="name" :size="Number(iconSize)" /><code>{{ name }}</code></li>
          </ul>
        </div>
      </Demo>

      <Demo name="image-fan" title="Image fan" description="Framed pictures overlapping like a hand of cards. Point at one, or tab to it, and it comes to the front. The fan shrinks to fit a narrow space." wide>
        <ImageFan :images="fanImages" />
      </Demo>

      <Demo name="product-card" title="Product card, Price, Swatch" description="A product as one link with its picture, score and price; money with the old price struck through; and colour or size choices with sold-out ones crossed off." wide>
        <div class="shop-grid">
          <ProductCard v-for="product in shopProducts" :key="product.title" v-bind="product" href="#product-gallery">
            <template #action>
              <Button variant="secondary" size="icon" :aria-pressed="wishlist.includes(product.title)" :aria-label="`Save ${product.title} for later`" @click="toggleWish(product.title)">
                <Icon name="heart" :style="wishlist.includes(product.title) ? { fill: 'currentColor' } : undefined" />
              </Button>
            </template>
            <Button variant="outline" size="sm" @click="shopEvent = `added ${product.title}`">Add to cart</Button>
          </ProductCard>
        </div>
        <div class="stack" style="max-width: none">
          <div class="row">
            <Price :amount="24" size="lg" />
            <Price :amount="96" :compare-at="120" show-saving />
            <Price :amount="9" unit="/ month" size="sm" />
            <Price :amount="1299" currency="EUR" locale="de-DE" />
          </div>
          <div class="row">
            <SwatchGroup v-model="mugColour" label="Colour">
              <Swatch value="sand" color="#c9b79c" label="Sand" />
              <Swatch value="moss" color="#6f8a5b" label="Moss" />
              <Swatch value="ink" color="#2f3a4f" label="Ink" />
              <Swatch value="chalk" color="#f5f3ee" label="Chalk" unavailable />
            </SwatchGroup>
            <SwatchGroup v-model="mugSize" label="Size">
              <Swatch value="250">250 ml</Swatch>
              <Swatch value="350">350 ml</Swatch>
              <Swatch value="500" unavailable>500 ml</Swatch>
            </SwatchGroup>
          </div>
          <p class="readout">{{ mugColour }}, {{ mugSize }} ml · {{ shopEvent }} · saved: {{ wishlist.length }}</p>
        </div>
      </Demo>

      <Demo name="product-gallery" title="Product gallery" description="One large picture and thumbnails to switch between. Swipe or use the arrow keys; point with a mouse to magnify.">
        <div class="stack">
          <ProductGallery v-model="galleryImage" :images="galleryImages" label="Stoneware mug pictures" zoom />
          <p class="readout">picture {{ galleryImage }} of {{ galleryImages.length }}</p>
        </div>
      </Demo>

      <Demo name="range-slider" title="Range slider and Masked input" description="Two thumbs on one track for a lowest and highest value, and fields that lay out card numbers, dates and phone numbers as they are typed.">
        <div class="stack">
          <div class="field">
            <div class="row-between">
              <Label id="price-range-label">Price</Label>
              <span class="readout">${{ priceRange[0] }} to ${{ priceRange[1] }}</span>
            </div>
            <RangeSlider v-model="priceRange" :min="0" :max="200" :step="5" :min-gap="10" low-label="Lowest price" high-label="Highest price" aria-labelledby="price-range-label" />
          </div>
          <div class="field">
            <Label for="masked-card">Card number</Label>
            <MaskedInput id="masked-card" v-model="cardNumber" :mask="masks.card" placeholder="1234 1234 1234 1234" autocomplete="off" />
          </div>
          <div class="row" style="flex-wrap: nowrap">
            <div class="field" style="flex: 1">
              <Label for="masked-expiry">Expiry</Label>
              <MaskedInput id="masked-expiry" v-model="cardExpiry" :mask="masks.expiry" placeholder="MM/YY" autocomplete="off" />
            </div>
            <div class="field" style="flex: 2">
              <Label for="masked-phone">Phone</Label>
              <MaskedInput id="masked-phone" v-model="phone" :mask="masks.phoneUS" placeholder="(555) 010-0199" autocomplete="off" />
            </div>
          </div>
          <p class="readout">card: {{ cardNumber || '—' }} · expiry: {{ cardExpiry || '—' }} · phone: {{ phone || '—' }}</p>
        </div>
      </Demo>

      <Demo name="option-card" title="Option card, Cart line item, Order summary" description="The pieces of a cart and a checkout: a choice as a whole card, one product in a cart, and the sums.">
        <div class="stack">
          <RadioGroup v-model="delivery" aria-label="Delivery">
            <OptionCard value="standard" title="Standard" description="3 to 5 working days"><template #end>Free</template></OptionCard>
            <OptionCard value="express" title="Express" description="1 to 2 working days"><template #end>$12.00</template></OptionCard>
            <OptionCard value="drone" title="Drone" description="Not available in your area" disabled><template #end>$30.00</template></OptionCard>
          </RadioGroup>
          <Separator />
          <CartLineItem
            v-if="!lineRemoved"
            v-model:quantity="lineQuantity"
            title="Stoneware mug"
            options="Sand / 350 ml"
            :image="shopPicture('#efe7da', '#c9b79c')"
            :price="24"
            :max="6"
            @remove="lineRemoved = true"
          />
          <Button v-else variant="outline" size="sm" @click="lineRemoved = false">Put the mug back</Button>
          <Separator />
          <OrderSummary :subtotal="lineRemoved ? 0 : 24 * lineQuantity" :shipping="delivery === 'express' ? 12 : 0" :tax="lineRemoved ? 0 : 1.92 * lineQuantity" />
        </div>
      </Demo>

      <!-- The newer demos live in files of their own, a group to a file, so this one stays readable. -->
      <ShopDemos />
      <MobileDemos />
      <GeneralDemos />

      <Demo name="dashboard" title="Block: Dashboard" description="A whole app page put together from the components above: sidebar, top bar, headline numbers, charts and a table. Copy it, then swap in your own data." wide>
        <div class="block-frame">
          <Dashboard main-as="div" title-as="h3" style="--er-dashboard-height: 44rem" @sign-out="blockEvent = 'signed out'" @export="blockEvent = 'export pressed'" />
        </div>
        <p class="readout" data-readout="blocks">{{ blockEvent }}</p>
      </Demo>

      <Demo name="sign-in" title="Block: Sign in" description="Email and password on a card, checked before it is sent. Try the password “wrong” to see a server error.">
        <SignIn :loading="signInLoading" :error="signInError" forgot-href="#sign-in" sign-up-href="#sign-in" @submit="signIn" />
      </Demo>

      <Demo name="settings" title="Block: Settings" description="Account settings in tabs: a profile form, notification switches, and a guarded delete.">
        <SettingsPage
          :profile="{ name: 'Ines Kovač', email: 'ines@example.com', timezone: 'Europe/Berlin' }"
          @save-profile="blockEvent = `profile saved for ${$event.name}`"
          @save-notifications="blockEvent = `notifications: ${$event.join(', ') || 'none'}`"
          @delete-account="blockEvent = 'account deleted'"
        />
      </Demo>

      <Demo name="cart" title="Block: Cart" description="The items with quantities to change, a discount code, the sums and the way on. Try the code SAVE10." wide>
        <div class="stack" style="max-width: 60rem">
          <Cart
            v-model:items="cartItems"
            title-as="h3"
            shop-href="#product-card"
            :shipping="0"
            :discount="cartDiscount"
            discount-label="SAVE10"
            :code-error="cartCodeError"
            @apply-code="applyCartCode"
            @checkout="cartEvent = `checkout with ${$event.length} lines`"
          />
          <p class="readout">{{ cartEvent }}</p>
        </div>
      </Demo>

      <Demo name="checkout" title="Block: Checkout" description="Contact, address, delivery and card details checked as one form, beside the order. A card number starting 4000 is declined." wide>
        <div class="stack" style="max-width: 60rem">
          <Checkout :loading="checkoutLoading" :error="checkoutError" :tax="11.52" @submit="placeOrder" />
          <p class="readout">{{ checkoutEvent }}</p>
        </div>
      </Demo>

      <BlockDemos />
    </main>

    <footer class="footer">Every demo above is the unmodified source that <code>ermine add</code> copies into a project.</footer>
    <Toaster />
  </div>
</template>
