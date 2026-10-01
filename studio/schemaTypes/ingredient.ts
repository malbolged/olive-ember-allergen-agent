import {defineField, defineType} from 'sanity'

export const ANIMAL_ORIGIN = [
  {title: 'None (plant / mineral)', value: 'none'},
  {title: 'Dairy', value: 'dairy'},
  {title: 'Egg', value: 'egg'},
  {title: 'Honey', value: 'honey'},
  {title: 'Meat', value: 'meat'},
  {title: 'Fish', value: 'fish'},
  {title: 'Shellfish', value: 'shellfish'},
]

export const ingredient = defineType({
  name: 'ingredient',
  title: 'Ingredient',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'name'}, validation: (r) => r.required()}),
    defineField({
      name: 'allergens',
      title: 'Contains allergens',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'allergen'}]}],
      description: 'Allergens this ingredient itself contains. Leave empty if none.',
    }),
    defineField({
      name: 'mayContain',
      title: 'Supplier "may contain"',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'allergen'}]}],
      description: 'Precautionary allergen labelling from the supplier spec sheet (cross-contact at the factory).',
    }),
    defineField({
      name: 'animalOrigin',
      type: 'string',
      options: {list: ANIMAL_ORIGIN, layout: 'radio'},
      initialValue: 'none',
      validation: (r) => r.required(),
      description: 'Drives vegan / vegetarian / pescatarian verdicts.',
    }),
    defineField({name: 'supplier', type: 'string'}),
    defineField({name: 'notes', type: 'text', rows: 2}),
  ],
  preview: {
    select: {title: 'name', a0: 'allergens.0.name', a1: 'allergens.1.name', a2: 'allergens.2.name'},
    prepare: ({title, a0, a1, a2}) => ({
      title,
      subtitle: [a0, a1, a2].filter(Boolean).join(', ') || 'No allergens',
    }),
  },
})
