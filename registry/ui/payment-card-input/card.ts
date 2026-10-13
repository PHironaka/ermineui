/** What is typed into the card fields. The number and the dates are digits only, without spaces or slashes. */
export type PaymentCard = {
  name: string
  number: string
  /** Month then year, four digits: 0927. */
  expiry: string
  cvc: string
}

export const emptyCard = (): PaymentCard => ({ name: '', number: '', expiry: '', cvc: '' })

export type CardBrand = 'Visa' | 'Mastercard' | 'American Express' | 'Discover'

/** Which network a card number belongs to, from how it starts. Undefined until enough has been typed to tell, or when it is none of these. */
export function cardBrand(number: string): CardBrand | undefined {
  if (/^4/.test(number)) return 'Visa'
  if (/^3[47]/.test(number)) return 'American Express'
  if (/^(5[1-5]|2(2[2-9]|[3-6]|7[01]|720))/.test(number)) return 'Mastercard'
  if (/^(6011|65|64[4-9])/.test(number)) return 'Discover'
  return undefined
}

/** The checksum every real card number passes. It catches a mistyped or swapped digit; it says nothing about whether the card exists. */
export function passesLuhn(number: string): boolean {
  if (!/^\d{12,19}$/.test(number)) return false
  let sum = 0
  for (let index = 0; index < number.length; index++) {
    let digit = Number(number[number.length - 1 - index])
    if (index % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

/** Whether "MMYY" is a real month and the card is still good on `today`. A card runs to the end of its month. */
export function expiryState(expiry: string, today = new Date()): 'ok' | 'malformed' | 'expired' {
  if (!/^(0[1-9]|1[0-2])\d\d$/.test(expiry)) return 'malformed'
  const month = Number(expiry.slice(0, 2))
  const year = 2000 + Number(expiry.slice(2))
  const current = today.getFullYear() * 12 + today.getMonth() + 1
  return year * 12 + month < current ? 'expired' : 'ok'
}
