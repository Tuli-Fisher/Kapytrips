/**
 * Format drive time in minutes to a human-readable string (e.g. "1 hr 30 min")
 * @param {string|number} dt - Drive time in minutes
 * @returns {string} Formatted time string
 */
export function formatDriveTime(dt) {
    if (!dt) return "";

    let minutes = parseInt(dt, 10);
    if (isNaN(minutes)) return "";

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const rem = minutes % 60;

    if (rem === 0) {
        return `${hours} hr`;
    }

    return `${hours} hr ${rem} min`;
}
