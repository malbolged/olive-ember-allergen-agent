// Deterministic allergen/diet evaluation over the content graph returned by DISH_GRAPH_QUERY.
// Pure: no I/O, no model. The chat agent may *suggest* dishes, but the verdict shown to a guest
// always comes from here.

export type AnimalOrigin = 'none' | 'dairy' | 'egg' | 'honey' | 'meat' | 'fish' | 'shellfish'
export type Diet = 'vegan' | 'vegetarian' | 'pescatarian'

export interface GraphIngredient {
  _id: string
  name: string
  animalOrigin?: AnimalOrigin | null
  allergens?: (string | null)[] | null
  mayContain?: (string | null)[] | null
}

export interface GraphEquipment {
  _id: string
  name: string
  shared?: boolean | null
  sharedWith?:
    | {
        _id: string
        name: string
        allergens?: unknown[] | null
        subAllergens?: unknown[] | null
      }[]
    | null
}

export interface GraphSubComponent {
  _id: string
  name: string
  slug?: string | null
  ingredients?: GraphIngredient[] | null
  preparedOn?: GraphEquipment[] | null
}

export interface GraphComponent extends GraphSubComponent {
  subComponents?: GraphSubComponent[] | null
}

export interface DishGraph {
  _id: string
  name: string
  slug: string
  section?: string | null
  price?: number | null
  description?: string | null
  available?: boolean | null
  spiceLevel?: number | null
  components?: {_key: string; removable?: boolean | null; component: GraphComponent | null}[] | null
  substitutions?:
    | {
        _key: string
        surcharge?: number | null
        replaces: {_id: string; name: string} | null
        with: GraphComponent | null
      }[]
    | null
}

export interface Preferences {
  /** Allergen codes to avoid, e.g. ["gluten", "peanuts"] */
  avoid: string[]
  diet?: Diet | null
}

export type Verdict = 'safe' | 'safe-with-changes' | 'caution' | 'unsafe'

export interface CrossContact {
  allergen: string
  equipment: string
  /** Components on the same shared equipment that carry the allergen */
  from: string[]
}

export interface DietIssue {
  ingredient: string
  component: string
  animalOrigin: AnimalOrigin
}

export interface Fix {
  type: 'remove' | 'swap'
  component: string
  with?: string
  surcharge?: number
}

export interface Assessment {
  contains: string[]
  mayContain: string[]
  crossContact: CrossContact[]
  dietIssues: DietIssue[]
}

export interface Evaluation extends Assessment {
  verdict: Verdict
  /** Allergens from the guest's avoid list, split by how they reach the plate (as served) */
  hits: {contains: string[]; mayContain: string[]; crossContact: string[]}
  /** Smallest set of kitchen-supported changes that improves the verdict (empty if none needed/possible) */
  fixes: Fix[]
  /** Assessment after applying `fixes`, when there are any */
  afterFixes?: Assessment & {hits: Evaluation['hits']}
}

const DIET_EXCLUDES: Record<Diet, AnimalOrigin[]> = {
  vegan: ['dairy', 'egg', 'honey', 'meat', 'fish', 'shellfish'],
  vegetarian: ['meat', 'fish', 'shellfish'],
  pescatarian: ['meat'],
}

const MAX_FIX_SEARCH = 4096

function codes(values: unknown): string[] {
  if (!Array.isArray(values)) return []
  return (values as unknown[]).flat(Infinity).filter((v): v is string => typeof v === 'string' && v.length > 0)
}

const uniqSorted = (xs: Iterable<string>) => [...new Set(xs)].sort()

/** Assess a concrete plate: the list of components actually served. */
export function assess(served: GraphComponent[], prefs: Preferences): Assessment {
  const pieces: {piece: GraphSubComponent; parent: string}[] = []
  for (const c of served) {
    pieces.push({piece: c, parent: c.name})
    for (const sub of c.subComponents ?? []) pieces.push({piece: sub, parent: c.name})
  }
  const servedIds = new Set(pieces.map((p) => p.piece._id))

  const contains = new Set<string>()
  const mayContain = new Set<string>()
  const dietIssues: DietIssue[] = []
  const excluded = prefs.diet ? DIET_EXCLUDES[prefs.diet] : []

  for (const {piece, parent} of pieces) {
    for (const ing of piece.ingredients ?? []) {
      codes(ing.allergens).forEach((a) => contains.add(a))
      codes(ing.mayContain).forEach((a) => mayContain.add(a))
      const origin = ing.animalOrigin ?? 'none'
      if (excluded.includes(origin)) dietIssues.push({ingredient: ing.name, component: parent, animalOrigin: origin})
    }
  }

  // Cross-contact: allergens carried by *other* components prepared on the same shared equipment.
  const cross = new Map<string, CrossContact>()
  for (const {piece} of pieces) {
    for (const eq of piece.preparedOn ?? []) {
      if (eq.shared === false) continue
      for (const other of eq.sharedWith ?? []) {
        if (servedIds.has(other._id)) continue
        for (const a of new Set([...codes(other.allergens), ...codes(other.subAllergens)])) {
          if (contains.has(a)) continue
          const key = `${a}::${eq._id}`
          const entry = cross.get(key) ?? {allergen: a, equipment: eq.name, from: []}
          if (!entry.from.includes(other.name)) entry.from.push(other.name)
          cross.set(key, entry)
        }
      }
    }
  }

  return {
    contains: uniqSorted(contains),
    mayContain: uniqSorted([...mayContain].filter((a) => !contains.has(a))),
    crossContact: [...cross.values()].sort((x, y) => x.allergen.localeCompare(y.allergen)),
    dietIssues,
  }
}

