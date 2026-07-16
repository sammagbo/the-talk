import { isValidSignature } from "@sanity/webhook";

export const sanityCacheTags = {
  episodes: "sanity:episodes",
  episode: (slug: string) => `sanity:episode:${slug}`,
  posts: "sanity:posts",
  post: (slug: string) => `sanity:post:${slug}`,
  settings: "sanity:site-settings",
} as const;

export type SanityWebhookDocument = {
  _type?: string | null;
  slug?: string | null;
};

type WebhookVerification =
  | { ok: true; document: SanityWebhookDocument }
  | { ok: false; reason: "signature" | "payload" };

export function getSanityCacheTags(document: SanityWebhookDocument) {
  const tags = new Set<string>();

  switch (document._type) {
    case "episode":
      tags.add(sanityCacheTags.episodes);
      if (document.slug) tags.add(sanityCacheTags.episode(document.slug));
      break;
    case "post":
      tags.add(sanityCacheTags.posts);
      if (document.slug) tags.add(sanityCacheTags.post(document.slug));
      break;
    case "person":
    case "category":
      tags.add(sanityCacheTags.episodes);
      tags.add(sanityCacheTags.posts);
      break;
    case "siteSettings":
      tags.add(sanityCacheTags.settings);
      break;
  }

  return [...tags];
}

export async function verifySanityWebhook(
  rawBody: string,
  signature: string | null,
  secret: string,
): Promise<WebhookVerification> {
  if (!signature || !(await isValidSignature(rawBody, signature, secret))) {
    return { ok: false, reason: "signature" };
  }

  try {
    const document = JSON.parse(rawBody) as unknown;
    if (!document || typeof document !== "object" || Array.isArray(document)) {
      return { ok: false, reason: "payload" };
    }
    return { ok: true, document: document as SanityWebhookDocument };
  }
  catch {
    return { ok: false, reason: "payload" };
  }
}
