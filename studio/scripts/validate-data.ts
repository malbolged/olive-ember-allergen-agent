/**
 * Offline integrity check for the seed data (no Sanity connection needed).
 *
 *   npx -y tsx studio/scripts/validate-data.ts
 *
 * Fails on broken references, duplicate keys/slugs/ids, nesting deeper than one level,
 * dishes without components, substitutions for components not in the dish, and
 * references to documents that come later in seed order. Then prints each dish's
 * derived allergen profile, which is the same roll-up the agent does with GROQ.
 */
import {allDocuments, allergens, components, dishes, equipmentList, guidance, ingredients} from './data'
import type {SanityDoc} from './data/helpers'

type Ref = {_ref: string}
type RefKey = Ref & {_key?: string}

const errors: string[] = []
const byId = new Map<string, SanityDoc>()
const position = new Map<string, number>()

allDocuments.forEach((doc, i) => {
  if (byId.has(doc._id)) errors.push(`duplicate _id ${doc._id}`)
  if (doc._id.includes('.')) errors.push(`${doc._id}: ids must not contain "." (hidden from public reads)`)
  byId.set(doc._id, doc)
  position.set(doc._id, i)
})

// Walk every value: resolve references, check _key uniqueness in arrays of objects.
function walk(value: unknown, path: string, owner: SanityDoc) {
  if (Array.isArray(value)) {
    const objects = value.filter((v) => v && typeof v === 'object')
    if (objects.length) {
      const keys = objects.map((v) => (v as {_key?: string})._key)
      if (keys.some((k) => !k)) errors.push(`${owner._id} ${path}: array item missing _key`)
      if (new Set(keys).size !== keys.length) errors.push(`${owner._id} ${path}: duplicate _key`)
    }
    value.forEach((v, i) => walk(v, `${path}[${i}]`, owner))
    return
  }
  if (!value || typeof value !== 'object') return
  const obj = value as Record<string, unknown>
  if (typeof obj._ref === 'string') {
    const target = byId.get(obj._ref)
    if (!target) errors.push(`${owner._id} ${path}: unresolved reference ${obj._ref}`)
    else if (position.get(obj._ref)! > position.get(owner._id)! && obj._ref !== owner._id)
      errors.push(`${owner._id} ${path}: references ${obj._ref}, which is seeded later`)
  }
  for (const [k, v] of Object.entries(obj)) walk(v, path ? `${path}.${k}` : k, owner)
}
for (const doc of allDocuments) walk(doc, '', doc)

// Slug uniqueness per type
const slugSeen = new Set<string>()
for (const doc of allDocuments) {
  const s = (doc.slug as {current?: string} | undefined)?.current
  if (!s) continue
  const k = `${doc._type}:${s}`
  if (slugSeen.has(k)) errors.push(`duplicate slug ${k}`)
  slugSeen.add(k)
}

// Allergen codes match ids
for (const a of allergens) if (a._id !== `allergen-${a.code}`) errors.push(`${a._id}: code/id mismatch`)

// Components: nesting max one level
const compById = new Map(components.map((c) => [c._id, c]))
for (const c of components) {
  for (const s of (c.subComponents as Ref[] | undefined) ?? []) {
    const sub = compById.get(s._ref)
    if (sub && ((sub.subComponents as Ref[] | undefined) ?? []).length)
      errors.push(`${c._id}: sub-component ${sub._id} has its own sub-components`)
  }
}

// Dishes
for (const d of dishes) {
  const parts = (d.components as {component: Ref}[] | undefined) ?? []
  if (!parts.length) errors.push(`${d._id}: no components`)
  const partIds = new Set(parts.map((p) => p.component._ref))
  for (const s of (d.substitutions as {replaces: Ref; with: Ref}[] | undefined) ?? []) {
    if (!partIds.has(s.replaces._ref)) errors.push(`${d._id}: substitution replaces ${s.replaces._ref}, which is not in the dish`)
  }
  const price = d.price as number
  if (price < 4 || price > 32) errors.push(`${d._id}: price €${price} outside €4–€32`)
}

// ---------- Derivation (mirrors the GROQ roll-up) ----------
const code = (ref: string) => ref.replace(/^allergen-/, '')
const ingById = new Map(ingredients.map((i) => [i._id, i]))
const equipById = new Map(equipmentList.map((e) => [e._id, e]))

