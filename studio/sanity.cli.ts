import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '9y73r1va',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // Pinned so `sanity deploy` never prompts and stays reproducible in CI.
  studioHost: 'thetalkfashion',
  deployment: {
    autoUpdates: false,
    appId: 'vjf89ws2bhe8d9t6d284c1vr',
  },
})
