<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Avatar } from '../../../registry/ui/avatar'
import { Button } from '../../../registry/ui/button'
import { ChatComposer, ChatMessage, ChatThread } from '../../../registry/ui/chat'
import { CommentThread, type CommentNode } from '../../../registry/ui/comment-thread'
import { DiffViewer } from '../../../registry/ui/diff-viewer'
import { EmojiPicker } from '../../../registry/ui/emoji-picker'
import { ImageCropper } from '../../../registry/ui/image-cropper'
import { PasswordInput } from '../../../registry/ui/input-group'
import { JsonViewer } from '../../../registry/ui/json-viewer'
import { Label } from '../../../registry/ui/label'
import { Markdown } from '../../../registry/ui/markdown'
import { Marquee } from '../../../registry/ui/marquee'
import { MediaPlayer } from '../../../registry/ui/media-player'
import { Meter } from '../../../registry/ui/meter'
import { NotificationCenter, type NotificationItem } from '../../../registry/ui/notification-center'
import { PasswordStrength } from '../../../registry/ui/password-strength'
import { PhoneInput } from '../../../registry/ui/phone-input'
import { RichTextEditor } from '../../../registry/ui/rich-text-editor'
import { SegmentedControl, SegmentedControlItem } from '../../../registry/ui/segmented-control'
import { Slider } from '../../../registry/ui/slider'
import { Toolbar, ToolbarButton, ToolbarSeparator } from '../../../registry/ui/toolbar'
import Demo from '../Demo.vue'

// Phone input and password strength
const phone = ref('')
const password = ref('')

// Toolbar and meter
const align = ref('left')
const toolbarEvent = ref('nothing pressed')
const storage = ref(42)
const battery = ref(18)
const gigabytes = (value: number, max: number) => `${value} GB of ${max} GB`

// Rich text editor
const article = ref('<p>Thrown by hand and <strong>glazed twice</strong>, so no two are quite alike.</p>')

// Markdown
const markdown = `# Release notes

Version **0.4** adds a *lot*. See the [changelog](#markdown) for everything.

- [x] Shop blocks
- [ ] Dark mode screenshots
- Mobile components
  - Action sheet
  - Swipe actions

| Component | Size |
|-----------|-----:|
| Markdown  | 4 kB |
| Chat      | 3 kB |

\`\`\`sh
npx ermine add markdown
\`\`\`

> Text from strangers is safe: <script>alert(1)<\/script> stays text.`

// Emoji picker
const emojiChosen = ref('nothing chosen')
const emojiRecent = ref<string[]>([])

