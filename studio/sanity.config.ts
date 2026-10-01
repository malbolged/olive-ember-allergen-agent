import {contextPlugin} from '@sanity/context/studio'
import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {schemaTypes} from './schemaTypes'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

if (!projectId) throw new Error('Missing SANITY_STUDIO_PROJECT_ID (see ../.env.example)')

export default defineConfig({
  name: 'default',
  title: 'Olive & Ember · Allergen Graph',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Kitchen')
          .items([
            S.documentTypeListItem('dish').title('Dishes'),
            S.documentTypeListItem('component').title('Components'),
            S.documentTypeListItem('ingredient').title('Ingredients'),
            S.documentTypeListItem('equipment').title('Equipment & stations'),
            S.documentTypeListItem('allergen').title('Allergens (EU 14)'),
            S.divider(),
            S.documentTypeListItem('guidanceArticle').title('Guidance (Knowledge Base source)'),
          ]),
    }),
    visionTool({defaultApiVersion: '2026-03-03'}),
    contextPlugin(),
  ],
  schema: {types: schemaTypes},
})
