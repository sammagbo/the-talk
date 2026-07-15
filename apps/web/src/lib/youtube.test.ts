import { describe, expect, it } from "vitest";
import { getYouTubeId } from "./youtube";

describe("getYouTubeId", () => {
  it.each([
    ["dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?t=10", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("extracts an id from %s", (input, expected) => expect(getYouTubeId(input)).toBe(expected));
  it.each(["", "not-a-youtube-video", "https://example.com/video", "https://youtu.be/too-short"])(
    "rejects %s", (input) => expect(getYouTubeId(input)).toBeNull(),
  );
});
