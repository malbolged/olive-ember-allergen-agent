import {preferencesFromSearchParams} from '@/lib/preferences'
import {DISH_GRAPH_QUERY} from '@/lib/queries'
import {type DishGraph, evaluateDish} from '@/lib/safety'
import {getSanityClient} from '@/lib/sanity-client'

// Deterministic verdict for one dish: the content graph + a pure function. No model involved.
export async function GET(req: Request, ctx: {params: Promise<{slug: string}>}) {
  const {slug} = await ctx.params
  const prefs = preferencesFromSearchParams(new URL(req.url).searchParams)

  try {
    const graph = await getSanityClient().fetch<DishGraph | null>(DISH_GRAPH_QUERY, {slug})
    if (!graph) return Response.json({error: `No dish with slug "${slug}"`}, {status: 404})

    return Response.json({dish: graph, evaluation: evaluateDish(graph, prefs), preferences: prefs})
  } catch (error) {
    return Response.json(
      {error: error instanceof Error ? error.message : 'Failed to load dish'},
      {status: 500},
    )
  }
}
