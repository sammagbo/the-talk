import { describe, expect, it } from "vitest";
import { getEpisodePolicy, isIndexableEpisode, isTestEpisode } from "./content-policy";

describe("episode content policy", () => {
  it("classifies the preserved technical demonstrations", () => {
    expect(getEpisodePolicy("ep-test").role).toBe("test");
    expect(getEpisodePolicy({ slug: "episodio-teste" }).role).toBe("test");
    expect(isTestEpisode("ep-test")).toBe(true);
    expect(isIndexableEpisode("episodio-teste")).toBe(false);
  });

  it("classifies Mode Fashion as an indexable presentation", () => {
    expect(getEpisodePolicy("mode-fashion")).toMatchObject({
      role: "presentation",
      label: "Présentation",
    });
    expect(isIndexableEpisode("mode-fashion")).toBe(true);
  });

  it("treats unlisted slugs as regular episodes", () => {
    expect(getEpisodePolicy("conversation-reelle")).toEqual({ role: "episode" });
    expect(isIndexableEpisode("conversation-reelle")).toBe(true);
  });
});
