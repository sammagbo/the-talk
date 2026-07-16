import { encodeSignatureHeader } from "@sanity/webhook";
import { describe, expect, it } from "vitest";
import { getSanityCacheTags, sanityCacheTags, verifySanityWebhook } from "./revalidation";

describe("Sanity cache revalidation", () => {
  it("maps editorial documents to the affected cache tags", () => {
    expect(getSanityCacheTags({ _type: "episode", slug: "mode-fashion" })).toEqual([
      sanityCacheTags.episodes,
      sanityCacheTags.episode("mode-fashion"),
    ]);
    expect(getSanityCacheTags({ _type: "post", slug: "article" })).toEqual([
      sanityCacheTags.posts,
      sanityCacheTags.post("article"),
    ]);
    expect(getSanityCacheTags({ _type: "person" })).toEqual([
      sanityCacheTags.episodes,
      sanityCacheTags.posts,
    ]);
    expect(getSanityCacheTags({ _type: "siteSettings" })).toEqual([sanityCacheTags.settings]);
  });

  it("ignores document types that do not feed the modern site", () => {
    expect(getSanityCacheTags({ _type: "short" })).toEqual([]);
  });

  it("accepts a valid signed webhook without re-encoding its body", async () => {
    const secret = "test-secret";
    const rawBody = JSON.stringify({ _type: "episode", slug: "mode-fashion" });
    const signature = await encodeSignatureHeader(rawBody, Date.now(), secret);

    await expect(verifySanityWebhook(rawBody, signature, secret)).resolves.toEqual({
      ok: true,
      document: { _type: "episode", slug: "mode-fashion" },
    });
  });

  it("rejects invalid signatures and malformed payloads", async () => {
    await expect(verifySanityWebhook("{}", "invalid", "secret")).resolves.toEqual({
      ok: false,
      reason: "signature",
    });

    const rawBody = "not-json";
    const signature = await encodeSignatureHeader(rawBody, Date.now(), "secret");
    await expect(verifySanityWebhook(rawBody, signature, "secret")).resolves.toEqual({
      ok: false,
      reason: "payload",
    });
  });
});
