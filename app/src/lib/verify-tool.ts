import 'server-only'

import {tool} from 'ai'
import {z} from 'zod'

import {DISH_FIELDS} from '@/lib/queries'
import {type DishGraph, evaluateDish, type Preferences} from '@/lib/safety'
import {getSanityClient} from '@/lib/sanity-client'

const DISH_GRAPHS_QUERY = /* groq */ `*[_type == "dish" && slug.current in $slugs]{${DISH_FIELDS}}`

// The same pure function that renders the dish cards, exposed to the agent. The agent finds
// candidates through Sanity Context; this tool makes its final verdict match the card exactly.
export function verifyDishesTool(prefs: Preferences) {
  return tool({
    description:
      "Compute the deterministic safety verdict for up to 12 dishes against the guest's current allergy/diet selections. Returns verdict (safe | safe-with-changes | caution | unsafe), which avoided allergens are hit via contains / mayContain / crossContact, diet issues, and the minimal kitchen-supported fixes (removals/swaps with surcharges). Call this before stating any final verdict.",
    inputSchema: z.object({
      slugs: z.array(z.string()).min(1).max(12).describe('dish slug.current values from menu query results'),
    }),
    execute: async ({slugs}) => {
      const graphs = await getSanityClient().fetch<DishGraph[]>(DISH_GRAPHS_QUERY, {slugs})
      const found = new Map(graphs.map((g) => [g.slug, g]))
      return slugs.map((slug) => {
        const graph = found.get(slug)
        if (!graph) return {slug, error: 'No dish with this slug'}
        const {verdict, hits, dietIssues, fixes} = evaluateDish(graph, prefs)
        return {slug, name: graph.name, price: graph.price, available: graph.available !== false, verdict, hits, dietIssues, fixes}
      })
    },
  })
}
