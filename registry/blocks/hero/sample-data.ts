/**
 * A stand-in picture and made-up copy so the hero has something to show. Replace this file with
 * your own, or pass your own through the props of Hero.vue.
 */

export interface HeroImage {
  src: string
  /** Leave empty when the picture is only atmosphere, which a hero background usually is. */
  alt?: string
  srcset?: string
  sizes?: string
}

export interface HeroVideo {
  /** One file, or several formats for the browser to choose from, best first. */
  src: string | Array<{ src: string; type: string }>
  /** Shown while the video loads, and instead of it when the reader has asked for less motion. */
  poster?: string
}

export interface HeroAction {
  label: string
  href: string
}

// A house among trees, drawn as SVG so the block needs no image files and no network.
const scene = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fc0da"/><stop offset=".55" stop-color="#d9e4ea"/><stop offset="1" stop-color="#eef0ec"/></linearGradient>
<linearGradient id="wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cdbb9f"/><stop offset="1" stop-color="#bba98c"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5d6f78"/><stop offset=".6" stop-color="#2e3a40"/><stop offset="1" stop-color="#46545a"/></linearGradient>
</defs>
<rect width="1600" height="1000" fill="url(#sky)"/>
<circle cx="1220" cy="190" r="70" fill="#fbf3dc" opacity=".8"/>
<path d="M0 640c180-60 340-80 520-60s360 40 560 0 360-50 520-20v440H0z" fill="#a9b8a0"/>
<rect x="640" y="250" width="760" height="560" fill="url(#wall)"/>
<rect x="640" y="250" width="760" height="560" fill="#000" opacity=".04"/>
<rect x="300" y="470" width="420" height="340" fill="#e4dccd"/>
<rect x="250" y="440" width="560" height="44" fill="#f1ece2"/>
<rect x="250" y="484" width="560" height="10" fill="#000" opacity=".12"/>
<rect x="340" y="520" width="330" height="230" fill="url(#glass)"/>
<path d="M340 520h330L340 700z" fill="#fff" opacity=".08"/>
<rect x="502" y="520" width="6" height="230" fill="#e9e3d8"/>
<rect x="1010" y="440" width="190" height="370" fill="#efe8dc"/>
<rect x="1040" y="470" width="130" height="340" fill="#3a3430"/>
<rect x="1040" y="470" width="130" height="340" fill="#e8c99a" opacity=".22"/>
<path d="M0 810h1600v190H0z" fill="#7f9270"/>
<path d="M560 1000l170-190h260L900 1000z" fill="#e7e1d6"/>
<g fill="#5f7a4f"><circle cx="120" cy="420" r="170"/><circle cx="260" cy="330" r="150"/><circle cx="40" cy="250" r="120"/><circle cx="1500" cy="360" r="150"/><circle cx="1600" cy="260" r="130"/></g>
<g fill="#7d9866" opacity=".8"><circle cx="200" cy="300" r="90"/><circle cx="1460" cy="300" r="80"/></g>
<rect x="1450" y="420" width="34" height="420" fill="#cbb9a2"/>
<rect x="180" y="460" width="30" height="380" fill="#8a7a66"/>
<g fill="#4c6440"><ellipse cx="420" cy="860" rx="190" ry="70"/><ellipse cx="1180" cy="870" rx="230" ry="80"/><ellipse cx="80" cy="900" rx="200" ry="90"/><ellipse cx="1560" cy="900" rx="160" ry="90"/></g>
</svg>`

export const sampleHeroImage: HeroImage = {
  src: `data:image/svg+xml,${encodeURIComponent(scene)}`,
  alt: '',
}

export const sampleHero = {
  eyebrow: 'Los Angeles',
  title: 'Field Studio',
  description: 'Architecture and interiors',
  primaryAction: { label: 'Schedule a conversation', href: '#' },
  secondaryAction: { label: 'See the work', href: '#' },
} satisfies { eyebrow: string; title: string; description: string; primaryAction: HeroAction; secondaryAction: HeroAction }
