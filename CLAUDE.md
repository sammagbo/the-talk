# THE TALK

Editorial fashion and lifestyle site built around video-first content. Episodes
carry both a video and an audio track; vertical clips run as Shorts. Sanity is
the editorial CMS and the site reads from it at runtime.

React 18 + Vite, Tailwind CSS, Sanity. Deployed on Vercel from `main`.

## Working method

`main` is production and auto-deploys on push, so nothing lands there casually.

- One task per branch. Every branch is pushed and reviewed before it merges.
- Nothing merges to `main` without explicit approval.
- Validate every change with `npm run build` and `npm run lint` (zero errors),
  plus an acceptance check stated up front for that specific task — a grep that
  must return nothing, a file size, a generated CSS rule.
- Confirm visual and UX changes on the Vercel branch preview, on a real device,
  before merging. A passing build is not evidence that a layout works.

## Design system

Monochrome — black, white and grey — with `#FF0050` as the single accent.
Introducing a second accent is a design decision, not a detail.

`borderRadius` is defined on `theme` in `tailwind.config.js`, not on
`theme.extend`, so the scale is exactly three values:

| class | value | applies to |
| --- | --- | --- |
| `rounded-none` | `0` | everything by default |
| `rounded` | `4px` | interactive elements only — buttons, inputs, filter pills, clickable cards |
| `rounded-full` | `9999px` | play controls and spinners |

Replacing the scale instead of extending it means `rounded-lg`, `rounded-xl` and
the rest are not valid classes and silently emit no CSS.

Fonts: Outfit for the wordmark (`font-creativo`), Inter for body copy
(`font-minimal`), Playfair Display for editorial headings (`font-editorial`).

## Conventions

- Commit messages in English.
- Line endings are LF, enforced by `.gitattributes`. Never rewrite a file in a
  mode that converts them: a two-line edit that flips CRLF becomes a whole-file
  diff and destroys blame.
- No mock or placeholder data outside tests. When content is missing, fall back
  to a brand asset — never to a stock photo or a hardcoded sample.
- Sanity Studio lives in `studio/` and is the editorial panel. Deploy it with
  `npx sanity deploy` from that directory. Log in with
  `npx sanity login --provider github`: the default provider menu is interactive
  and blocks non-interactive shells, and the other provider authenticates to an
  account that has no access to this project.
