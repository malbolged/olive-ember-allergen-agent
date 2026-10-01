import {getSanityClient} from '@/lib/sanity-client'

const STATS_QUERY = /* groq */ `{
  "dishes": count(*[_type == "dish"]),
  "components": count(*[_type == "component"]),
  "ingredients": count(*[_type == "ingredient"]),
  "equipment": count(*[_type == "equipment" && shared == true]),
  "allergens": count(*[_type == "allergen"])
}`

// Live counts for the welcome screen, straight from the dataset.
export async function GET() {
  try {
    return Response.json(await getSanityClient().fetch(STATS_QUERY))
  } catch {
    return Response.json(null, {status: 502})
  }
}
