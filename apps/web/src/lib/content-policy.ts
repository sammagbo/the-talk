import contentPolicy from "../config/content-policy.json";

export type EpisodeContentRole = "episode" | "presentation" | "test";

export type EpisodeContentPolicy = {
  role: EpisodeContentRole;
  label?: string;
  notice?: string;
};

type EpisodeReference = string | { slug?: string | null } | null | undefined;

const defaultEpisodePolicy: EpisodeContentPolicy = { role: "episode" };
const episodePolicies = contentPolicy.episodes as Record<string, EpisodeContentPolicy>;

function getSlug(episode: EpisodeReference) {
  return typeof episode === "string" ? episode : episode?.slug;
}

export function getEpisodePolicy(episode: EpisodeReference): EpisodeContentPolicy {
  const slug = getSlug(episode);
  return slug ? episodePolicies[slug] ?? defaultEpisodePolicy : defaultEpisodePolicy;
}

export function isTestEpisode(episode: EpisodeReference) {
  return getEpisodePolicy(episode).role === "test";
}

export function isIndexableEpisode(episode: EpisodeReference) {
  return !isTestEpisode(episode);
}
