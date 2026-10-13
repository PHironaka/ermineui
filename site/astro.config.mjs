// @ts-check
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'

const registry = fileURLToPath(new URL('../registry', import.meta.url))

// The playground is built into public/playground. A static host serves its index.html for /playground/, but the
// development server does not do that for folders in public, so it is told to here.
const playgroundIndex = {
  name: 'playground-index',
  hooks: {
    'astro:server:setup': ({ server }) => {
      server.middlewares.use((request, _response, next) => {
        const [path, query = ''] = (request.url ?? '').split('?')
        if (path === '/playground' || path === '/playground/') request.url = `/playground/index.html${query && `?${query}`}`
        next()
      })
    },
  },
}

// The site shows the components straight from ../registry, the same files the CLI copies, so it cannot drift from them.
export default defineConfig({
  integrations: [vue(), playgroundIndex],
  vite: {
    resolve: {
      alias: { '@registry': registry },
      // The registry sits outside this folder; without this its files would find the workspace's copy of Vue as well as ours.
      dedupe: ['vue'],
    },
    server: { fs: { allow: ['..'] } },
  },
})
