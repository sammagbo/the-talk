import { revalidateTag } from "next/cache";
import { SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { getSanityCacheTags, verifySanityWebhook } from "@/lib/sanity/revalidation";

export const runtime = "nodejs";

function json(body: object, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return json({ error: "Revalidation is not configured." }, 503);

  const rawBody = await request.text();
  const verification = await verifySanityWebhook(
    rawBody,
    request.headers.get(SIGNATURE_HEADER_NAME),
    secret,
  );

  if (!verification.ok) {
    return verification.reason === "signature"
      ? json({ error: "Invalid webhook signature." }, 401)
      : json({ error: "Invalid webhook payload." }, 400);
  }

  const tags = getSanityCacheTags(verification.document);
  for (const tag of tags) revalidateTag(tag, "max");

  return json({ revalidated: tags.length > 0, tags }, tags.length > 0 ? 200 : 202);
}
