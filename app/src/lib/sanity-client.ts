import 'server-only'

import {createClient, type SanityClient} from '@sanity/client'

import {optionalEnv, requireEnv, SANITY_API_VERSION} from './env'

let client: SanityClient | null = null

/** Read-only client for deterministic queries. Works token-less against a public dataset. */
export function getSanityClient(): SanityClient {
  if (client) return client
  client = createClient({
    projectId: requireEnv('SANITY_STUDIO_PROJECT_ID'),
    dataset: optionalEnv('SANITY_STUDIO_DATASET') ?? 'production',
    apiVersion: SANITY_API_VERSION,
    useCdn: false,
    perspective: 'published',
    token: optionalEnv('SANITY_READ_TOKEN'),
  })
  return client
}
