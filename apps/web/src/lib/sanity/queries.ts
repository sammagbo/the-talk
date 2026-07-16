export const episodeCardFields = `
  _id, title, "slug": slug.current,
  "summary": coalesce(excerpt, description),
  "publishedAt": coalesce(publishedAt, date),
  "duration": coalesce(durationLabel, duration),
  "coverImage": coalesce(coverImage, mainImage),
  "videoUrl": coalesce(youtubeUrl, videoUrl),
  audioUrl, "spotifyUrl": spotifyEmbedUrl,
  seasonNumber, episodeNumber, featured,
  category->{title, "slug": slug.current}
`;

export const latestEpisodesQuery = `
  *[_type == "episode" && defined(slug.current) &&
    (
      (!defined(publicationStatus) && (!defined(date) || date <= now())) ||
      (publicationStatus == "published" && (!defined(publishedAt) || publishedAt <= now())) ||
      (publicationStatus == "scheduled" && defined(publishedAt) && publishedAt <= now())
    )
  ] | order(featured desc, coalesce(publishedAt, date) desc)[0...$limit] { ${episodeCardFields} }
`;
export const episodeBySlugQuery = `
  *[_type == "episode" && slug.current == $slug &&
    (
      (!defined(publicationStatus) && (!defined(date) || date <= now())) ||
      (publicationStatus == "published" && (!defined(publishedAt) || publishedAt <= now())) ||
      (publicationStatus == "scheduled" && defined(publishedAt) && publishedAt <= now())
    )
  ][0] {
    ${episodeCardFields}, showNotes,
    guests[]->{name, role, "slug": slug.current, image},
    seo
  }
`;
export const postCardFields = `
  _id, title, "slug": slug.current, excerpt, publishedAt,
  "coverImage": coalesce(coverImage, mainImage), featured,
  author->{name, "slug": slug.current}, categories[]->{title, "slug": slug.current}
`;
export const latestPostsQuery = `
  *[_type == "post" && defined(slug.current) &&
    (
      (!defined(publicationStatus) && (!defined(publishedAt) || publishedAt <= now())) ||
      (publicationStatus == "published" && (!defined(publishedAt) || publishedAt <= now())) ||
      (publicationStatus == "scheduled" && defined(publishedAt) && publishedAt <= now())
    )
  ] | order(featured desc, publishedAt desc)[0...$limit] { ${postCardFields} }
`;
export const postBySlugQuery = `
  *[_type == "post" && slug.current == $slug &&
    (
      (!defined(publicationStatus) && (!defined(publishedAt) || publishedAt <= now())) ||
      (publicationStatus == "published" && (!defined(publishedAt) || publishedAt <= now())) ||
      (publicationStatus == "scheduled" && defined(publishedAt) && publishedAt <= now())
    )
  ][0] { ${postCardFields}, body, seo }
`;

export const siteSettingsQuery = `
  coalesce(
    *[_type == "siteSettings" && _id == "siteSettings"][0],
    *[_type == "siteSettings"][0]
  ) {
    title, description, canonicalUrl,
    socialLinks[]{label, url}, defaultSeo
  }
`;
