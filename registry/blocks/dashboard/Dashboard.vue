<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { BarList, Chart } from '../../ui/chart'
import { DataTable, type DataTableColumn } from '../../ui/data-table'
import { Icon } from '../../ui/icon'
import { Stat } from '../../ui/stat'
import DashboardShell from './DashboardShell.vue'
import {
  sampleNavigation,
  sampleOrders,
  sampleProducts,
  sampleRevenue,
  sampleUser,
  type DashboardNavGroup,
  type DashboardOrder,
  type DashboardUser,
} from './sample-data'

// Everything shown comes in through these props. The defaults are made-up numbers from sample-data.ts.
const props = withDefaults(
  defineProps<{
    title?: string
    brand?: string
    navigation?: readonly DashboardNavGroup[]
    /** The href of the sidebar link for this page. */
    current?: string
    user?: DashboardUser
    /** One row per month: its name, the money taken and the money given back. */
    revenue?: ReadonlyArray<{ month: string; revenue: number; refunds: number }>
    /** Best-selling products and how many of each were sold. */
    products?: ReadonlyArray<{ product: string; sales: number }>
    orders?: readonly DashboardOrder[]
    /** Passed on to the shell: see DashboardShell.vue. */
    linkAs?: string | object
    mainAs?: string
    titleAs?: string
  }>(),
  {
    title: 'Overview',
    navigation: () => sampleNavigation,
    current: '#overview',
    user: () => sampleUser,
    revenue: () => sampleRevenue,
    products: () => sampleProducts,
    orders: () => sampleOrders,
  },
)

const emit = defineEmits<{
  signOut: []
  /** The "Export" button in the top bar was pressed. */
  export: []
}>()

// Fixed locale, so server and browser write the same text.
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const cents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

const total = (key: 'revenue' | 'refunds') => props.revenue.reduce((sum, row) => sum + row[key], 0)
/** Change from the month before last to the last month, in percent. */
function change(key: 'revenue' | 'refunds'): number | undefined {
  const [before, last] = props.revenue.slice(-2)
  if (!before || !last || before[key] === 0) return undefined
  return Math.round(((last[key] - before[key]) / before[key]) * 1000) / 10
}

const paid = computed(() => props.orders.filter((order) => order.status === 'Paid'))
const averageOrder = computed(() => (paid.value.length ? paid.value.reduce((sum, order) => sum + order.total, 0) / paid.value.length : 0))

const revenueSeries = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'refunds', label: 'Refunds' },
]

const orderColumns: DataTableColumn<DashboardOrder>[] = [
  { key: 'id', label: 'Order', sortable: true },
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'date', label: 'Date', sortable: true, format: (value) => day.format(new Date(`${value}T00:00:00Z`)) },
  { key: 'total', label: 'Total', sortable: true, align: 'right', format: (value) => cents.format(Number(value)) },
]

const statusVariant = { Paid: 'outline', Pending: 'secondary', Refunded: 'destructive' } as const
</script>

<template>
  <DashboardShell
    :title="title"
    :brand="brand"
    :navigation="navigation"
    :current="current"
    :user="user"
    :link-as="linkAs"
    :main-as="mainAs"
    :title-as="titleAs"
    @sign-out="emit('signOut')"
  >
    <template #actions>
      <Button variant="outline" size="sm" @click="emit('export')">
        <Icon name="download" />
        Export
      </Button>
    </template>

    <div class="er-dashboard-stats">
      <Card>
        <CardContent>
          <Stat label="Revenue" :value="money.format(total('revenue'))" :delta="change('revenue')" delta-label="vs last month" :trend="revenue.map((row) => row.revenue)" />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Stat label="Refunds" :value="money.format(total('refunds'))" :delta="change('refunds')" delta-label="vs last month" :up-is-good="false" />
        </CardContent>
      </Card>
      <Card>
        <CardContent><Stat label="Orders" :value="orders.length" /></CardContent>
      </Card>
      <Card>
        <CardContent><Stat label="Average paid order" :value="cents.format(averageOrder)" /></CardContent>
      </Card>
    </div>

    <div class="er-dashboard-split">
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Money taken and money given back, by month.</CardDescription>
        </CardHeader>
        <CardContent>
          <Chart type="area" :data="revenue" x="month" x-label="Month" :series="revenueSeries" :format="money.format" label="Revenue and refunds by month" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top products</CardTitle>
          <CardDescription>Units sold this quarter.</CardDescription>
        </CardHeader>
        <CardContent>
          <BarList :data="products" name="product" value="sales" label="Top products by units sold" />
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Recent orders</CardTitle>
        <CardDescription>Press a column heading to sort by it.</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable :rows="orders" :columns="orderColumns" row-key="id" :page-size="5" label="Recent orders">
          <template #cell-status="{ row }">
            <Badge :variant="statusVariant[row.status]">{{ row.status }}</Badge>
          </template>
        </DataTable>
      </CardContent>
    </Card>
  </DashboardShell>
</template>

<style>
@layer components {
  /* The layout follows the room the page area has, not the window, so it is right whether the sidebar is wide, narrow or hidden. */
  .er-dashboard-main {
    container-type: inline-size;
  }

  .er-dashboard-stats,
  .er-dashboard-split {
    display: grid;
    gap: 1rem;
  }

  /* Cards in a grid must be allowed to shrink, or a wide chart or table pushes the page sideways. */
  .er-dashboard-main .er-card {
    min-width: 0;
  }

  @container (min-width: 30rem) {
    .er-dashboard-stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @container (min-width: 60rem) {
    .er-dashboard-stats {
      grid-template-columns: repeat(4, 1fr);
    }

    .er-dashboard-split {
      grid-template-columns: 2fr 1fr;
    }
  }
}
</style>
