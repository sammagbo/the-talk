import { createImageUrlBuilder } from "@sanity/image-url";
import { sanityClient } from "./client";

const builder = createImageUrlBuilder(sanityClient);
type ImageOptions = { width?: number; height?: number; quality?: number };

export function getSanityImageUrl(source: unknown, options: ImageOptions = {}) {
  if (!source) return null;
  try {
    let image = builder.image(source as Parameters<typeof builder.image>[0]).auto("format").fit("crop").quality(options.quality ?? 85);
    if (options.width) image = image.width(options.width);
    if (options.height) image = image.height(options.height);
    return image.url();
  } catch { return null; }
}
