const PLACEHOLDER_PATTERN = /\b(?:test(?:e|es|ing)?|demo|placeholder)\w*\b/i

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function issue(severity, code, type, document, message) {
  return {
    severity,
    code,
    type,
    id: document?._id ?? null,
    title: document?.title?.trim() || document?.name?.trim() || 'Document sans titre',
    message,
  }
}

function isYouTubeUrl(value) {
  if (!hasText(value)) return false
  try {
    const host = new URL(value).hostname.replace(/^www\./, '')
    return ['youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com'].includes(host)
  } catch {
    return false
  }
}

function auditEpisode(episode, role = 'episode') {
  const issues = []
  const summary = episode.excerpt || episode.description
  const image = episode.coverImage || episode.mainImage
  const youtube = episode.youtubeUrl || episode.videoUrl
  const requiredSeverity = role === 'test' ? 'warning' : 'blocker'

  if (!hasText(episode.title)) issues.push(issue(requiredSeverity, 'missing-title', 'episode', episode, 'Titre manquant.'))
  if (!hasText(episode.slug)) issues.push(issue(requiredSeverity, 'missing-slug', 'episode', episode, 'Adresse (slug) manquante.'))
  if (!hasText(summary)) issues.push(issue(requiredSeverity, 'missing-summary', 'episode', episode, 'Résumé éditorial manquant.'))
  if (PLACEHOLDER_PATTERN.test(`${episode.title ?? ''} ${summary ?? ''}`)) {
    issues.push(role === 'test'
      ? issue('info', 'approved-test-content', 'episode', episode, 'Contenu de test approuvé, conservé comme démonstration technique et exclu de l’indexation par le frontend.')
      : issue('blocker', 'placeholder-content', 'episode', episode, 'Le titre ou le résumé indique un contenu de test.'))
  }
  if (!hasText(episode.publicationStatus)) {
    issues.push(issue(requiredSeverity, 'missing-publication-status', 'episode', episode, 'État éditorial non défini.'))
  }
  if (!hasText(episode.publishedAt)) {
    issues.push(issue(requiredSeverity, 'missing-published-at', 'episode', episode, 'Date moderne de publication manquante.'))
  }
  if (!image?.assetRef) issues.push(issue(requiredSeverity, 'missing-image', 'episode', episode, 'Image de couverture manquante.'))
  if (image?.assetRef && !hasText(image.alt)) {
    issues.push(issue(requiredSeverity, 'missing-image-alt', 'episode', episode, 'Texte alternatif de l’image manquant.'))
  }
  if (!hasText(youtube) && !hasText(episode.audioUrl) && !hasText(episode.spotifyUrl)) {
    issues.push(issue(requiredSeverity, 'missing-media', 'episode', episode, 'Aucun média audio ou vidéo n’est renseigné.'))
  }
  if (hasText(youtube) && !isYouTubeUrl(youtube)) {
    issues.push(issue(requiredSeverity, 'invalid-youtube-url', 'episode', episode, 'Le lien vidéo n’est pas une adresse YouTube reconnue.'))
  }
  if (hasText(episode.spotifyUrl) && /\/track\//i.test(episode.spotifyUrl)) {
    issues.push(issue(requiredSeverity, 'spotify-track-link', 'episode', episode, 'Le lien Spotify pointe vers une chanson, pas vers un épisode de podcast.'))
  }
  if (!episode.coverImage?.assetRef && episode.mainImage?.assetRef) {
    issues.push(issue('warning', 'legacy-image-field', 'episode', episode, 'L’image utilise encore le champ historique mainImage.'))
  }
  if (!hasText(episode.youtubeUrl) && hasText(episode.videoUrl)) {
    issues.push(issue('warning', 'legacy-video-field', 'episode', episode, 'La vidéo utilise encore le champ historique videoUrl.'))
  }
  if (!hasText(episode.excerpt) && hasText(episode.description)) {
    issues.push(issue('warning', 'legacy-summary-field', 'episode', episode, 'Le résumé utilise encore le champ historique description.'))
  }
  if (!hasText(episode.durationLabel) && hasText(episode.duration)) {
    issues.push(issue('warning', 'legacy-duration-field', 'episode', episode, 'La durée utilise encore le champ historique duration.'))
  }
  if (!episode.seo) issues.push(issue('warning', 'missing-seo', 'episode', episode, 'Référencement éditorial non renseigné.'))
  if (!episode.guests?.length) issues.push(issue('warning', 'missing-guests', 'episode', episode, 'Aucun invité structuré n’est associé.'))
  if (!episode.seasonNumber || !episode.episodeNumber) {
    issues.push(issue('info', 'missing-numbering', 'episode', episode, 'Saison ou numéro d’épisode non renseigné.'))
  }
  if (role === 'presentation') {
    issues.push(issue('info', 'presentation-content', 'episode', episode, 'Contenu classé comme présentation officielle de THE TALK.'))
  }

  return issues
}

