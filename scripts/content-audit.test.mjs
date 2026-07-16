import assert from 'node:assert/strict'
import test from 'node:test'
import {auditDataset, formatAudit} from './lib/content-audit.mjs'

const readyDataset = {
  source: 'test/production',
  episodes: [{
    _id: 'episode-1', title: 'Une conversation réelle', slug: 'conversation-reelle',
    excerpt: 'Un résumé complet.', publicationStatus: 'published', publishedAt: '2026-07-01T12:00:00Z',
    seasonNumber: 1, episodeNumber: 1, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    coverImage: {assetRef: 'image-ready', alt: 'Portrait de l’invité'},
    guests: [{_id: 'person-1', name: 'Invité'}], seo: {metaTitle: 'Conversation'},
  }],
  posts: [{
    _id: 'post-1', title: 'Un article réel', slug: 'article-reel', excerpt: 'Un chapô complet.',
    publicationStatus: 'published', publishedAt: '2026-07-02T12:00:00Z', bodyBlocks: 2,
    coverImage: {assetRef: 'image-post', alt: 'Coulisses du podcast'},
    author: {_id: 'person-1', name: 'Auteur'}, categories: [{_id: 'category-1', title: 'Interview'}],
    seo: {metaTitle: 'Article'},
  }],
  categories: [{_id: 'category-1', title: 'Interview', slug: 'interview', description: 'Conversations longues.'}],
  people: [{_id: 'person-1', name: 'Auteur', slug: 'auteur'}],
  settings: [{_id: 'siteSettings', title: 'THE TALK'}],
  legacy: {shorts: 0, liveEvents: 0},
}

test('considers a complete dataset ready', () => {
  const report = auditDataset(readyDataset)
  assert.equal(report.ready, true)
  assert.equal(report.counts.blockers, 0)
})

test('detects placeholder, legacy and incorrect media fields', () => {
  const report = auditDataset({
    episodes: [{
      _id: 'episode-test', title: 'Ep Test', slug: 'ep-test', description: 'Teste de fonctionnement',
      date: '2026-01-01T00:00:00Z', duration: '10 min', videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
      spotifyUrl: 'https://open.spotify.com/track/example', mainImage: {assetRef: 'image-legacy'},
    }],
    posts: [], categories: [], people: [], settings: [], legacy: {shorts: 1, liveEvents: 1},
  })

  const codes = new Set(report.issues.map((item) => item.code))
  assert.equal(report.ready, false)
  assert.ok(codes.has('placeholder-content'))
  assert.ok(codes.has('spotify-track-link'))
  assert.ok(codes.has('missing-image-alt'))
  assert.ok(codes.has('legacy-video-field'))
  assert.ok(codes.has('missing-site-settings'))
})

test('keeps approved test episodes auditable without blocking release', () => {
  const report = auditDataset({
    ...readyDataset,
    episodes: [{
      _id: 'episode-test', title: 'Ep Test', slug: 'ep-test', description: 'Teste de fonctionnement',
      date: '2026-01-01T00:00:00Z', duration: '10 min', videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
      spotifyUrl: 'https://open.spotify.com/track/example', mainImage: {assetRef: 'image-legacy'},
    }],
  }, {episodeRoles: {'ep-test': 'test'}})

  assert.equal(report.ready, true)
  assert.equal(report.issues.some((item) => item.severity === 'blocker' && item.type === 'episode'), false)
  assert.ok(report.issues.some((item) => item.code === 'approved-test-content' && item.severity === 'info'))
  assert.ok(report.issues.some((item) => item.code === 'spotify-track-link' && item.severity === 'warning'))
})

test('records an official presentation without excluding it from quality gates', () => {
  const presentation = {...readyDataset.episodes[0], slug: 'mode-fashion', title: 'Mode Fashion'}
  const report = auditDataset({...readyDataset, episodes: [presentation]}, {
    episodeRoles: {'mode-fashion': 'presentation'},
  })

  assert.equal(report.ready, true)
  assert.ok(report.issues.some((item) => item.code === 'presentation-content' && item.severity === 'info'))
})

test('flags a video reused by multiple episodes', () => {
  const base = readyDataset.episodes[0]
  const report = auditDataset({
    ...readyDataset,
    episodes: [base, {...base, _id: 'episode-2', title: 'Deuxième conversation', slug: 'deuxieme'}],
  })
  assert.equal(report.issues.filter((item) => item.code === 'duplicate-video').length, 2)
})

test('formats a readable terminal report', () => {
  const output = formatAudit(auditDataset(readyDataset))
  assert.match(output, /PRÊT POUR RECETTE/)
  assert.match(output, /1 épisodes, 1 article/)
})
