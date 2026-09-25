// Accepts the editorial formats used in Sanity ("45 min", "1h 20min", "45:30", "1:02:03").
export function toIsoDuration(value) {
    if (!value) return undefined;
    const text = String(value).trim().toLowerCase();

    let h = 0, m = 0, s = 0;
    if (/^\d+(:\d{1,2}){1,2}$/.test(text)) {
        const parts = text.split(':').map(Number);
        if (parts.length === 3) [h, m, s] = parts;
        else [m, s] = parts;
    } else if (/^\d+$/.test(text)) {
        m = Number(text);
    } else {
        const hours = text.match(/(\d+)\s*h/);
        const minutes = text.match(/(\d+)\s*m(?:in)?/);
        const seconds = text.match(/(\d+)\s*s/);
        if (!hours && !minutes && !seconds) return undefined;
        h = hours ? Number(hours[1]) : 0;
        m = minutes ? Number(minutes[1]) : 0;
        s = seconds ? Number(seconds[1]) : 0;
    }

    const total = h * 3600 + m * 60 + s;
    if (!total) return undefined;
    const hh = Math.floor(total / 3600);
    const mm = Math.floor((total % 3600) / 60);
    const ss = total % 60;
    return `PT${hh ? `${hh}H` : ''}${mm ? `${mm}M` : ''}${ss ? `${ss}S` : ''}`;
}
