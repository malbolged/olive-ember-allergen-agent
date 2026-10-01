import {defineField, defineType} from 'sanity'

// Shared equipment is how cross-contact reaches a dish whose own ingredients are clean
// (the classic case: gluten-free fries cooked in the same oil as battered fish).
export const equipment = defineType({
  name: 'equipment',
  title: 'Equipment / station',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'shared',
      type: 'boolean',
      initialValue: true,
      description:
        'Shared equipment passes the allergens of everything cooked on it to everything else cooked on it.',
    }),
    defineField({name: 'notes', type: 'text', rows: 2}),
  ],
})