function auditPost(post) {
  const issues = []
  const image = post.coverImage || post.mainImage

  if (!hasText(post.title)) issues.push(issue('blocker', 'missing-title', 'post', post, 'Titre manquant.'))
  if (!hasText(post.slug)) issues.push(issue('blocker', 'missing-slug', 'post', post, 'Adresse (slug) manquante.'))
  if (!hasText(post.excerpt)) issues.push(issue('blocker', 'missing-excerpt', 'post', post, 'Chapô manquant.'))
  if (!post.bodyBlocks) issues.push(issue('blocker', 'missing-body', 'post', post, 'Corps de l’article manquant.'))
  if (PLACEHOLDER_PATTERN.test(`${post.title ?? ''} ${post.excerpt ?? ''}`)) {
    issues.push(issue('blocker', 'placeholder-content', 'post', post, 'Le titre ou le chapô indique un contenu de test.'))
  }
  if (!hasText(post.publicationStatus)) {
    issues.push(issue('blocker', 'missing-publication-status', 'post', post, 'État éditorial non défini.'))
  }
  if (!hasText(post.publishedAt)) issues.push(issue('blocker', 'missing-published-at', 'post', post, 'Date de publication manquante.'))
  if (!image?.assetRef) issues.push(issue('blocker', 'missing-image', 'post', post, 'Image de couverture manquante.'))
  if (image?.assetRef && !hasText(image.alt)) {
    issues.push(issue('blocker', 'missing-image-alt', 'post', post, 'Texte alternatif de l’image manquant.'))
  }
  if (!post.coverImage?.assetRef && post.mainImage?.assetRef) {
    issues.push(issue('warning', 'legacy-image-field', 'post', post, 'L’image utilise encore le champ historique mainImage.'))
  }
  if (!post.author) issues.push(issue('warning', 'missing-author', 'post', post, 'Aucun auteur structuré n’est associé.'))
  if (!post.categories?.length) issues.push(issue('warning', 'missing-categories', 'post', post, 'Aucune catégorie n’est associée.'))
  if (!post.seo) issues.push(issue('warning', 'missing-seo', 'post', post, 'Référencement éditorial non renseigné.'))

  return issues
}

function auditCategory(category) {
  const issues = []
  if (!hasText(category.title)) issues.push(issue('blocker', 'missing-title', 'category', category, 'Nom de catégorie manquant.'))
  if (!hasText(category.slug)) issues.push(issue('warning', 'missing-slug', 'category', category, 'Adresse de catégorie manquante.'))
  if (PLACEHOLDER_PATTERN.test(`${category.title ?? ''} ${category.description ?? ''}`)) {
    issues.push(issue('warning', 'placeholder-content', 'category', category, 'La catégorie contient encore du texte de test.'))
  }
  return issues
}

