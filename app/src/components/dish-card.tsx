'use client'

import {ChevronRight, CircleCheck, CircleMinus, Repeat, ShieldAlert, TriangleAlert, Wrench} from 'lucide-react'
import useSWR from 'swr'

import {type AllergenOption, shortName} from '@/lib/allergens'
import {preferencesToSearch} from '@/lib/preferences'
import type {DishGraph, Evaluation, Fix, Preferences, Verdict} from '@/lib/safety'

interface DishResponse {
  dish: DishGraph
  evaluation: Evaluation
}

const fetcher = async (url: string): Promise<DishResponse> => {
  const res = await fetch(url)
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? 'Failed to load dish')
  return body
}

export const VERDICT: Record<Verdict, {label: string; short: string; Icon: typeof CircleCheck; pill: string}> = {
  safe: {label: 'Safe as served', short: 'Safe', Icon: CircleCheck, pill: 'bg-safe-soft text-safe'},
  'safe-with-changes': {label: 'Safe with a change', short: 'Change', Icon: Wrench, pill: 'bg-changes-soft text-changes'},
  caution: {label: 'Caution', short: 'Caution', Icon: TriangleAlert, pill: 'bg-caution-soft text-caution'},
  unsafe: {label: 'Not safe for you', short: 'Unsafe', Icon: ShieldAlert, pill: 'bg-unsafe-soft text-unsafe'},
}

interface DishProps {
  slug: string
  preferences: Preferences
  allergens: AllergenOption[]
}

function useDish({slug, preferences}: Pick<DishProps, 'slug' | 'preferences'>) {
  return useSWR(`/api/dish/${encodeURIComponent(slug)}${preferencesToSearch(preferences)}`, fetcher, {
    keepPreviousData: true,
  })
}

function useLabels(allergens: AllergenOption[]) {
  const byCode = new Map(allergens.map((a) => [a.code, a]))
  return (code: string) => {
    const a = byCode.get(code)
    return a ? shortName(a) : code
  }
}

function fixText(f: Fix) {
  if (f.type === 'remove') return `Leave off the ${f.component.toLowerCase()}`
  const price = f.surcharge ? ` · +€${f.surcharge.toFixed(2)}` : ' · free'
  return `Swap the ${f.component.toLowerCase()} for ${f.with?.toLowerCase()}${price}`
}

