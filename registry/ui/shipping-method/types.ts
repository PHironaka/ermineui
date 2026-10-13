export interface ShippingMethodOption {
  id: string
  title: string
  /** When it arrives, e.g. "3 to 5 working days" or "Tomorrow before noon". */
  eta?: string
  /** What it costs, in whole units of the currency. 0 is written as "Free". */
  price: number
  /** Cannot be chosen, e.g. not offered at this address. Say why in `eta`. */
  disabled?: boolean
}
