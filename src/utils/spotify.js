/**
 * Convert a Spotify URL into its embed form.
 * Handles already-embedded URLs, locale prefixes (intl-xx) and query params.
 * Supported types: episode, show, track, playlist, album.
 *
 * @param {string} url - A Spotify share or embed URL.
 * @returns {string|null} The embed URL, or null when the input is empty/unrecognized.
 */
export const convertToSpotifyEmbed = (url) => {
    if (!url) return null;

    // Already an embed URL — return as is.
    if (url.includes('/embed/')) {
        return url;
    }

    const spotifyRegex = /https:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(episode|show|track|playlist|album)\/([a-zA-Z0-9]+)/;
    const match = url.match(spotifyRegex);

    if (match) {
        return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
    }

    return null;
};
