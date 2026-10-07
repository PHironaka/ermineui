import type { IconName } from '../../ui/icon'

/**
 * Made-up numbers so the dashboard has something to show. Replace this file with your own data,
 * or pass your own through the props of Dashboard.vue and DashboardShell.vue.
 */

export interface DashboardNavItem {
  label: string
  href: string
  icon: IconName
}

export interface DashboardNavGroup {
  label: string
  items: DashboardNavItem[]
}

export interface DashboardUser {
  name: string
  email: string
  /** Address of a picture. The initials show when there is none. */
  avatar?: string
}

export interface DashboardOrder {
  id: string
  customer: string
  status: 'Paid' | 'Pending' | 'Refunded'
  date: string
  total: number
}

export const sampleNavigation: DashboardNavGroup[] = [
  {
    label: 'Shop',
    items: [
      { label: 'Overview', href: '#overview', icon: 'home' },
      { label: 'Orders', href: '#orders', icon: 'inbox' },
      { label: 'Products', href: '#products', icon: 'package' },
      { label: 'Customers', href: '#customers', icon: 'users' },
      { label: 'Reports', href: '#reports', icon: 'bar-chart' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Billing', href: '#billing', icon: 'credit-card' },
      { label: 'Settings', href: '#settings', icon: 'settings' },
    ],
  },
]

export const sampleUser: DashboardUser = { name: 'Ines Kovač', email: 'ines@example.com' }

export const sampleRevenue = [
  { month: 'Jan', revenue: 18400, refunds: 620 },
  { month: 'Feb', revenue: 19750, refunds: 540 },
  { month: 'Mar', revenue: 22300, refunds: 810 },
  { month: 'Apr', revenue: 21100, refunds: 700 },
  { month: 'May', revenue: 24900, refunds: 660 },
  { month: 'Jun', revenue: 27600, refunds: 930 },
  { month: 'Jul', revenue: 26200, refunds: 720 },
  { month: 'Aug', revenue: 29800, refunds: 880 },
  { month: 'Sep', revenue: 31450, refunds: 760 },
]

export const sampleProducts = [
  { product: 'Linen throw', sales: 412 },
  { product: 'Oak side table', sales: 287 },
  { product: 'Ceramic planter', sales: 264 },
  { product: 'Wool rug, 2 m', sales: 151 },
  { product: 'Brass wall hook', sales: 98 },
]

export const sampleOrders: DashboardOrder[] = [
  { id: '#4821', customer: 'Tomás Ortega', status: 'Paid', date: '2026-09-28', total: 184.5 },
  { id: '#4820', customer: 'Priya Nair', status: 'Pending', date: '2026-09-28', total: 62 },
  { id: '#4819', customer: 'Jonas Weber', status: 'Paid', date: '2026-09-27', total: 310.25 },
  { id: '#4818', customer: 'Aiko Tanaka', status: 'Refunded', date: '2026-09-27', total: 48 },
  { id: '#4817', customer: 'Lucía Fernández', status: 'Paid', date: '2026-09-26', total: 129.9 },
  { id: '#4816', customer: 'Omar Haddad', status: 'Paid', date: '2026-09-26', total: 75.4 },
  { id: '#4815', customer: 'Hanna Lindqvist', status: 'Pending', date: '2026-09-25', total: 219 },
  { id: '#4814', customer: 'Kwame Mensah', status: 'Paid', date: '2026-09-25', total: 94.75 },
]
