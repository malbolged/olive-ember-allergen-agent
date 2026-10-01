import 'server-only'

import {createAnthropic} from '@ai-sdk/anthropic'
import {createGoogleGenerativeAI} from '@ai-sdk/google'
import {createGroq} from '@ai-sdk/groq'
import {createOpenAI} from '@ai-sdk/openai'
import {type LanguageModel, wrapLanguageModel} from 'ai'

import {optionalEnv, requireEnv} from '@/lib/env'

type Provider = 'google' | 'anthropic' | 'openai' | 'groq'

const PROVIDERS: Record<Provider, {keyEnv: string; defaultModel: string}> = {
  google: {keyEnv: 'GOOGLE_GENERATIVE_AI_API_KEY', defaultModel: 'gemini-3-flash-preview'},
  anthropic: {keyEnv: 'ANTHROPIC_API_KEY', defaultModel: 'claude-sonnet-5'},
  openai: {keyEnv: 'OPENAI_API_KEY', defaultModel: 'gpt-5-mini'},
  groq: {keyEnv: 'GROQ_API_KEY', defaultModel: 'openai/gpt-oss-120b'},
}

// Free-tier Gemini models intermittently return 503 "high demand" or hang without responding.
// Each attempt gets FIRST_RESPONSE_TIMEOUT_MS to start streaming; on failure the same request
// moves to the next model in the chain. LLM_MODEL (if set) is tried first.
const GEMINI_CHAIN = ['gemini-3-flash-preview', 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest']
const FIRST_RESPONSE_TIMEOUT_MS = 20_000

function withGeminiFallback(google: ReturnType<typeof createGoogleGenerativeAI>, primaryId: string) {
  const chain = [primaryId, ...GEMINI_CHAIN.filter((id) => id !== primaryId)].map((id) => google(id))
  return wrapLanguageModel({
    model: chain[0],
    middleware: {
      wrapStream: async ({params}) => {
        let lastError: unknown
        for (const candidate of chain) {
          const attempt = new AbortController()
          const timer = setTimeout(() => attempt.abort(new Error('first-response timeout')), FIRST_RESPONSE_TIMEOUT_MS)
          const signals = [attempt.signal, params.abortSignal].filter((s): s is AbortSignal => Boolean(s))
          try {
            // Resolves once the response starts; the timer only guards that first byte.
            return await candidate.doStream({...params, abortSignal: AbortSignal.any(signals)})
          } catch (error) {
            if (params.abortSignal?.aborted) throw error
            console.warn(`[model] ${candidate.modelId} unavailable, trying next model`)
            lastError = error
          } finally {
            clearTimeout(timer)
          }
        }
        throw lastError
      },
    },
  })
}

// LLM_PROVIDER wins; otherwise the first provider whose API key is set.
function resolveProvider(): Provider {
  const explicit = optionalEnv('LLM_PROVIDER')
  if (explicit) {
    if (!(explicit in PROVIDERS)) {
      throw new Error(`LLM_PROVIDER must be one of ${Object.keys(PROVIDERS).join(', ')} (got "${explicit}")`)
    }
    return explicit as Provider
  }
  const detected = (Object.keys(PROVIDERS) as Provider[]).find((p) => optionalEnv(PROVIDERS[p].keyEnv))
  if (!detected) {
    throw new Error(`No LLM API key set. Set one of: ${Object.values(PROVIDERS).map((p) => p.keyEnv).join(', ')}`)
  }
  return detected
}

export function getModel(): {model: LanguageModel; provider: Provider; modelId: string} {
  const provider = resolveProvider()
  const {keyEnv, defaultModel} = PROVIDERS[provider]
  const apiKey = requireEnv(keyEnv)
  const modelId = optionalEnv('LLM_MODEL') ?? defaultModel

  const model = {
    google: () => withGeminiFallback(createGoogleGenerativeAI({apiKey}), modelId),
    anthropic: () => createAnthropic({apiKey})(modelId),
    openai: () => createOpenAI({apiKey})(modelId),
    groq: () => createGroq({apiKey})(modelId),
  }[provider]()

  return {model, provider, modelId}
}
