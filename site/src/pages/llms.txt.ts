import type { APIRoute } from 'astro'
import { llmsIndex } from '../data/llms'

export const GET: APIRoute = ({ site }) => new Response(llmsIndex(site), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
