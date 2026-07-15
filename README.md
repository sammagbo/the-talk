# THE TALK

Fashion and culture podcast by Mijean Rochus.

- Website: https://www.thetalkfashion.com
- Content management: Sanity Studio
- Hosting: Vercel

## Current product scope

- Video-first podcast episodes with YouTube embeds
- Audio playback through MP3 or podcast platform embeds
- Editorial blog powered by Sanity
- Shorts and behind-the-scenes content
- French-first interface with additional UI translations
- Responsive light and dark themes

The legacy Supabase social layer is currently disabled. Accounts, favorites, comments, ratings, badges, premium content and generative-AI features are not part of the active product scope.

The store is intentionally hidden until a real catalog, checkout flow and operating model are ready.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 7, React Router |
| Styling | Tailwind CSS |
| Content | Sanity |
| Media | YouTube, Spotify and optional MP3 |
| Hosting | Vercel |
| Testing | Vitest and Cypress |

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Required frontend variables:

```env
VITE_SANITY_PROJECT_ID=your-project-id
VITE_SANITY_DATASET=production
```

Optional server-side variables for newsletter subscription:

```env
MAILCHIMP_API_KEY=your-api-key
MAILCHIMP_LIST_ID=your-list-id
MAILCHIMP_SERVER_PREFIX=your-prefix
```

## Sanity Studio

```bash
cd studio
npm install
npm run dev
```

Episodes and blog posts are published through Sanity Studio. The public website is the presentation layer and should not contain a second custom publishing system.

## Validation

```bash
npm run lint
npm run test
npm run build
```

## Architecture direction

The next major version will move the public website to Next.js and TypeScript while preserving Sanity as the editorial source of truth and reusing the approved visual identity.
