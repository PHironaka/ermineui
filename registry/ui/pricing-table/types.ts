export interface PricingPlan {
  id: string
  name: string
  /** Who the plan is for, in a line. */
  description?: string
  /**
   * What it costs per month, in whole units of the currency. Give both figures to offer yearly billing:
   * `yearly` is the price of each month when a year is paid at once. Leave out for "Contact us".
   */
  price?: number | { monthly: number; yearly: number }
  /** Shown in place of a price when there is none. */
  priceLabel?: string
  /** What the plan includes, one line each. */
  features: readonly string[]
  /** The words on the button. */
  cta?: string
  /** Where the button goes. Without it the button emits `select`. */
  href?: string
  /** The plan being recommended: it is outlined and its button is filled. */
  featured?: boolean
  /** A short label beside the name, e.g. "Most popular". */
  badge?: string
}

export type PricingBilling = 'monthly' | 'yearly'
