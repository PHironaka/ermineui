<script setup lang="ts">
import { ref } from 'vue'
import { ActionSheet, ActionSheetItem } from '../../../registry/ui/action-sheet'
import { AppBar } from '../../../registry/ui/app-bar'
import { Button } from '../../../registry/ui/button'
import { Fab, FabAction } from '../../../registry/ui/fab'
import { InfiniteScroll } from '../../../registry/ui/infinite-scroll'
import { InstallPrompt } from '../../../registry/ui/install-prompt'
import { PullToRefresh } from '../../../registry/ui/pull-to-refresh'
import { SwipeActions } from '../../../registry/ui/swipe-actions'
import { UpdatePrompt } from '../../../registry/ui/update-prompt'
import Demo from '../Demo.vue'

// App bar and FAB
const appBarEvent = ref('nothing pressed')

// Action sheet and swipe actions
const sheetEvent = ref('nothing chosen')
const freshMail = () => [
  { id: 1, from: 'Maya Robinson', subject: 'Your order has shipped' },
  { id: 2, from: 'Northfold', subject: 'New in: autumn throws' },
  { id: 3, from: 'Tomás Lindqvist', subject: 'Re: invoice for September' },
]
const mail = ref(freshMail())
const swipeEvent = ref('nothing done')
function archive(id: number) {
  swipeEvent.value = `archived ${mail.value.find((item) => item.id === id)?.subject}`
  mail.value = mail.value.filter((item) => item.id !== id)
}

// Pull to refresh and infinite scroll
const refreshed = ref(0)
const refreshList = () => new Promise<void>((resolve) => setTimeout(() => (refreshed.value++, resolve()), 600))
const feed = ref(Array.from({ length: 8 }, (_item, index) => index + 1))
const feedLoading = ref(false)
function loadMore() {
  feedLoading.value = true
  setTimeout(() => {
    feed.value = [...feed.value, ...Array.from({ length: 8 }, (_item, index) => feed.value.length + index + 1)]
    feedLoading.value = false
  }, 500)
}

// Install prompt and update prompt
const installEvent = ref('not asked')
const updateAvailable = ref(false)
const updateEvent = ref('up to date')
</script>

<template>
  <Demo name="app-bar" title="App bar and FAB" description="A phone's top bar with a back button, the name of the screen and an action; and a round button over the corner that opens into a short stack of things to do.">
    <div class="stack">
      <div class="phone-frame">
        <AppBar title="Orders" back :sticky="false" title-as="h3" @back="appBarEvent = 'back'">
          <template #end>
            <button type="button" class="er-app-bar-button" aria-label="Search orders" @click="appBarEvent = 'search'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14ZM20 20l-4-4" /></svg>
            </button>
          </template>
        </AppBar>
        <div class="phone-frame-body">
          <p class="hint">The page goes here, and scrolls under the bar.</p>
          <Fab label="New" :fixed="false" class="phone-frame-fab">
            <template #actions>
              <FabAction @select="appBarEvent = 'new order'">New order</FabAction>
              <FabAction @select="appBarEvent = 'new customer'">New customer</FabAction>
            </template>
          </Fab>
        </div>
      </div>
      <p class="readout">{{ appBarEvent }}</p>
    </div>
  </Demo>

  <Demo name="action-sheet" title="Action sheet and Swipe actions" description="A short list of things to do, sliding up from the bottom with Cancel underneath; and rows that slide aside under a finger to uncover buttons, which the keyboard reaches by tabbing.">
    <div class="stack">
      <div class="row">
        <ActionSheet title="Wool throw" description="Moss / 130 × 180 cm">
          <template #trigger><Button variant="outline">Item options</Button></template>
          <ActionSheetItem @select="sheetEvent = 'saved for later'">Save for later</ActionSheetItem>
          <ActionSheetItem @select="sheetEvent = 'shared'">Share</ActionSheetItem>
          <ActionSheetItem destructive @select="sheetEvent = 'removed'">Remove from cart</ActionSheetItem>
        </ActionSheet>
        <span class="readout" data-readout="action-sheet">{{ sheetEvent }}</span>
      </div>
      <ul class="swipe-list">
        <li v-for="item in mail" :key="item.id">
          <SwipeActions>
            <div class="swipe-row">
              <strong>{{ item.from }}</strong>
              <span>{{ item.subject }}</span>
            </div>
            <template #actions>
              <button type="button" @click="archive(item.id)">Archive<span class="sr-only">: {{ item.subject }}</span></button>
              <button type="button" data-destructive @click="((swipeEvent = `deleted ${item.subject}`), (mail = mail.filter((other) => other.id !== item.id)))">Delete<span class="sr-only">: {{ item.subject }}</span></button>
            </template>
          </SwipeActions>
        </li>
      </ul>
      <Button v-if="mail.length < 3" variant="ghost" size="sm" @click="mail = freshMail()">Bring the messages back</Button>
      <p class="readout">{{ swipeEvent }}</p>
    </div>
  </Demo>

  <Demo name="pull-to-refresh" title="Pull to refresh and Infinite scroll" description="On a phone, drag the list down to load it again; the button does the same for everyone else. Scroll to its end and the next rows arrive by themselves.">
    <div class="stack">
      <div class="feed" tabindex="0" role="group" aria-label="Activity">
        <PullToRefresh v-slot="{ refresh, refreshing }" :on-refresh="refreshList">
          <div class="feed-top">
            <Button variant="outline" size="sm" :loading="refreshing" @click="refresh">Refresh</Button>
            <span class="readout">refreshed {{ refreshed }} times</span>
          </div>
          <InfiniteScroll :loading="feedLoading" :done="feed.length >= 24" @load="loadMore">
            <ul class="feed-list">
              <li v-for="number in feed" :key="number">Deployment #{{ 500 - number }}</li>
            </ul>
          </InfiniteScroll>
        </PullToRefresh>
      </div>
      <p class="readout">{{ feed.length }} rows loaded</p>
    </div>
  </Demo>

  <Demo name="install-prompt" title="Install prompt and Update prompt" description="An offer to add the app to the home screen, shown when the browser allows it (here it is forced on); and a notice that a new version is ready.">
    <div class="stack">
      <InstallPrompt preview storage-key="" title="Install Ermine" description="Opens straight to your orders, and works offline." @dismiss="installEvent = 'not now'" @installed="installEvent = 'installed'" />
      <p class="readout">install: {{ installEvent }}</p>
      <div class="row">
        <Button variant="outline" size="sm" @click="((updateAvailable = true), (updateEvent = 'update waiting'))">Pretend a new version shipped</Button>
      </div>
      <UpdatePrompt v-model:available="updateAvailable" :reload="false" @update="((updateEvent = 'reloading into the new version'), (updateAvailable = false))" @dismiss="updateEvent = 'put off'" />
      <p class="readout">update: {{ updateEvent }}</p>
    </div>
  </Demo>
</template>
