import 'server-only'

import {createMCPClient, type MCPClient} from '@ai-sdk/mcp'
import type {ToolSet} from 'ai'

const CACHE_TTL_MS = 5 * 60 * 1000
const initialContextCache = new Map<string, {text: string; at: number}>()

function initialContextUrl(mcpUrl: string): string {
  const url = new URL(mcpUrl)
  url.pathname = `${url.pathname.replace(/\/$/, '')}/initial-context`
  return url.toString()
}

/** Schema overview (GROQ mode) or Knowledge Base outline (KB mode), cached per endpoint. */
export async function fetchInitialContext(mcpUrl: string, token: string): Promise<string | null> {
  const cached = initialContextCache.get(mcpUrl)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.text

  try {
    const res = await fetch(initialContextUrl(mcpUrl), {headers: {Authorization: `Bearer ${token}`}})
    if (!res.ok) return cached?.text ?? null
    const text = await res.text()
    initialContextCache.set(mcpUrl, {text, at: Date.now()})
    return text
  } catch {
    return cached?.text ?? null
  }
}

export interface ContextEndpoint {
  client: MCPClient
  tools: ToolSet
  initialContext: string | null
}

/**
 * Connects to one Sanity Context MCP endpoint and prefixes its tool names, so the menu (GROQ mode)
 * and Knowledge Base endpoints can be offered to the model side by side without collisions.
 * `initial_context` is dropped because its payload is inlined into the system prompt.
 */
export async function connectContextEndpoint(mcpUrl: string, token: string, prefix: string): Promise<ContextEndpoint> {
  const [client, initialContext] = await Promise.all([
    createMCPClient({
      transport: {type: 'http', url: mcpUrl, headers: {Authorization: `Bearer ${token}`}},
    }),
    fetchInitialContext(mcpUrl, token),
  ])

  try {
    const raw = await client.tools()
    const tools: ToolSet = {}
    for (const [name, tool] of Object.entries(raw)) {
      if (name === 'initial_context') continue
      tools[`${prefix}_${name}`] = tool as ToolSet[string]
    }
    return {client, tools, initialContext}
  } catch (error) {
    await client.close().catch(() => {})
    throw error
  }
}