/** Ingredients of a component including its (one-level) sub-components */
function componentIngredients(c: SanityDoc): SanityDoc[] {
  const own = ((c.ingredients as Ref[]) ?? []).map((r) => ingById.get(r._ref)!).filter(Boolean)
  const subs = ((c.subComponents as Ref[] | undefined) ?? []).flatMap((r) =>
    ((compById.get(r._ref)?.ingredients as Ref[]) ?? []).map((x) => ingById.get(x._ref)!),
  )
  return [...own, ...subs]
}
const allergensOf = (ings: SanityDoc[], field: 'allergens' | 'mayContain') =>
  new Set(ings.flatMap((i) => ((i[field] as Ref[] | undefined) ?? []).map((r) => code(r._ref))))

/** Allergens reaching component c through shared equipment it is prepared on */
function crossContact(c: SanityDoc): Set<string> {
  const out = new Set<string>()
  for (const e of (c.preparedOn as Ref[] | undefined) ?? []) {
    if (!equipById.get(e._ref)?.shared) continue
    for (const other of components) {
      if (other._id === c._id) continue
      if (!((other.preparedOn as Ref[] | undefined) ?? []).some((x) => x._ref === e._ref)) continue
      for (const a of allergensOf(componentIngredients(other), 'allergens')) out.add(a)
    }
  }
  return out
}

const VEGAN_OK = new Set(['none'])
const VEGETARIAN_OK = new Set(['none', 'dairy', 'egg', 'honey'])

type Row = {dish: string; contains: string; removableOnly: string; mayContain: string; crossContact: string; vegan: string; vegetarian: string}
const rows: Row[] = []

for (const d of dishes) {
  const parts = (d.components as {component: Ref; removable: boolean}[]).map((p) => ({
    comp: compById.get(p.component._ref)!,
    removable: p.removable,
  }))
  const all = parts.flatMap((p) => componentIngredients(p.comp))
  const fixed = parts.filter((p) => !p.removable).flatMap((p) => componentIngredients(p.comp))
  const contains = allergensOf(all, 'allergens')
  const containsFixed = allergensOf(fixed, 'allergens')
  const may = [...allergensOf(all, 'mayContain')].filter((a) => !contains.has(a))
  const cross = new Set(parts.flatMap((p) => [...crossContact(p.comp)]))
  const crossOnly = [...cross].filter((a) => !contains.has(a))
  const origins = (ings: SanityDoc[]) => new Set(ings.map((i) => i.animalOrigin as string))
  const verdict = (ok: Set<string>) => {
    if ([...origins(all)].every((o) => ok.has(o))) return 'yes'
    if ([...origins(fixed)].every((o) => ok.has(o))) return 'if removed'
    return 'no'
  }
  rows.push({
    dish: `${d.slug && (d.slug as {current: string}).current}${d.available === false ? ' (86)' : ''}`,
    contains: [...contains].sort().join(','),
    removableOnly: [...contains].filter((a) => !containsFixed.has(a)).sort().join(','),
    mayContain: may.sort().join(','),
    crossContact: crossOnly.sort().join(','),
    vegan: verdict(VEGAN_OK),
    vegetarian: verdict(VEGETARIAN_OK),
  })
}

console.log(
  `Documents: ${allDocuments.length} — allergens ${allergens.length}, ingredients ${ingredients.length}, equipment ${equipmentList.length}, components ${components.length}, dishes ${dishes.length}, guidance ${guidance.length}\n`,
)
console.table(rows)

// Orphans: ingredients/components/equipment nothing points at
const referenced = new Set<string>()
JSON.stringify(allDocuments, (k, v) => (k === '_ref' ? (referenced.add(v), v) : v))
for (const doc of [...ingredients, ...components, ...equipmentList])
  if (!referenced.has(doc._id)) console.warn(`  ⚠ unused: ${doc._id}`)

// Guidance length sanity (200–600 words, excluding the disclaimer)
for (const g of guidance) {
  const words = (g.body as string).split('\n---\n')[0].split(/\s+/).filter(Boolean).length
  if (words < 200 || words > 600) console.warn(`  ⚠ ${g._id}: ${words} words (target 200–600)`)
}

if (errors.length) {
  console.error(`\n✗ ${errors.length} error(s):\n  ${errors.join('\n  ')}`)
  process.exit(1)
}
console.log('\n✓ Data valid')