export function DishCard({slug, preferences, allergens}: DishProps) {
  const {data, error, isLoading} = useDish({slug, preferences})
  const label = useLabels(allergens)
  const hasSelections = preferences.avoid.length > 0 || Boolean(preferences.diet)

  if (error) {
    return (
      <div role="status" className="rounded-md border border-dashed border-line bg-surface/70 px-4 py-3 text-sm text-ink-muted">
        Couldn&apos;t load dish <code>{slug}</code>: {error.message}
      </div>
    )
  }
  if (isLoading || !data) return <div aria-busy className="h-44 animate-pulse rounded-md border border-line bg-surface/70" />

  const {dish, evaluation: e} = data
  const v = VERDICT[e.verdict]
  const hit = (c: string) => preferences.avoid.includes(c)

  return (
    <article className="flex flex-col gap-3.5 rounded-md border border-line bg-surface p-5 text-ink">
      <div className="flex items-center justify-between gap-3">
        {hasSelections ? (
          <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[12.5px] font-semibold ${v.pill}`}>
            <v.Icon aria-hidden className="size-3.5" />
            {e.fixes.length === 1 && e.verdict === 'safe-with-changes' ? 'Safe with 1 change' : v.label}
          </span>
        ) : (
          <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-muted">
            {dish.section?.replace('-', ' ')}
          </span>
        )}
        {dish.price != null && <span className="text-sm font-medium text-ink-muted">€{dish.price.toFixed(2).replace('.00', '')}</span>}
      </div>

      <div>
        <h4 className="text-xl font-medium leading-tight tracking-[-0.01em]">{dish.name}</h4>
        {dish.description && <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{dish.description}</p>}
        {dish.available === false && <p className="mt-1 text-[13px] font-medium text-caution">Currently unavailable</p>}
      </div>

      {e.fixes.length > 0 && (
        <div className="flex items-center gap-2.5 rounded bg-changes-soft px-3 py-2.5">
          {e.fixes[0].type === 'remove' ? (
            <CircleMinus aria-hidden className="size-4 shrink-0 text-changes" />
          ) : (
            <Repeat aria-hidden className="size-4 shrink-0 text-changes" />
          )}
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-changes">Ask the kitchen to</p>
            <ul className="mt-0.5 space-y-0.5 text-[13.5px] font-semibold leading-snug">
              {e.fixes.map((f) => (
                <li key={`${f.type}-${f.component}`}>{fixText(f)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <dl className="space-y-1.5 text-[12.5px]">
        <Facts term="Contains" empty="No listed allergens">
          {e.contains.map((c) => (
            <Tag key={c} hit={hit(c)}>
              {label(c)}
            </Tag>
          ))}
        </Facts>
        {e.mayContain.length > 0 && (
          <Facts term="May contain">
            {e.mayContain.map((c) => (
              <Tag key={c} hit={hit(c)}>
                {label(c)}
              </Tag>
            ))}
          </Facts>
        )}
        {e.crossContact.length > 0 && (
          <Facts term="Shared kit">
            {[
              ...e.crossContact.filter((c) => hit(c.allergen)).map((c) => (
                <Tag key={`${c.allergen}-${c.equipment}`} hit title={`Shares ${c.equipment} with ${c.from.join(', ')}`}>
                  {label(c.allergen)} <span className="opacity-70">· {c.equipment}</span>
                </Tag>
              )),
              ...(e.crossContact.some((c) => !hit(c.allergen))
                ? [
                    <Tag key="others" title={e.crossContact.filter((c) => !hit(c.allergen)).map((c) => `${label(c.allergen)} · ${c.equipment}`).join('\n')}>
                      {e.crossContact.some((c) => hit(c.allergen)) ? '+' : ''}
                      {e.crossContact.filter((c) => !hit(c.allergen)).length} other{' '}
                      {e.crossContact.filter((c) => !hit(c.allergen)).length === 1 ? 'allergen' : 'allergens'}
                    </Tag>,
                  ]
                : []),
            ]}
          </Facts>
        )}
        {e.dietIssues.length > 0 && (
          <Facts term="Diet">
            {e.dietIssues.map((d) => (
              <Tag key={`${d.component}-${d.ingredient}`} hit>
                {d.ingredient}
              </Tag>
            ))}
          </Facts>
        )}
      </dl>
    </article>
  )
}

/** One-line reason a dish is out, for the "Not for you today" list. */
function reason(e: Evaluation, prefs: Preferences, label: (c: string) => string): string {
  // When fixes exist, the verdict describes the dish after them, so explain what is still left.
  const s = e.fixes.length && e.afterFixes ? e.afterFixes : e
  const lead = s === e ? '' : 'Even with changes: '
  const names = (cs: string[]) => cs.map(label).join(', ').toLowerCase()
  if (s.dietIssues.length && prefs.diet) return `${lead}not ${prefs.diet} (${s.dietIssues[0].ingredient.toLowerCase()})`
  if (s.hits.contains.length) return `${lead}contains ${names(s.hits.contains)}`.replace(/^c/, 'C')
  if (s.hits.crossContact.length) {
    const cc = s.crossContact.find((c) => s.hits.crossContact.includes(c.allergen))
    return `${lead}${cc ? `${label(cc.allergen)} via ${cc.equipment}` : 'cross-contact risk'}`
  }
  if (s.hits.mayContain.length) return `${lead}${lead ? 's' : 'S'}upplier label: may contain ${names(s.hits.mayContain)}`
  return 'Check with staff'
}

export function DishRow({slug, preferences, allergens}: DishProps) {
  const {data, error} = useDish({slug, preferences})
  const label = useLabels(allergens)
  if (error) return null
  if (!data) return <li aria-busy className="h-12 animate-pulse" />
  const {dish, evaluation: e} = data
  const v = VERDICT[e.verdict]
  return (
    <li className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
      <span className={`w-fit shrink-0 rounded px-2 py-0.5 text-[11.5px] font-semibold sm:w-20 sm:text-center ${v.pill}`}>{v.short}</span>
      <span className="text-sm font-semibold">{dish.name}</span>
      <span className="flex-1 text-[13px] text-ink-muted">{reason(e, preferences, label)}</span>
      <ChevronRight aria-hidden className="hidden size-4 text-ink-muted sm:block" />
    </li>
  )
}

function Facts({term, empty, children}: {term: string; empty?: string; children: React.ReactNode[]}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <dt className="text-ink-muted">{term}</dt>
      <dd className="contents">{children.length ? children : <span className="text-ink-muted">{empty}</span>}</dd>
    </div>
  )
}

function Tag({hit, title, children}: {hit?: boolean; title?: string; children: React.ReactNode}) {
  return (
    <span title={title} className={`rounded px-2 py-0.5 ${hit ? 'bg-unsafe-soft font-semibold text-unsafe' : 'bg-surface-muted text-ink'}`}>
      {children}
    </span>
  )
}
