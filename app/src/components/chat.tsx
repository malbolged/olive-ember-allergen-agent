'use client'

import {useChat} from '@ai-sdk/react'
import {DefaultChatTransport, type UIMessage} from 'ai'
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Flame,
  Info,
  Layers,
  Nut,
  SlidersHorizontal,
  Square,
  TriangleAlert,
  Utensils,
  Wheat,
  X,
} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'
import useSWR from 'swr'

import {AllergyPicker} from './allergy-picker'
import {Message} from './message'
import {type AllergenOption, DIETS, FALLBACK_ALLERGENS, shortName} from '@/lib/allergens'
import {parsePreferences} from '@/lib/preferences'
import type {Preferences} from '@/lib/safety'

const STARTERS = [
  {Icon: Wheat, q: "I'm coeliac. Which mains can I have?", hint: 'Follows gluten through sub-recipes and shared fryers'},
  {Icon: Nut, q: 'Nut allergy and vegetarian, under €20?', hint: 'Combines allergens, diet and price in one pass'},
  {Icon: Flame, q: 'Are the fries safe if I avoid gluten?', hint: 'The classic shared-fryer trap'},
  {Icon: BookOpen, q: 'What happens if I have a reaction?', hint: "Answered from the kitchen's own procedures"},
]

const FOLLOW_UPS = ['What does “may contain” mean?', 'Which desserts are safe for me?', 'What happens if I react?']

const PREFS_KEY = 'oe:preferences'

type Stats = {dishes: number; components: number; ingredients: number; equipment: number; allergens: number}
const json = (u: string) => fetch(u).then((r) => (r.ok ? r.json() : null))

function isWaitingForText(messages: UIMessage[]): boolean {
  const last = messages[messages.length - 1]
  if (!last || last.role !== 'assistant') return true
  return !last.parts.some((p) => p.type === 'text' && p.text.trim().length > 0)
}

