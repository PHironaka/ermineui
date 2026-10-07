import { reactive } from 'vue'

/**
 * Each icon is one SVG path on a 24 by 24 grid, drawn as a 2px line with round ends.
 * To add one, draw it on that grid and paste the path's `d` here, or call registerIcons()
 * from your own code so this file stays as it was copied.
 */

const circle = 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18Z'
const frame = 'M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z'

export const icons = {
  // Actions
  check: 'M5 12.5l4.5 4.5L19 7.5',
  x: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  search: 'M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14ZM20 20l-4-4',
  edit: 'M4 20l1-4L16 5l3 3L8 19l-4 1ZM14 7l3 3',
  copy: 'M10 9h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1ZM15 5V4.5a.5.5 0 0 0-.5-.5H5a1 1 0 0 0-1 1v9.5a.5.5 0 0 0 .5.5H5',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5',
  download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  upload: 'M12 16V5M7 9l5-5 5 5M5 20h14',
  refresh: 'M20 5v5h-5M4 19v-5h5M19.4 10A8 8 0 0 0 5.2 8M4.6 14a8 8 0 0 0 14.2 2',
  filter: 'M4 5h16l-6 8v6l-4-2v-4Z',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  'external-link': 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  'log-out': 'M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M15 8l4 4-4 4M19 12H9',

  // Arrows
  'chevron-down': 'M6 9l6 6 6-6',
  'chevron-up': 'M6 15l6-6 6 6',
  'chevron-left': 'M15 6l-6 6 6 6',
  'chevron-right': 'M9 6l6 6-6 6',
  'arrow-up': 'M12 19V5M6 11l6-6 6 6',
  'arrow-down': 'M12 5v14M6 13l6 6 6-6',
  'arrow-left': 'M19 12H5M11 6l-6 6 6 6',
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  'arrow-up-right': 'M7 17L17 7M8 7h9v9',
  'trending-up': 'M3 17l6-6 4 4 8-8M15 7h6v6',
  'trending-down': 'M3 7l6 6 4-4 8 8M15 17h6v-6',

  // Navigation and layout
  menu: 'M4 6h16M4 12h16M4 18h16',
  'more-horizontal': 'M5 11a1 1 0 1 0 0 2a1 1 0 0 0 0-2ZM12 11a1 1 0 1 0 0 2a1 1 0 0 0 0-2ZM19 11a1 1 0 1 0 0 2a1 1 0 0 0 0-2Z',
  'more-vertical': 'M12 4a1 1 0 1 0 0 2a1 1 0 0 0 0-2ZM12 11a1 1 0 1 0 0 2a1 1 0 0 0 0-2ZM12 18a1 1 0 1 0 0 2a1 1 0 0 0 0-2Z',
  home: 'M3 11l9-7 9 7v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z',
  'panel-left': `${frame}M9 4v16`,
  grid: 'M4 4h6v6H4ZM14 4h6v6h-6ZM4 14h6v6H4ZM14 14h6v6h-6Z',
  list: 'M9 6h11M9 12h11M9 18h11M4.5 6v.01M4.5 12v.01M4.5 18v.01',
  layers: 'M12 3L3 8l9 5 9-5-9-5ZM3 13l9 5 9-5',
  settings: 'M4 7h9M17 7h3M15 5a2 2 0 1 0 0 4a2 2 0 0 0 0-4ZM4 17h3M11 17h9M9 15a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z',

  // People and messages
  user: 'M12 4a4 4 0 1 0 0 8a4 4 0 0 0 0-8ZM4 20c0-3.3 3.6-5 8-5s8 1.7 8 5',
  users: 'M9 5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7ZM2.5 20c0-3 2.9-4.5 6.5-4.5s6.5 1.5 6.5 4.5M16 5.2a3.5 3.5 0 0 1 0 6.6M18 15.8c2.1.5 3.5 1.9 3.5 4.2',
  bell: 'M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15ZM10 21a2 2 0 0 0 4 0',
  mail: 'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1ZM3.5 7.5L12 13l8.5-5.5',
  inbox: 'M3 13l3-8h12l3 8v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1ZM3 13h5l1 3h6l1-3h5',

  // Things
  calendar: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM16 3v4M8 3v4M3 10h18',
  clock: `${circle}M12 7v5l3 2`,
  file: 'M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM14 3v5h5',
  folder: 'M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z',
  image: `${frame}M8.5 9v.01M21 15l-4.5-4.5L7 20`,
  package: 'M12 3l8 4.5v9L12 21l-8-4.5v-9ZM4 7.5l8 4.5 8-4.5M12 12v9',
  'credit-card': 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM3 10h18M7 15h3',
  'bar-chart': 'M5 20v-9M12 20V4M19 20v-6M3 20h18',
  globe: `${circle}M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18`,
  lock: 'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1ZM8 11V8a4 4 0 0 1 8 0v3',
  shield: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6Z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z',
  'eye-off': 'M4 4l16 16M10 6.2A9.5 9.5 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.6 3.3M6.5 7.5C4 9.2 2.5 12 2.5 12s3.5 6 9.5 6c1.5 0 2.9-.4 4.1-1M9.9 9.9a3 3 0 0 0 4.2 4.2',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9Z',
  heart: 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z',
  sun: 'M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8ZM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z',

  // Status
  info: `${circle}M12 11v5M12 8v.01`,
  'help-circle': `${circle}M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7M12 17v.01`,
  'circle-check': `${circle}M8 12.5l3 3 5-6`,
  'circle-x': `${circle}M9 9l6 6M15 9l-6 6`,
  'alert-triangle': 'M12 4l9.5 16h-19ZM12 10v4M12 17v.01',
} as const

/** A built-in name, or any name you registered yourself. */
export type IconName = keyof typeof icons | (string & {})

const added = reactive<Record<string, string>>({})

/** Add your own icons, or replace built-in ones: registerIcons({ rocket: 'M5 19l...' }). Call it once, when the app starts. */
export function registerIcons(paths: Record<string, string>) {
  Object.assign(added, paths)
}

/** The path for a name, or undefined when there is no icon called that. */
export function iconPath(name: string): string | undefined {
  return added[name] ?? (icons as Record<string, string>)[name]
}

/** Every name that can be used right now, built-in and registered. */
export function iconNames(): string[] {
  return [...new Set([...Object.keys(icons), ...Object.keys(added)])]
}
