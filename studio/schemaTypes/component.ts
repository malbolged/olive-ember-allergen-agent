import {defineField, defineType} from 'sanity'

// A sub-recipe: sauce, bread, dressing, garnish. Dishes are assembled from components.
// Nesting is capped at one level (a component may use components that use none themselves)
// so every allergen roll-up is a fixed-depth GROQ projection.
export const component = defineType({
  name: 'component',
  title: 'Component (sub-recipe)',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'name'}, validation: (r) => r.required()}),
    defineField({
      name: 'ingredients',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'ingredient'}]}],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'subComponents',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'component'}]}],
      description: 'Other components used inside this one (one level deep only).',
      validation: (r) =>
        r.custom(async (value, context) => {
          if (!value?.length) return true
          const client = context.getClient({apiVersion: '2026-03-03'})
          const ids = (value as {_ref: string}[]).map((v) => v._ref)
          const nested = await client.fetch<number>('count(*[_id in $ids && count(subComponents) > 0])', {ids})
          return nested === 0 || 'Sub-components cannot have their own sub-components (max one level).'
        }),
    }),
    defineField({
      name: 'preparedOn',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'equipment'}]}],
      description: 'Equipment/stations this component touches. Drives cross-contact.',
    }),
    defineField({name: 'notes', type: 'text', rows: 2}),
  ],
})
