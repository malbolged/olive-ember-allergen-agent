import 'server-only'

// Read at request time (never at import time) so `next build` works without credentials.
export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set (see .env.example at the repo root)`)
  return value
}

export const optionalEnv = (name: string): string | undefined => process.env[name] || undefined

export const SANITY_API_VERSION = '2026-03-03'