function addDuplicateMediaIssues(episodes, issues) {
  const byVideo = new Map()
  for (const episode of episodes) {
    const value = episode.youtubeUrl || episode.videoUrl
    if (!hasText(value)) continue
    const key = value.trim().replace(/[?&]feature=share$/i, '')
    const group = byVideo.get(key) ?? []
    group.push(episode)
    byVideo.set(key, group)
  }

  for (const group of byVideo.values()) {
    if (group.length < 2) continue
    for (const episode of group) {
      issues.push(issue('warning', 'duplicate-video', 'episode', episode, `La même vidéo est utilisée par ${group.length} épisodes.`))
    }
  }
}

export function auditDataset(dataset, options = {}) {
  const episodes = dataset.episodes ?? []
  const posts = dataset.posts ?? []
  const categories = dataset.categories ?? []
  const people = dataset.people ?? []
  const settings = dataset.settings ?? []
  const episodeRoles = options.episodeRoles ?? {}
  const issues = [
    ...episodes.flatMap((episode) => auditEpisode(episode, episodeRoles[episode.slug] ?? 'episode')),
    ...posts.flatMap(auditPost),
    ...categories.flatMap(auditCategory),
  ]

  addDuplicateMediaIssues(episodes, issues)

  if (!settings.length) {
    issues.push(issue('blocker', 'missing-site-settings', 'siteSettings', null, 'Le document unique de paramètres du site n’existe pas.'))
  }
  if (!people.length) {
    issues.push(issue('warning', 'missing-people', 'person', null, 'Aucun auteur ou invité structuré n’existe.'))
  }
  if ((dataset.legacy?.shorts ?? 0) > 0 || (dataset.legacy?.liveEvents ?? 0) > 0) {
    issues.push(issue('info', 'legacy-content-present', 'dataset', null, `${dataset.legacy?.shorts ?? 0} shorts et ${dataset.legacy?.liveEvents ?? 0} événements live historiques restent dans le dataset.`))
  }

  const severityOrder = {blocker: 0, warning: 1, info: 2}
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || a.type.localeCompare(b.type) || a.title.localeCompare(b.title))

  const counts = {
    blockers: issues.filter((item) => item.severity === 'blocker').length,
    warnings: issues.filter((item) => item.severity === 'warning').length,
    info: issues.filter((item) => item.severity === 'info').length,
  }

  return {
    generatedAt: new Date().toISOString(),
    source: dataset.source ?? null,
    inventory: {
      episodes: episodes.length,
      posts: posts.length,
      categories: categories.length,
      people: people.length,
      settings: settings.length,
      shorts: dataset.legacy?.shorts ?? 0,
      liveEvents: dataset.legacy?.liveEvents ?? 0,
    },
    ready: counts.blockers === 0,
    counts,
    issues,
  }
}

export function formatAudit(report) {
  const lines = [
    'THE TALK — Audit éditorial Sanity',
    `Source : ${report.source ?? 'non précisée'}`,
    `État : ${report.ready ? 'PRÊT POUR RECETTE' : 'À COMPLÉTER'}`,
    '',
    `Inventaire : ${report.inventory.episodes} épisodes, ${report.inventory.posts} article(s), ${report.inventory.categories} catégories, ${report.inventory.people} personne(s), ${report.inventory.settings} configuration(s).`,
    `Audit : ${report.counts.blockers} blocage(s), ${report.counts.warnings} avertissement(s), ${report.counts.info} information(s).`,
  ]

  for (const severity of ['blocker', 'warning', 'info']) {
    const items = report.issues.filter((item) => item.severity === severity)
    if (!items.length) continue
    lines.push('', severity === 'blocker' ? 'BLOCAGES' : severity === 'warning' ? 'AVERTISSEMENTS' : 'INFORMATIONS')
    for (const item of items) lines.push(`- [${item.type}] ${item.title} — ${item.message} (${item.code})`)
  }

  return lines.join('\n')
}
