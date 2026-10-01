/**
 * Seeds the Olive & Ember menu graph and guidance articles.
 * Idempotent: every document has a deterministic _id and is written with createOrReplace.
 *
 *   pnpm --filter studio seed        (reads ../.env via dotenv-cli)
 */
import {createClient} from '@sanity/client'

import {allDocuments} from './data'

const {SANITY_STUDIO_PROJECT_ID: projectId, SANITY_STUDIO_DATASET: dataset = 'production', SANITY_WRITE_TOKEN: token} =
  process.env

const missing = [
  !projectId && 'SANITY_STUDIO_PROJECT_ID',
  !token && 'SANITY_WRITE_TOKEN (project token with Editor role)',
].filter(Boolean)

if (missing.length) {
  console.error(`Missing env: ${missing.join(', ')}. Copy .env.example to .env at the repo root and fill it in.`)
  process.exit(1)
}

const client = createClient({projectId, dataset, token, apiVersion: '2026-03-03', useCdn: false})

// Chunks follow dependency order, so a later chunk only references documents already written.
const CHUNK_SIZE = 100

async function seed() {
  console.log(`Seeding ${allDocuments.length} documents into ${projectId}/${dataset}…`)
  for (let i = 0; i < allDocuments.length; i += CHUNK_SIZE) {
    const chunk = allDocuments.slice(i, i + CHUNK_SIZE)
    const tx = client.transaction()
    for (const doc of chunk) tx.createOrReplace(doc)
    await tx.commit({visibility: 'async'})
    console.log(`  ✓ ${Math.min(i + CHUNK_SIZE, allDocuments.length)}/${allDocuments.length}`)
  }

  const counts = await client.fetch<Record<string, number>>(`{
    "allergens": count(*[_type == "allergen"]),
    "ingredients": count(*[_type == "ingredient"]),
    "equipment": count(*[_type == "equipment"]),
    "components": count(*[_type == "component"]),
    "dishes": count(*[_type == "dish"]),
    "guidance": count(*[_type == "guidanceArticle"])
  }`)
  console.log('Done.', counts)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