function hitsFor(a: Assessment, avoid: string[]): Evaluation['hits'] {
  const set = new Set(avoid)
  return {
    contains: a.contains.filter((x) => set.has(x)),
    mayContain: a.mayContain.filter((x) => set.has(x)),
    crossContact: uniqSorted(a.crossContact.map((c) => c.allergen).filter((x) => set.has(x))),
  }
}

function level(a: Assessment, hits: Evaluation['hits']): 'safe' | 'caution' | 'unsafe' {
  if (hits.contains.length || a.dietIssues.length) return 'unsafe'
  if (hits.mayContain.length || hits.crossContact.length) return 'caution'
  return 'safe'
}

const RANK = {safe: 0, caution: 1, unsafe: 2} as const

type Option = {kind: 'keep'} | {kind: 'remove'} | {kind: 'swap'; with: GraphComponent; surcharge: number}

export function evaluateDish(graph: DishGraph, prefs: Preferences): Evaluation {
  const slots = (graph.components ?? []).filter((s) => s.component)
  const baseServed = slots.map((s) => s.component!)
  const base = assess(baseServed, prefs)
  const baseHits = hitsFor(base, prefs.avoid)
  const baseLevel = level(base, baseHits)

  const result: Evaluation = {...base, verdict: baseLevel, hits: baseHits, fixes: []}
  if (baseLevel === 'safe') return result

  // Per slot: keep it, leave it off (if removable), or swap it for any supported substitute.
  const options: Option[][] = slots.map((slot) => {
    const opts: Option[] = [{kind: 'keep'}]
    if (slot.removable) opts.push({kind: 'remove'})
    for (const sub of graph.substitutions ?? []) {
      if (sub.replaces?._id === slot.component!._id && sub.with) {
        opts.push({kind: 'swap', with: sub.with, surcharge: sub.surcharge ?? 0})
      }
    }
    return opts
  })

  const total = options.reduce((n, o) => n * o.length, 1)
  if (total <= 1 || total > MAX_FIX_SEARCH) return result

  let best: {choice: Option[]; level: 'safe' | 'caution' | 'unsafe'; changes: number; cost: number} | null = null
  const choice: Option[] = new Array(slots.length)

  const visit = (i: number) => {
    if (i === slots.length) {
      const changes = choice.filter((o) => o.kind !== 'keep').length
      if (changes === 0) return
      const served: GraphComponent[] = []
      choice.forEach((o, idx) => {
        if (o.kind === 'keep') served.push(slots[idx].component!)
        else if (o.kind === 'swap') served.push(o.with)
      })
      if (served.length === 0) return
      const a = assess(served, prefs)
      const lv = level(a, hitsFor(a, prefs.avoid))
      const cost = choice.reduce((s, o) => s + (o.kind === 'swap' ? o.surcharge : 0), 0)
      const better =
        !best ||
        RANK[lv] < RANK[best.level] ||
        (RANK[lv] === RANK[best.level] && (changes < best.changes || (changes === best.changes && cost < best.cost)))
      if (better) best = {choice: [...choice], level: lv, changes, cost}
      return
    }
    for (const o of options[i]) {
      choice[i] = o
      visit(i + 1)
    }
  }
  visit(0)

  const found = best as {choice: Option[]; level: 'safe' | 'caution' | 'unsafe'} | null
  if (!found || RANK[found.level] >= RANK[baseLevel]) return result

  result.fixes = found.choice.flatMap((o, idx): Fix[] => {
    const name = slots[idx].component!.name
    if (o.kind === 'remove') return [{type: 'remove', component: name}]
    if (o.kind === 'swap') return [{type: 'swap', component: name, with: o.with.name, surcharge: o.surcharge}]
    return []
  })
  const served = found.choice.flatMap((o, idx) =>
    o.kind === 'keep' ? [slots[idx].component!] : o.kind === 'swap' ? [o.with] : [],
  )
  const after = assess(served, prefs)
  result.afterFixes = {...after, hits: hitsFor(after, prefs.avoid)}
  result.verdict = found.level === 'safe' ? 'safe-with-changes' : 'caution'
  return result
}
