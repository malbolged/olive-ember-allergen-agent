import {type AllergenOption, FALLBACK_ALLERGENS} from '@/lib/allergens'
import {ALLERGENS_QUERY} from '@/lib/queries'
import {getSanityClient} from '@/lib/sanity-client'

// The picker reads allergen codes from the dataset so UI, agent and verdicts share one vocabulary.
export async function GET() {
  try {
    const list = await getSanityClient().fetch<AllergenOption[]>(ALLERGENS_QUERY)
    return Response.json({allergens: list.length ? list : FALLBACK_ALLERGENS, source: list.length ? 'sanity' : 'fallback'})
  } catch {
    return Response.json({allergens: FALLBACK_ALLERGENS, source: 'fallback'})
  }
}