// Image cropper: a stand-in landscape photograph drawn as SVG.
const landscape = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#cfe0ea"/><circle cx="460" cy="90" r="44" fill="#f3d27a"/><path d="M0 300l140-150 110 110 90-80 260 200v20H0Z" fill="#6f8a5b"/><path d="M0 340l200-90 180 70 220-60v140H0Z" fill="#48603c"/></svg>',
)}`
const cropper = ref<InstanceType<typeof ImageCropper> | null>(null)
const cropState = ref({ x: 0, y: 0, zoom: 1 })
const cropResult = ref('not cropped yet')
async function crop() {
  const blob = await cropper.value?.crop({ width: 256, type: 'image/png' })
  cropResult.value = blob ? `cropped to a ${blob.type} of ${blob.size > 0 ? 'some' : 'no'} bytes` : 'could not crop'
}

// Chat
interface Message {
  id: number
  text: string
  mine?: boolean
  time: string
  status?: 'sending' | 'sent' | 'read' | 'failed'
}
const messages = ref<Message[]>([
  { id: 1, text: 'Hi! My order says delivered but nothing has arrived.', mine: true, time: '14:02', status: 'read' },
  { id: 2, text: 'Sorry about that. Let me look into it — do you have the order number?', time: '14:03' },
])
const typing = ref(false)
let replyTimer: ReturnType<typeof setTimeout> | undefined
function sendMessage(text: string) {
  messages.value.push({ id: messages.value.length + 1, text, mine: true, time: '14:05', status: 'sent' })
  typing.value = true
  clearTimeout(replyTimer)
  replyTimer = setTimeout(() => {
    typing.value = false
    messages.value.push({ id: messages.value.length + 1, text: 'Thanks, found it. A replacement is on its way.', time: '14:06' })
  }, 900)
}

// Comment thread
const comments = ref<CommentNode[]>([
  {
    id: 'c1',
    author: 'Maya Robinson',
    body: 'Does the glaze hold up in the dishwasher?',
    date: '2026-09-14',
    replies: [{ id: 'c2', author: 'Hearth & Kiln', badge: 'Staff', body: 'It does. We have run ours daily for two years.', date: '2026-09-15' }],
  },
  { id: 'c3', author: 'Ines Kovač', body: 'Bought four. Each one is slightly different, which is the charm.', date: '2026-08-02', canDelete: true },
])
let commentId = 10
function addComment(text: string) {
  comments.value = [{ id: `c${commentId++}`, author: 'You', body: text, date: '2026-10-12', canDelete: true }, ...comments.value]
}
function addReply(text: string, parent: CommentNode) {
  const add = (list: CommentNode[]): CommentNode[] =>
    list.map((comment) => (comment.id === parent.id ? { ...comment, replies: [...(comment.replies ?? []), { id: `c${commentId++}`, author: 'You', body: text, date: '2026-10-12', canDelete: true }] } : { ...comment, replies: add(comment.replies ?? []) }))
  comments.value = add(comments.value)
}
function deleteComment(target: CommentNode) {
  const drop = (list: CommentNode[]): CommentNode[] => list.filter((comment) => comment.id !== target.id).map((comment) => ({ ...comment, replies: drop(comment.replies ?? []) }))
  comments.value = drop(comments.value)
}

// Notification centre and marquee
const notifications = ref<NotificationItem[]>([
  { id: 'n1', title: 'Deployment failed', body: 'northwind-storefront · 4f2c9a1', time: '2 minutes ago' },
  { id: 'n2', title: 'Ines invited you to Checkout', time: '1 hour ago' },
  { id: 'n3', title: 'Your invoice for September is ready', time: 'Yesterday', read: true },
])
const notificationEvent = ref('nothing opened')
const customers = ['Northwind', 'Hearth & Kiln', 'Lumen Works', 'Fell & Co', 'Alder Row', 'Northfold']
const marqueePaused = ref(false)

// JSON viewer and diff viewer
const payload = {
  id: 'ord_10482',
  paid: true,
  total: 139.97,
  coupon: null,
  customer: { name: 'Maya Robinson', email: 'maya@example.com' },
  items: [
    { sku: 'mug-sand', quantity: 2 },
    { sku: 'throw-moss', quantity: 1 },
  ],
}
const diffView = ref('unified')
const configBefore = `export default {
  region: 'fra1',
  framework: 'nuxt',
  build: {
    command: 'npm run build',
    cache: false,
  },
  previews: true,
}`
const configAfter = `export default {
  region: 'fra1',
  framework: 'nuxt',
  build: {
    command: 'npm run build',
    cache: true,
    timeout: 600,
  },
}`

// Media player: three seconds of a quiet tone, made here so the demo needs no file and no network.
const tone = ref<string>()
const mediaEvent = ref('not played yet')
onMounted(() => {
  const rate = 8000
  const samples = rate * 3
  const buffer = new ArrayBuffer(44 + samples * 2)
  const data = new DataView(buffer)
  const text = (offset: number, value: string) => [...value].forEach((character, index) => data.setUint8(offset + index, character.charCodeAt(0)))
  text(0, 'RIFF')
  data.setUint32(4, 36 + samples * 2, true)
  text(8, 'WAVEfmt ')
  data.setUint32(16, 16, true)
  data.setUint16(20, 1, true)
  data.setUint16(22, 1, true)
  data.setUint32(24, rate, true)
  data.setUint32(28, rate * 2, true)
  data.setUint16(32, 2, true)
  data.setUint16(34, 16, true)
  text(36, 'data')
  data.setUint32(40, samples * 2, true)
  for (let index = 0; index < samples; index++) data.setInt16(44 + index * 2, Math.sin((index / rate) * 2 * Math.PI * 330) * 2500, true)
  tone.value = URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
})
onBeforeUnmount(() => {
  clearTimeout(replyTimer)
  if (tone.value) URL.revokeObjectURL(tone.value)
})
</script>

<template>
  <Demo name="phone-input" title="Phone input and Password strength" description="A calling code and a number as one international value, laid out the way that country writes it; and a bar and a word for how strong a password is, with the rules ticked off.">
    <div class="stack">
      <div class="field">
        <Label for="phone-demo">Phone</Label>
        <PhoneInput id="phone-demo" v-model="phone" placeholder="(555) 010-0199" />
      </div>
      <div class="field">
        <Label for="strength-demo">New password</Label>
        <PasswordInput id="strength-demo" v-model="password" autocomplete="new-password" />
        <PasswordStrength :password="password" />
      </div>
      <p class="readout">phone: {{ phone || '—' }}</p>
    </div>
  </Demo>

  <Demo name="toolbar" title="Toolbar and Meter" description="A row of controls that takes one stop in the tab order, with the arrow keys moving between them; and a bar for a reading in a known range that changes colour past the levels you call low and high.">
    <div class="stack">
      <Toolbar label="Text alignment">
        <ToolbarButton label="Align left" :pressed="align === 'left'" @click="align = 'left'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h13" /></svg>
        </ToolbarButton>
        <ToolbarButton label="Align centre" :pressed="align === 'centre'" @click="align = 'centre'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M7 12h10M5 18h14" /></svg>
        </ToolbarButton>
        <ToolbarButton label="Align right" :pressed="align === 'right'" @click="align = 'right'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M10 12h10M7 18h13" /></svg>
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton @click="toolbarEvent = 'copied'">Copy</ToolbarButton>
        <ToolbarButton disabled>Paste</ToolbarButton>
        <ToolbarButton @click="toolbarEvent = 'cleared'">Clear</ToolbarButton>
      </Toolbar>
      <p class="readout">align: {{ align }} · {{ toolbarEvent }}</p>
      <Meter label="Storage used" :value="storage" :max="64" :low="32" :high="56" optimum="low" :format="gigabytes" />
      <Slider v-model="storage" :max="64" aria-label="Storage used, in GB" />
      <Meter label="Battery" :value="battery" :low="20" :high="60" optimum="high" />
      <Slider v-model="battery" aria-label="Battery, in percent" />
    </div>
  </Demo>

  <Demo name="rich-text-editor" title="Rich text editor" description="Bold, italic, headings, lists, quotes and links, giving back clean HTML. What is pasted in loses its fonts and colours on the way.">
    <div class="stack">
      <RichTextEditor v-model="article" label="Product description" placeholder="Describe the product" />
      <p class="readout" style="overflow-wrap: anywhere">{{ article || 'empty' }}</p>
    </div>
  </Demo>

  <Demo name="markdown" title="Markdown" description="Markdown shown as styled content: headings, lists, task lists, tables, code and links. Everything in the source is escaped, so text from other people is safe to show.">
    <div class="stack"><Markdown :source="markdown" :heading-offset="2" /></div>
  </Demo>

  <Demo name="emoji-picker" title="Emoji picker" description="Emoji in groups with a search box. Arrow keys move through them, and each one is named for screen readers.">
    <div class="stack" style="justify-items: center">
      <EmojiPicker v-model:recent="emojiRecent" @select="(emoji, name) => (emojiChosen = `${emoji} ${name}`)" />
      <p class="readout">{{ emojiChosen }}</p>
    </div>
  </Demo>

  <Demo name="image-cropper" title="Image cropper" description="Drag the picture into place behind a fixed frame, zoom with the slider, a pinch or the wheel, then cut it out as a file. Arrow keys move it too.">
    <div class="stack" style="max-width: 18rem">
      <ImageCropper ref="cropper" v-model="cropState" :src="landscape" round label="Position your profile picture" />
      <div class="row">
        <Button size="sm" @click="crop">Crop</Button>
        <Button size="sm" variant="outline" @click="cropper?.reset()">Reset</Button>
      </div>
      <p class="readout">zoom {{ cropState.zoom.toFixed(2) }} · moved {{ Math.round(cropState.x) }}, {{ Math.round(cropState.y) }} · {{ cropResult }}</p>
    </div>
  </Demo>

  <Demo name="chat" title="Chat" description="A conversation as bubbles that stays scrolled to the newest message unless you have scrolled up to read. Enter sends; Shift and Enter starts a new line.">
    <div class="stack">
      <div class="chat-frame">
        <ChatThread label="Chat with support" :typing="typing" typing-label="Support is typing…">
          <ChatMessage v-for="message in messages" :key="message.id" :mine="message.mine" :author="message.mine ? undefined : 'Support'" :time="message.time" :status="message.status">
            <template v-if="!message.mine" #avatar><Avatar size="sm">S</Avatar></template>
            {{ message.text }}
          </ChatMessage>
        </ChatThread>
        <div class="chat-frame-composer"><ChatComposer label="Message to support" @send="sendMessage" /></div>
      </div>
      <p class="readout">{{ messages.length }} messages</p>
    </div>
  </Demo>

  <Demo name="comment-thread" title="Comment thread" description="Comments with replies nested under them. A reply box opens under any comment, and only one is open at a time.">
    <div class="stack">
      <CommentThread :comments="comments" title-as="h3" @submit="addComment" @reply="addReply" @delete="deleteComment" />
    </div>
  </Demo>

  <Demo name="notification-center" title="Notification centre and Marquee" description="A bell with a count of what is unread, opening a list that marks each one read as it is pressed; and a row of names drifting past in a loop, with a pause button, that stands still when motion is reduced.">
    <div class="stack">
      <div class="row">
        <NotificationCenter v-model:items="notifications" @select="notificationEvent = `opened: ${$event.title}`" @read-all="notificationEvent = 'all marked as read'">
          <template #footer><a class="text-link" href="#notification-center">Notification settings</a></template>
        </NotificationCenter>
        <span class="readout" data-readout="notification-center">{{ notificationEvent }} · {{ notifications.filter((item) => !item.read).length }} unread</span>
      </div>
      <Marquee v-model:paused="marqueePaused" label="Customers">
        <span v-for="customer in customers" :key="customer" class="marquee-name">{{ customer }}</span>
      </Marquee>
      <p class="readout">marquee paused: {{ marqueePaused }}</p>
    </div>
  </Demo>

  <Demo name="json-viewer" title="JSON viewer and Diff viewer" description="Any value as a tree you can open and close; and two versions of a text compared line by line, in one column or side by side." wide>
    <div class="stack" style="max-width: 44rem">
      <JsonViewer :value="payload" label="Order" :expand-depth="1" />
      <div class="row-between">
        <SegmentedControl v-model="diffView" label="Diff layout" size="sm">
          <SegmentedControlItem value="unified">Unified</SegmentedControlItem>
          <SegmentedControlItem value="split">Split</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <DiffViewer :before="configBefore" :after="configAfter" :view="diffView === 'split' ? 'split' : 'unified'" title="ermine.config.ts" :context="2" />
    </div>
  </Demo>

  <Demo name="media-player" title="Media player" description="Audio or video with its own controls: play, seek, volume and speed, all reachable by keyboard. K or Space plays, M mutes, and the arrow keys skip five seconds.">
    <div class="stack" style="max-width: 30rem">
      <MediaPlayer v-if="tone" kind="audio" title="Three seconds of a test tone" :src="tone" preload="auto" @play="mediaEvent = 'playing'" @pause="mediaEvent = 'paused'" @ended="mediaEvent = 'finished'" />
      <p class="readout">{{ mediaEvent }}</p>
    </div>
  </Demo>
</template>
