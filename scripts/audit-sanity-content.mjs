#!/usr/bin/env node

import {auditDataset, formatAudit} from './lib/content-audit.mjs'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || '9y73r1va'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-07-16'
const args = new Set(process.argv.slice(2))

const query = `{
  "episodes": *[_type == "episode"] | order(coalesce(publishedAt, date) desc) {
    _id, title, "slug": slug.current, excerpt, description,
    publicationStatus, publishedAt, date, seasonNumber, episodeNumber,
    durationLabel, duration, youtubeUrl, videoUrl, audioUrl,
    "spotifyUrl": spotifyEmbedUrl,
    "coverImage": coverImage {"assetRef": asset._ref, alt},
    "mainImage": mainImage {"assetRef": asset._ref, alt},
    "guests": guests[]->{_id, name}, seo
  },
  "posts": *[_type == "post"] | order(publishedAt desc) {
    _id, title, "slug": slug.current, excerpt, publicationStatus, publishedAt,
    "bodyBlocks": count(body),
    "coverImage": coverImage {"assetRef": asset._ref, alt},
    "mainImage": mainImage {"assetRef": asset._ref, alt},
    "author": author->{_id, name},
    "categories": categories[]->{_id, title}, seo
  },
  "categories": *[_type == "category"] {_id, title, "slug": slug.current, description},
  "people": *[_type == "person"] {_id, name, "slug": slug.current},
  "settings": *[_type == "siteSettings"] {_id, title},
  "legacy": {
    "shorts": count(*[_type == "short"]),
    "liveEvents": count(*[_type == "liveEvent"])
  }
}`

const endpoint = new URL(`https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`)
endpoint.searchParams.set('query', query)
endpoint.searchParams.set('perspective', 'published')

try {
  const response = await fetch(endpoint, {headers: {Accept: 'application/json'}})
  if (!response.ok) throw new Error(`Sanity a répondu HTTP ${response.status}`)
  const payload = await response.json()
  if (payload.error) throw new Error(payload.error.description || payload.error.type || 'Requête Sanity invalide')

  const report = auditDataset({
    ...payload.result,
    source: `${projectId}/${dataset} (documents publiés)`,
  })

  console.log(args.has('--json') ? JSON.stringify(report, null, 2) : formatAudit(report))
  if (args.has('--strict') && !report.ready) process.exitCode = 1
} catch (error) {
  console.error(`Audit impossible : ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 2
}
