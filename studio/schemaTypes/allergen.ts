import {defineField, defineType} from 'sanity'

// The 14 allergens of EU Regulation 1169/2011 Annex II. Codes are the stable ids the app and agent filter on.
export const allergen = defineType({
  name: 'allergen',
  title: 'Allergen',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'code',
      type: 'string',
      description: 'Stable lowercase id, e.g. "gluten", "tree-nuts". Used in filters.',
      validation: (r) => r.required().regex(/^[a-z-]+$/),
    }),
    defineField({
      name: 'annexNumber',
      title: 'EU Annex II number',
      type: 'number',
      validation: (r) => r.required().min(1).max(14).integer(),
    }),
    defineField({name: 'icon', type: 'string', description: 'Single emoji shown on menu badges'}),
    defineField({
      name: 'alsoKnownAs',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Names guests use for this allergen or its sources (e.g. "spelt", "semolina" for gluten)',
      options: {layout: 'tags'},
    }),
    defineField({name: 'description', type: 'text', rows: 3}),
  ],
  orderings: [{title: 'Annex order', name: 'annex', by: [{field: 'annexNumber', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', icon: 'icon', n: 'annexNumber'},
    prepare: ({title, icon, n}) => ({title: `${icon ?? ''} ${title}`, subtitle: `Annex II #${n}`}),
  },
})
