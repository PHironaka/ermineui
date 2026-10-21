import type { APIRoute } from 'astro'
import { blocks, type CatalogEntry } from '../../data/catalog'
import { entryMarkdown, markdownResponse } from '../../data/llms'

export function getStaticPaths() {
  return blocks.map((entry) => ({ params: { name: entry.name }, props: { entry } }))
}

export const GET: APIRoute = ({ props }) => markdownResponse(entryMarkdown((props as { entry: CatalogEntry }).entry))
