const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

export function getYouTubeId(value?: string | null) {
  if (!value) return null;
  const candidate = value.trim();
  if (YOUTUBE_ID.test(candidate)) return candidate;
  try {
    const url = new URL(candidate);
    const hostname = url.hostname.replace(/^www\./, "");
    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && YOUTUBE_ID.test(id) ? id : null;
    }
    if (hostname === "youtube.com" || hostname === "m.youtube.com" || hostname === "youtube-nocookie.com") {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery && YOUTUBE_ID.test(fromQuery)) return fromQuery;
      const [, section, id] = url.pathname.split("/");
      if (["embed", "shorts", "live"].includes(section) && id && YOUTUBE_ID.test(id)) return id;
    }
  } catch { return null; }
  return null;
}
