import {defineArrayMember, defineField, defineType} from 'sanity'

export const MENU_SECTIONS = [
  {title: 'Small plates', value: 'small-plates'},
  {title: 'Mains', value: 'mains'},
  {title: 'Sides', value: 'sides'},
  {title: 'Desserts', value: 'desserts'},
  {title: 'Kids', value: 'kids'},
]

export const dish = defineType({
  name: 'dish',
  title: 'Dish',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'name'}, validation: (r) => r.required()}),
    defineField({
      name: 'section',
      type: 'string',
      options: {list: MENU_SECTIONS},
      validation: (r) => r.required(),
    }),
    defineField({name: 'price', title: 'Price (EUR)', type: 'number', validation: (r) => r.required().positive()}),
    defineField({name: 'description', type: 'text', rows: 2}),
    defineField({name: 'available', type: 'boolean', initialValue: true}),
    defineField({name: 'spiceLevel', type: 'number', options: {list: [0, 1, 2, 3]}, initialValue: 0}),
    defineField({
      name: 'components',
      type: 'array',
      validation: (r) => r.required().min(1),
      of: [
        defineArrayMember({
          name: 'dishComponent',
          type: 'object',
          fields: [
            defineField({
              name: 'component',
              type: 'reference',
              to: [{type: 'component'}],
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'removable',
              type: 'boolean',
              initialValue: false,
              description: 'Kitchen can leave this off on request without remaking the dish.',
            }),
          ],
          preview: {
            select: {title: 'component.name', removable: 'removable'},
            prepare: ({title, removable}) => ({title, subtitle: removable ? 'Can be left off' : 'Fixed'}),
          },
        }),
      ],
    }),
    defineField({
      name: 'substitutions',
      type: 'array',
      description: 'Swaps the kitchen supports, e.g. brioche bun -> gluten-free bun.',
      of: [
        defineArrayMember({
          name: 'substitution',
          type: 'object',
          fields: [
            defineField({
              name: 'replaces',
              type: 'reference',
              to: [{type: 'component'}],
              validation: (r) => r.required(),
            }),
            defineField({name: 'with', type: 'reference', to: [{type: 'component'}], validation: (r) => r.required()}),
            defineField({name: 'surcharge', title: 'Surcharge (EUR)', type: 'number', initialValue: 0}),
          ],
          preview: {
            select: {a: 'replaces.name', b: 'with.name', s: 'surcharge'},
            prepare: ({a, b, s}) => ({title: `${a} → ${b}`, subtitle: s ? `+€${s}` : 'No charge'}),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'name', section: 'section', price: 'price'},
    prepare: ({title, section, price}) => ({title, subtitle: `${section} · €${price}`}),
  },
})