export function Chat() {
  const [input, setInput] = useState('')
  const [preferences, setPreferences] = useState<Preferences>({avoid: [], diet: null})
  const [sheetOpen, setSheetOpen] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // The transport reads the latest selections on every request.
  const prefsRef = useRef(preferences)
  prefsRef.current = preferences

  const {data} = useSWR<{allergens: AllergenOption[]}>('/api/allergens', json)
  const allergens = data?.allergens ?? FALLBACK_ALLERGENS

  // Remember selections per browser (a convenience only; the server never relies on it).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY)
      if (saved) setPreferences(JSON.parse(saved))
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(preferences))
    } catch {}
  }, [preferences])

  const [transport] = useState(
    () => new DefaultChatTransport({api: '/api/chat', body: () => ({preferences: prefsRef.current})}),
  )
  const {messages, sendMessage, status, error, regenerate, stop} = useChat({transport})

  useEffect(() => {
    endRef.current?.scrollIntoView({behavior: 'smooth', block: 'end'})
  }, [messages])

  // Shareable demo links: /?avoid=gluten,peanuts&diet=vegetarian&q=... preselect needs and ask once.
  // Deferred and cancellable so React's dev double-mount doesn't fire it on the discarded instance.
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      if (params.has('avoid') || params.has('diet')) {
        const next = parsePreferences({avoid: (params.get('avoid') ?? '').split(',').filter(Boolean), diet: params.get('diet')})
        setPreferences(next)
        prefsRef.current = next
      }
      const q = params.get('q')?.trim()
      if (q) sendMessage({text: q.slice(0, 500)})
    }, 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per mount
  }, [])

  const busy = status === 'submitted' || status === 'streaming'
  const send = (text: string) => {
    if (!text.trim() || busy) return
    sendMessage({text})
    setInput('')
  }

  const selected = [
    ...preferences.avoid.map((c) => {
      const a = allergens.find((x) => x.code === c)
      return a ? shortName(a) : c
    }),
    ...(preferences.diet ? [DIETS.find((d) => d.value === preferences.diet)?.label ?? preferences.diet] : []),
  ]

  return (
    <div className="grid h-dvh grid-rows-[auto_1fr] lg:grid-cols-[340px_1fr] lg:grid-rows-1">
      {/* Desktop rail */}
      <aside className="hidden min-h-0 flex-col gap-7 overflow-y-auto bg-rail px-6 py-7 text-rail-text lg:flex">
        <Brand />
        <AllergyPicker allergens={allergens} value={preferences} onChange={setPreferences} />
        <HowItWorks />
        <p className="mt-auto flex gap-2 text-[11.5px] leading-relaxed text-rail-text-muted">
          <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          Fictional demo restaurant for the DEV Sanity Challenge. Not medical advice — always tell your server.
        </p>
      </aside>

      {/* Mobile header + selections sheet */}
      <header className="relative z-20 bg-rail px-4 pb-3.5 pt-4 text-rail-text lg:hidden">
        <div className="flex items-center justify-between">
          <p className="text-[21px] font-medium tracking-[-0.01em]">Olive &amp; Ember</p>
          <p className="flex items-center gap-1.5 text-[11.5px] text-rail-text-muted">
            <span aria-hidden className="size-1.5 rounded-full bg-[#6fbf8a]" />
            Menu + guidance live
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen((o) => !o)}
          aria-expanded={sheetOpen}
          aria-controls="needs-sheet"
          className="mt-3 flex w-full items-center gap-2 rounded bg-rail-muted px-3 py-2.5 text-left text-[12.5px]"
        >
          <SlidersHorizontal aria-hidden className="size-4 shrink-0" />
          <span className="flex-1 truncate">{selected.length ? `Avoiding ${selected.join(', ')}` : 'Tell me what you must avoid'}</span>
          <span className="font-semibold text-[#9db4ec]">{sheetOpen ? 'Done' : 'Edit'}</span>
        </button>
        {sheetOpen && (
          <div id="needs-sheet" className="absolute inset-x-0 top-full border-t border-rail-line bg-rail px-4 pb-5 pt-4 shadow-2xl">
            <AllergyPicker allergens={allergens} value={preferences} onChange={setPreferences} />
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded bg-rail-text py-2.5 text-sm font-semibold text-rail"
            >
              <X aria-hidden className="size-4" /> Close
            </button>
          </div>
        )}
      </header>

      <main className="flex min-h-0 flex-col">
        {/* Desktop top bar */}
        <div className="hidden h-16 shrink-0 items-center justify-between border-b border-white/60 bg-white/15 px-10 lg:flex">
          <div className="flex items-center gap-2.5 text-[13px]">
            {selected.length ? (
              <>
                <span className="text-ink-muted">Checking for</span>
                {selected.map((s) => (
                  <span key={s} className="rounded bg-surface-muted px-2.5 py-1 text-[12.5px] font-medium">
                    {s}
                  </span>
                ))}
              </>
            ) : (
              <span className="text-ink-muted">Pick what you must avoid on the left — or just ask.</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-[12.5px]">
            <Source name="Menu graph" mode="GROQ" />
            <Source name="Kitchen guidance" mode="Knowledge Base" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-10 lg:py-8" aria-live="polite">
          {messages.length === 0 ? (
            <Welcome onPick={send} />
          ) : (
            <div className="mx-auto max-w-[760px] space-y-6">
              {messages.map((m) => (
                <Message key={m.id} message={m} preferences={preferences} allergens={allergens} />
              ))}
              {busy && isWaitingForText(messages) && (
                <p className="animate-pulse text-sm text-ink-muted" role="status">
                  Checking the menu graph…
                </p>
              )}
              {error && (
                <div role="alert" className="rounded-md bg-unsafe-soft px-4 py-3 text-sm text-unsafe">
                  {error.message || 'Something went wrong.'}{' '}
                  <button type="button" onClick={() => regenerate()} className="font-semibold underline">
                    Try again
                  </button>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="shrink-0 border-t border-white/60 bg-white/20 px-3 pb-4 pt-3 backdrop-blur-md lg:px-10 lg:pb-5"
        >
          <div className="mx-auto max-w-[760px] space-y-2.5">
            {messages.length > 0 && !busy && (
              <div className="flex gap-2 overflow-x-auto">
                {FOLLOW_UPS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="shrink-0 rounded border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-muted hover:border-ink/40 hover:text-ink"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 rounded-md border border-line bg-surface py-1.5 pl-4 pr-1.5 shadow-[0_4px_16px_rgb(20_20_20/0.06)] focus-within:border-accent">
              <label htmlFor="chat-input" className="sr-only">
                Ask about the menu
              </label>
              <input
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about any dish, allergy or diet…"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent py-2 text-[14.5px] placeholder:text-ink-muted/70 focus:outline-none"
              />
              {busy ? (
                <button type="button" onClick={() => stop()} className="flex items-center gap-1.5 rounded bg-ink px-4 py-2.5 text-sm font-semibold text-white">
                  <Square aria-hidden className="size-3.5" /> Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex items-center gap-1.5 rounded bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-40"
                >
                  Ask <ArrowUp aria-hidden className="size-4" />
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}

function Brand() {
  return (
    <div>
      <p className="text-[28px] font-medium leading-none tracking-[-0.02em]">Olive &amp; Ember</p>
      <p className="mt-2 text-[13px] text-rail-text-muted">Allergy concierge · Dublin</p>
    </div>
  )
}

function Source({name, mode}: {name: string; mode: string}) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden className="size-[7px] rounded-full bg-safe" />
      <span className="font-medium">{name}</span>
      <span className="text-ink-muted">{mode}</span>
    </span>
  )
}

const GRAPH = [
  {Icon: Utensils, title: 'Dish', sub: 'what you order'},
  {Icon: Layers, title: 'Components', sub: 'sauces, breads, sub-recipes'},
  {Icon: Wheat, title: 'Ingredients', sub: 'supplier “may contain” labels'},
  {Icon: TriangleAlert, title: '14 EU allergens', sub: 'what you ticked above'},
]

function HowItWorks() {
  return (
    <section className="rounded-md bg-rail-muted p-4">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-rail-text-muted">How verdicts are made</h2>
      <ol className="mt-3 space-y-1">
        {GRAPH.map(({Icon, title, sub}, i) => (
          <li key={title}>
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded border border-rail-line">
                <Icon aria-hidden className="size-[15px]" />
              </span>
              <span>
                <span className="block text-[13px] font-semibold">{title}</span>
                <span className="block text-[11.5px] text-rail-text-muted">{sub}</span>
              </span>
            </div>
            {i < GRAPH.length - 1 && <ArrowDown aria-hidden className="ml-[9px] mt-1 size-2.5 text-rail-text-muted" />}
          </li>
        ))}
      </ol>
      <p className="mt-3 flex items-center gap-2.5 border-t border-rail-line pt-2.5 text-[12px]">
        <Flame aria-hidden className="size-[15px] text-[#9db4ec]" />+ shared fryers &amp; grills → cross-contact
      </p>
      <p className="mt-2 text-[11.5px] leading-relaxed text-rail-text-muted">
        Verdicts are computed from this graph in Sanity — not by the AI.
      </p>
    </section>
  )
}

function Welcome({onPick}: {onPick: (q: string) => void}) {
  const {data: stats} = useSWR<Stats | null>('/api/stats', json)
  const figures: [number | undefined, string][] = [
    [stats?.dishes, 'dishes'],
    [stats?.components, 'sub-recipes'],
    [stats?.ingredients, 'ingredients'],
    [stats?.equipment, 'shared stations'],
    [stats?.allergens, 'EU allergens'],
  ]
  return (
    <div className="mx-auto flex min-h-full max-w-[760px] flex-col justify-center gap-7 py-4">
      <div className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-accent">Allergy concierge</p>
        <h1 className="text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-[52px]">What can I safely eat tonight?</h1>
        <p className="max-w-[680px] text-[16.5px] leading-relaxed text-ink-muted">
          I check every dish down to its sauces, sub-recipes, supplier labels and the fryer it shares — then tell you
          exactly what the kitchen can change to make it safe.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {STARTERS.map(({Icon, q, hint}) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="flex gap-3.5 rounded-md border border-line bg-surface p-[18px] text-left transition-colors hover:border-ink/40"
          >
            <Icon aria-hidden className="mt-0.5 size-[18px] shrink-0" />
            <span>
              <span className="block text-[14.5px] font-semibold">{q}</span>
              <span className="mt-1 block text-[12.5px] text-ink-muted">{hint}</span>
            </span>
          </button>
        ))}
      </div>

      {stats && (
        <div className="flex flex-wrap items-end gap-x-7 gap-y-3 border-t border-ink/15 pt-[18px]">
          {figures.map(([n, label]) => (
            <div key={label}>
              <p className="text-[26px] font-medium leading-none">{n}</p>
              <p className="mt-1 text-xs text-ink-muted">{label}</p>
            </div>
          ))}
          <p className="flex items-center gap-1.5 text-xs font-semibold text-accent">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            Live from Sanity
          </p>
        </div>
      )}
    </div>
  )
}
