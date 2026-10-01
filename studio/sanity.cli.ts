import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  studioHost: 'olive-ember-allergens',
  deployment: {appId: 'xt8qcru1ohawsyjp73qn2582', autoUpdates: true},
  // .env lives at the repo root, shared with the app
  vite: {envDir: '..'},
})
