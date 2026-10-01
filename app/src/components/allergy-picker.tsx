'use client'

import {type AllergenOption, DIETS, shortName} from '@/lib/allergens'
import type {Diet, Preferences} from '@/lib/safety'

interface AllergyPickerProps {
  allergens: AllergenOption[]
  value: Preferences
  onChange: (next: Preferences) => void
}

const chip = 'rounded border px-2.5 py-1.5 text-[13px] leading-none transition-colors cursor-pointer select-none'
const chipOff = 'border-rail-line bg-rail-muted text-rail-text hover:border-rail-text-muted'
const chipOn = 'border-rail-text bg-rail-text font-semibold text-rail'
const label = 'text-[11px] font-medium uppercase tracking-[0.08em] text-rail-text-muted'

export function AllergyPicker({allergens, value, onChange}: AllergyPickerProps) {
  const toggle = (code: string) =>
    onChange({
      ...value,
      avoid: value.avoid.includes(code) ? value.avoid.filter((c) => c !== code) : [...value.avoid, code],
    })

  const setDiet = (diet: Diet) => onChange({...value, diet: value.diet === diet ? null : diet})
  const hasAny = value.avoid.length > 0 || Boolean(value.diet)

  return (
    <div className="space-y-5">
      <fieldset>
        <div className="mb-2.5 flex items-center justify-between">
          <legend className={label}>I must avoid</legend>
          {hasAny && (
            <button
              type="button"
              onClick={() => onChange({avoid: [], diet: null})}
              className="text-xs text-rail-text-muted underline underline-offset-2 hover:text-rail-text"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allergens.map((a) => {
            const on = value.avoid.includes(a.code)
            return (
              <button
                key={a.code}
                type="button"
                aria-pressed={on}
                title={a.name}
                onClick={() => toggle(a.code)}
                className={`${chip} ${on ? chipOn : chipOff}`}
              >
                {shortName(a)}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className={`${label} mb-2.5`}>Diet</legend>
        <div className="flex flex-wrap gap-1.5">
          {DIETS.map((d) => {
            const on = value.diet === d.value
            return (
              <button
                key={d.value}
                type="button"
                aria-pressed={on}
                onClick={() => setDiet(d.value)}
                className={`${chip} ${on ? chipOn : chipOff}`}
              >
                {d.label}
              </button>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
