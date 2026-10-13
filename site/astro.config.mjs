// @ts-check
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'

const registry = fileURLToPath(new URL('../registry', import.meta.url))

// The site shows the components straight from ../registry, the same files the CLI copies, so it cannot drift from them.
export default defineConfig({
  integrations: [vue()],
  vite: {
    resolve: {
      alias: { '@registry': registry },
      // The registry sits outside this folder; without this its files would find the workspace's copy of Vue as well as ours.
      dedupe: ['vue'],
    },
    server: { fs: { allow: ['..'] } },
  },
})
