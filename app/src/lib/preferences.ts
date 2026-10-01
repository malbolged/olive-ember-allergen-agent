import type {Diet, Preferences} from './safety'

const DIETS: Diet[] = ['vegan', 'vegetarian', 'pescatarian']

/** Validates untrusted preferences from a request body or query string. */
export function parsePreferences(raw: unknown): Preferences {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as {avoid?: unknown; diet?: unknown}
  const avoid = Array.isArray(obj.avoid)
    ? [...new Set(obj.avoid.filter((c): c is string => typeof c === 'string' && /^[a-z-]{2,32}$/.test(c)))]
    : []
  const diet = DIETS.includes(obj.diet as Diet) ? (obj.diet as Diet) : null
  return {avoid, diet}
}

export function preferencesFromSearchParams(params: URLSearchParams): Preferences {
  return parsePreferences({
    avoid: (params.get('avoid') ?? '').split(',').filter(Boolean),
    diet: params.get('diet'),
  })
}

export function preferencesToSearch(prefs: Preferences): string {
  const p = new URLSearchParams()
  if (prefs.avoid.length) p.set('avoid', prefs.avoid.join(','))
  if (prefs.diet) p.set('diet', prefs.diet)
  const s = p.toString()
  return s ? `?${s}` : ''
}
