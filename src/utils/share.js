/**
 * Share Utility - Web Share API with clipboard fallback
 */

/**
 * Share content using Web Share API or fallback to clipboard
 * @param {object} shareData - Share data { title, text, url }
 * @param {function} onSuccess - Callback for successful share/copy
 * @param {function} onError - Callback for error
 * @returns {Promise<{method: 'share' | 'clipboard', success: boolean}>}
 */
export const shareContent = async (shareData, onSuccess, onError) => {
    const { title, text, url } = shareData;

    // Check if Web Share API is available and supports this content
    if (navigator.share && navigator.canShare && navigator.canShare({ title, text, url })) {
        try {
            await navigator.share({
                title,
                text,
                url
            });
            if (onSuccess) onSuccess('shared');
            return { method: 'share', success: true };
        } catch (error) {
            // User cancelled sharing - not an error
            if (error.name === 'AbortError') {
                return { method: 'share', success: false, cancelled: true };
            }
            console.error('Share failed:', error);
            if (onError) onError(error);
            return { method: 'share', success: false };
        }
    }

    // Fallback to clipboard
    try {
        await navigator.clipboard.writeText(url);
        if (onSuccess) onSuccess('copied');
        return { method: 'clipboard', success: true };
    } catch (error) {
        console.error('Clipboard copy failed:', error);

        // Fallback for older browsers - create temp input
        try {
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            if (onSuccess) onSuccess('copied');
            return { method: 'clipboard', success: true };
        } catch (fallbackError) {
            console.error('Fallback copy failed:', fallbackError);
            if (onError) onError(fallbackError);
            return { method: 'clipboard', success: false };
        }
    }
};

/**
 * Generate share URL for an episode
 * @param {string} episodeId - Episode ID
 * @returns {string} - Full URL to episode
 */
export const getEpisodeShareUrl = (episodeId) => {
    return `${window.location.origin}/episode/${episodeId}`;
};
