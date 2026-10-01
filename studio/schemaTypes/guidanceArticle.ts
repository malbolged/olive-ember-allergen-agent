import {defineField, defineType} from 'sanity'

// Prose knowledge (kitchen procedures, policies, definitions). Indexed into the Knowledge Base
// through a dataset source, and deliberately excluded from the GROQ-mode menu endpoint.
export const guidanceArticle = defineType({
  name: 'guidanceArticle',
  title: 'Guidance article',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({
      name: 'category',
      type: 'string',
      options: {list: ['kitchen-procedure', 'policy', 'allergen-reference', 'supplier-spec']},
      validation: (r) => r.required(),
    }),
    defineField({name: 'body', type: 'text', rows: 20, description: 'Markdown', validation: (r) => r.required()}),
  ],
})
