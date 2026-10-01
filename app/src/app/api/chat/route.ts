import type {MCPClient} from '@ai-sdk/mcp'
import {createClient} from '@sanity/client'
import {sanityInsightsIntegration} from '@sanity/context/ai-sdk'
import {convertToModelMessages, stepCountIs, streamText, type ToolSet, type UIMessage} from 'ai'

import {type AllergenOption, FALLBACK_ALLERGENS} from '@/lib/allergens'
import {optionalEnv, requireEnv, SANITY_API_VERSION} from '@/lib/env'
import {connectContextEndpoint} from '@/lib/mcp'
import {parsePreferences} from '@/lib/preferences'
import {ALLERGENS_QUERY} from '@/lib/queries'
import {getModel} from '@/lib/model'
import {getSanityClient} from '@/lib/sanity-client'
import {buildSystemPrompt} from '@/lib/system-prompt'
import {verifyDishesTool} from '@/lib/verify-tool'

export const maxDuration = 300

const MAX_STEPS = 20

interface ChatRequest {
  id: string
  messages: UIMessage[]
  preferences?: unknown
}

async function loadAllergens(): Promise<AllergenOption[]> {
  try {
    const list = await getSanityClient().fetch<AllergenOption[]>(ALLERGENS_QUERY)
    return list.length ? list : FALLBACK_ALLERGENS
  } catch {
    return FALLBACK_ALLERGENS
  }
}

export async function POST(req: Request) {
  const clients: MCPClient[] = []
  const closeAll = () => Promise.allSettled(clients.map((c) => c.close()))

  try {
    const {id: chatId, messages, preferences: rawPreferences}: ChatRequest = await req.json()
    const preferences = parsePreferences(rawPreferences)

    const token = requireEnv('SANITY_ORGANIZATION_TOKEN')
    const menuUrl = requireEnv('SANITY_CONTEXT_MENU_MCP_URL')
    const kbUrl = optionalEnv('SANITY_CONTEXT_KB_MCP_URL')
    const {model} = getModel()

    const [menu, kb, allergens] = await Promise.all([
      connectContextEndpoint(menuUrl, token, 'menu').then((e) => (clients.push(e.client), e)),
      kbUrl
        ? connectContextEndpoint(kbUrl, token, 'kb')
            .then((e) => (clients.push(e.client), e))
            .catch((error) => {
              // Degrade to menu-only rather than failing the conversation.
              console.error('[chat] Knowledge Base endpoint unavailable:', error)
              return null
            })
        : Promise.resolve(null),
      loadAllergens(),
    ])

    const tools: ToolSet = {...menu.tools, ...(kb?.tools ?? {}), verify_dishes: verifyDishesTool(preferences)}

    const instructions = buildSystemPrompt({
      preferences,
      allergens,
      menuContext: menu.initialContext,
      kbContext: kb?.initialContext ?? null,
      kbEnabled: Boolean(kb),
    })

    const organizationId = optionalEnv('SANITY_ORGANIZATION_ID')
    const endpointNames = [menuUrl, kbUrl]
      .filter((u): u is string => Boolean(u))
      .map((u) => new URL(u).pathname.split('/').filter(Boolean).pop()!)

    const result = streamText({
      model,
      instructions,
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(MAX_STEPS),
      ...(organizationId && {
        telemetry: {
          integrations: [
            sanityInsightsIntegration({
              client: createClient({
                apiVersion: SANITY_API_VERSION,
                token,
                context: {organizationId},
                useCdn: false,
                useProjectHostname: false,
              }),
              threadId: chatId,
              metadata: {mcpEndpoints: endpointNames, avoid: preferences.avoid.join(','), diet: preferences.diet ?? ''},
            }),
          ],
        },
      }),
      onEnd: async () => {
        await closeAll()
      },
      onError: async ({error}) => {
        console.error('[chat] stream error:', error)
        await closeAll()
      },
    })

    return result.toUIMessageStreamResponse({originalMessages: messages})
  } catch (error) {
    await closeAll()
    return Response.json(
      {error: error instanceof Error ? error.message : 'An unexpected error occurred'},
      {status: 500},
    )
  }
}
