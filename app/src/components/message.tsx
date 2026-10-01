'use client'

import {getToolName, isTextUIPart, isToolUIPart, type UIMessage} from 'ai'
import {BookOpen, Database, LoaderCircle, ShieldCheck, TableProperties} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

import type {AllergenOption} from '@/lib/allergens'
import type {Preferences} from '@/lib/safety'

import {DishCard, DishRow} from './dish-card'

type Segment = {type: 'markdown'; text: string} | {type: 'dish' | 'dish-row'; slug: string}
type Block = {type: 'markdown'; text: string} | {type: 'cards'; slugs: string[]} | {type: 'rows'; slugs: string[]}

// ::dish{slug="..."} renders a full card; ::dish-row{slug="..."} a one-line row. Single colon = inline form.
const DIRECTIVE = /:{1,2}(dish-row|dish)\{\s*slug\s*=\s*"([^"]+)"\s*\}/g
// A directive still being streamed; hidden until it completes.
const PARTIAL_DIRECTIVE = /:{1,2}(?:d(?:i(?:s(?:h(?:-(?:r(?:o(?:w)?)?)?)?(?:\{[^}]*)?)?)?)?)?$/

export function splitDirectives(text: string): Segment[] {
  const segments: Segment[] = []
  let last = 0
  for (const m of text.matchAll(DIRECTIVE)) {
    if (m.index! > last) segments.push({type: 'markdown', text: text.slice(last, m.index)})
    segments.push({type: m[1] as 'dish' | 'dish-row', slug: m[2]})
    last = m.index! + m[0].length
  }
  const tail = text.slice(last).replace(PARTIAL_DIRECTIVE, '')
  if (tail.trim()) segments.push({type: 'markdown', text: tail})
  return segments
}

/** Consecutive cards become one grid and consecutive rows one list; whitespace between them is dropped. */
function toBlocks(segments: Segment[]): Block[] {
  const blocks: Block[] = []
  for (const s of segments) {
    if (s.type === 'markdown') {
      if (!s.text.trim()) continue
      blocks.push({type: 'markdown', text: s.text})
      continue
    }
    const kind = s.type === 'dish' ? 'cards' : 'rows'
    const prev = blocks.at(-1)
    if (prev && prev.type === kind) {
      if (!prev.slugs.includes(s.slug)) prev.slugs.push(s.slug)
    } else blocks.push({type: kind, slugs: [s.slug]})
  }
  return blocks
}

interface Step {
  key: string
  Icon: typeof Database
  title: string
  detail: string
  done: boolean
}

/** Summarises the agent's real tool calls so guests (and judges) see what it looked up. */
function traceSteps(message: UIMessage): Step[] {
  const tools = message.parts.filter(isToolUIPart)
  const steps: Step[] = []
  const of = (pred: (name: string) => boolean) => tools.filter((p) => pred(getToolName(p)))
  const done = (ps: typeof tools) => ps.every((p) => p.state === 'output-available' || p.state === 'output-error')

  const groq = of((n) => n === 'menu_groq_query')
  if (groq.length) {
    steps.push({key: 'groq', Icon: Database, title: 'Queried menu graph', detail: `${groq.length} GROQ ${groq.length === 1 ? 'query' : 'queries'}`, done: done(groq)})
  }
  const schema = of((n) => n.startsWith('menu_') && n !== 'menu_groq_query')
  if (schema.length) steps.push({key: 'schema', Icon: TableProperties, title: 'Read menu schema', detail: 'schema_explorer', done: done(schema)})

  const kb = of((n) => n.startsWith('kb_'))
  if (kb.length) {
    const paths = kb.flatMap((p) => ((p.input as {paths?: string[]} | undefined)?.paths ?? []).map((x) => x.split('/').pop()!))
    steps.push({key: 'kb', Icon: BookOpen, title: 'Read kitchen guidance', detail: [...new Set(paths)].slice(0, 2).join(', ') || 'Knowledge Base', done: done(kb)})
  }
  const verify = of((n) => n === 'verify_dishes')
  if (verify.length) {
    const n = new Set(verify.flatMap((p) => (p.input as {slugs?: string[]} | undefined)?.slugs ?? [])).size
    steps.push({key: 'verify', Icon: ShieldCheck, title: n ? `Verified ${n} ${n === 1 ? 'dish' : 'dishes'}` : 'Verifying dishes', detail: 'verify_dishes', done: done(verify)})
  }
  return steps
}

interface MessageProps {
  message: UIMessage
  preferences: Preferences
  allergens: AllergenOption[]
}

export function Message({message, preferences, allergens}: MessageProps) {
  const parts = message.parts ?? []

  if (message.role === 'user') {
    const text = parts.filter(isTextUIPart).map((p) => p.text).join('\n')
    return (
      <div className="flex justify-end">
        <p className="max-w-[80%] whitespace-pre-wrap rounded-md rounded-br-sm bg-ink px-4 py-3 text-[14.5px] leading-snug text-white">{text}</p>
      </div>
    )
  }

  const steps = traceSteps(message)
  const text = parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join('\n\n')

  return (
    <div className="space-y-5">
      {steps.length > 0 && (
        <ol className="flex flex-wrap gap-1.5" aria-label="What the agent looked up">
          {steps.map(({key, Icon, title, detail, done}) => (
            <li key={key} className="flex items-center gap-1.5 rounded border border-line bg-surface px-2.5 py-1 text-xs">
              {done ? <Icon aria-hidden className="size-3.5 text-accent" /> : <LoaderCircle aria-hidden className="size-3.5 animate-spin text-accent" />}
              <span className="font-medium">{title}</span>
              <span className="max-w-[14rem] truncate text-ink-muted">{detail}</span>
            </li>
          ))}
        </ol>
      )}

      {toBlocks(splitDirectives(text)).map((block, i) => {
        if (block.type === 'cards') {
          return (
            <div key={i} className="grid gap-4 sm:grid-cols-2">
              {block.slugs.map((slug) => (
                <DishCard key={slug} slug={slug} preferences={preferences} allergens={allergens} />
              ))}
            </div>
          )
        }
        if (block.type === 'rows') {
          return (
            <ul key={i} className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {block.slugs.map((slug) => (
                <DishRow key={slug} slug={slug} preferences={preferences} allergens={allergens} />
              ))}
            </ul>
          )
        }
        return (
          <div key={i} className="text-[15.5px] leading-relaxed">
            <ReactMarkdown
              components={{
                h1: SectionLabel,
                h2: SectionLabel,
                h3: SectionLabel,
                h4: SectionLabel,
                p: ({children}) => <p className="my-2">{children}</p>,
                ul: ({children}) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
                ol: ({children}) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
                strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                em: ({children}) => <em className="text-ink-muted">{children}</em>,
                hr: () => null,
                a: ({href, children}) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">
                    {children}
                  </a>
                ),
              }}
            >
              {block.text}
            </ReactMarkdown>
          </div>
        )
      })}
    </div>
  )
}

function SectionLabel({children}: {children?: React.ReactNode}) {
  return (
    <h3 className="mb-1 mt-3 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
      <span className="shrink-0">{children}</span>
      <span aria-hidden className="h-px flex-1 bg-ink/15" />
    </h3>
  )
}
