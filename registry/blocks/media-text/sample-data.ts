/**
 * Made-up copy and a stand-in picture so the block has something to show. Replace this file with
 * your own, or pass your own through the props of MediaText.vue.
 */

export interface MediaTextImage {
  src: string
  /** Say what the picture shows. Leave it empty only when the picture is pure decoration. */
  alt: string
}

export interface MediaTextAction {
  label: string
  href: string
}

// A stand-in picture drawn as SVG, so the block needs no image files and no network.
export const sampleMediaImage: MediaTextImage = {
  src: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120"><rect width="160" height="120" fill="#e9e2d6"/><circle cx="116" cy="44" r="12" fill="#d9a35b"/><path d="M0 92 46 50l30 26 22-18 62 50v12H0z" fill="#9aa88a"/><path d="M0 120V100l40-26 38 28 26-14 56 32z" fill="#6f7f63"/></svg>`,
  )}`,
  alt: 'Hills under a low sun',
}

export const sampleMediaText = {
  eyebrow: 'Made to last',
  title: 'Fired twice, built for every day',
  body: 'Each piece is thrown by hand, then fired twice so the glaze sets hard. It goes in the dishwasher, the oven and the microwave, and it will still look the same in ten years.',
  note: 'Free delivery on orders over $50.',
  primaryAction: { label: 'Shop the collection', href: '#' },
  secondaryAction: { label: 'How it is made', href: '#' },
} satisfies {
  eyebrow: string
  title: string
  body: string
  note: string
  primaryAction: MediaTextAction
  secondaryAction: MediaTextAction
}
