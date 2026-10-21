# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Ermine UI: copy-in Vue 3 components styled with plain CSS variables, in the spirit of shadcn/ui. Users run the `ermineui` CLI, which copies component source into their project. The only runtime dependency is Vue 3.5+. No Tailwind, no CSS-in-JS.

The project was called **Sable** until 7 October 2026 and everything was renamed together (the CSS prefix went from `sb-` to `er-`). The local folder is still `sable-ui` and the GitHub repo is `sableui`. New code uses `ermine`/`er-` everywhere.

## Commands

```sh
npm run dev             # playground with every component, http://localhost:5173
npm run build           # build the playground
npm test                # typecheck → check:registry → test:unit → test:e2e
npm run typecheck       # vue-tsc, strict (covers registry/ and playground/src)
npm run registry        # regenerate cli/registry.json from registry/
npm run check:registry  # regenerate, then install each component/block alone into a temp folder and verify imports resolve
npm run test:unit       # node --test on tests/unit/*.test.ts (Node runs the .ts directly)
npm run test:e2e        # Playwright against the built playground
npm run ermine -- add button --cwd /some/app   # run the local CLI
```

- One unit test file: `node --test tests/unit/dates.test.ts`
- Part of the e2e suite: `npx playwright test menus --project=webkit` (projects: `chromium`, `firefox`, `webkit`, `phone`; `phone` only runs files matching `/phone/`)
- First-time browser install: `npx playwright install chromium firefox webkit`
- Website (`site/`, Astro): `cd site && npm run dev`. Its `build` first builds the playground into `site/public/playground`. Netlify deploys `site/` (see `netlify.toml`).

## Architecture

```
registry/styles/ermine.css   theme tokens (CSS variables), base styles, shared floating styles
registry/lib/*.ts            behavior helpers, copied into user projects (primitive, floating, layer, collection, scroll-lock, context)
registry/ui/<name>/          one folder per component, with an index.ts
registry/blocks/<name>/      page sections built from components; import them as ../../ui/<name>
cli/bin/ermine.mjs           the CLI (no dependencies); reads only cli/registry.json
scripts/build-registry.mjs   packs registry/ into cli/registry.json
playground/                  Vite app rendering every component, which the e2e tests drive
site/                        Astro website; imports cli/registry.json, README.md and playground/src/App.vue as raw data
```

**The registry pipeline.** `registry/` is the source of truth. `cli/registry.json` is generated from it and committed, so run `npm run registry` after any change under `registry/`. Otherwise the CLI and the website serve stale code. There is no dependency manifest: `build-registry.mjs` works out dependencies from import statements with regexes. That means imports must follow these exact shapes:
- helpers: `from '../../lib/<helper>'` (the CLI rewrites this path for each user project)
- other components: `from '../<name>'` or `from '../<name>/<file>'`
- within lib: `from './<helper>'`

The description `ermine list` shows comes from the first `/** ... */` comment in each component's `index.ts`.

**Constraints enforced by `check:registry`:** every component and block must install cleanly on its own, no two components or blocks may share a `.vue` file name (Nuxt auto-imports by file name), and no component may share a name with a block.

**Styling conventions:** component styles go in the SFC's `<style>` block, wrapped in `@layer components { ... }`, with classes prefixed `er-`. Variants and state are data attributes (`data-variant`, `data-size`, `data-state`, `data-side`), not modifier classes. Colours, radii, shadows and durations are `--er-*` variables in `ermine.css`, which use `light-dark()`/`oklch()`. Dark mode follows the OS or a `dark`/`light` class or `data-theme` on any ancestor. The user's theme file is never overwritten by the CLI. When a component needs new variables, `add` appends only the missing ones, so new tokens must go in `ermine.css`.

**Adding a component:** create `registry/ui/<name>/` with the `.vue` files and an `index.ts` (starting with the description comment), run `npm run registry`, then add a demo to the playground (`playground/src/App.vue`, or the files in `playground/src/demos/`).

## Testing notes

- E2e tests run against a **production build** of the playground (`vite preview` on port 4173) with `reducedMotion: 'reduce'`. They query by role and accessible name, so a missing label fails a test. Any console error on the page also fails it. Workers are capped at 2 to avoid memory swapping.
- `accessibility.spec.ts` (axe, light and dark) and `screen-reader.spec.ts` (simulated screen reader via `@guidepup/virtual-screen-reader`) run in Chromium only, as do the clipboard tests.
- `tests/unit` covers the pure logic (dates, chart scales, colour, validation, floating positioning, sound, QR, the CLI run in throwaway folders). Tests import straight from `registry/ui/**`.
- The README sections "What has been checked" and "Known limits" record verified test counts and gaps. Update them when that changes; the website renders the README.
