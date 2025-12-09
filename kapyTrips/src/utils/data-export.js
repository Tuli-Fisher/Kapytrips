import { getCoordinates } from "../services/api.js";

/**
 * Identify items missing coordinates, fetch them via Geoapify,
 * and trigger a CSV download.
 * @param {Array} data - The array of park/attraction objects
 */
export async function exportMissingCoordinates(data) {
    // 1. Filter items that are missing lat/lng
    // We check if keys are missing or falsy
    const missingCoords = data.filter((item) => {
        // If it has both, we don't need to export it (it's already in the sheet)
        if (item.latitude && item.longitude) return false;
        // If it has no address, we can't geocode it anyway
        if (!item.address) return false;
        return true;
    });

    if (missingCoords.length === 0) {
        alert("No items found that need geocoding (all items have lat/lng or missing address).");
        return;
    }

    const count = missingCoords.length;
    // Notify user process has started (simple alert or console log)
    console.log(`Starting geocoding for ${count} items...`);
    const statusEl = document.createElement("div");
    statusEl.style.position = "fixed";
    statusEl.style.bottom = "20px";
    statusEl.style.right = "20px";
    statusEl.style.background = "#333";
    statusEl.style.color = "#fff";
    statusEl.style.padding = "10px 20px";
    statusEl.style.borderRadius = "5px";
    statusEl.style.zIndex = "9999";
    statusEl.textContent = `Geocoding ${count} items... please wait.`;
    document.body.appendChild(statusEl);

    // 2. Fetch coordinates for them
    // We use the existing getCoordinates which handles Geoapify calls
    const results = [];

    // Process in chunks to avoid rate limiting if necessary, but Promise.all is usually fine for <100 items
    // Geoapify free tier is generous (3000/day).
    const promises = missingCoords.map(async (item) => {
        try {
            // Pass true to get full details
            const data = await getCoordinates(item, true);
            if (data) {
                return {
                    name: item.name,
                    submitted_address: item.address,
                    latitude: data.lat,
                    longitude: data.lng,
                    formatted: data.formatted || "",
                    city: data.city || "",
                    state: data.state || "",
                    postcode: data.postcode || "",
                    country: data.country || "",
                    place_id: data.place_id || "",
                    confidence: data.rank && data.rank.confidence ? data.rank.confidence : "",
                };
            }
        } catch (err) {
            console.error(`Failed to geocode ${item.name}`, err);
        }
        return null;
    });

    const resolved = await Promise.all(promises);
    const validResults = resolved.filter(Boolean);

    statusEl.remove();

    if (validResults.length === 0) {
        alert("Could not geocode any of the missing items.");
        return;
    }

    // 3. Generate CSV
    const headers = [
        "Name",
        "Latitude",
        "Longitude",
        "Formatted Address",
        "City",
        "State",
        "Postcode",
        "Country",
        "Place ID",
        "Confidence",
        "Original Address"
    ];

    const csvRows = [headers.join(",")];

    const escapeCsv = (val) => `"${String(val || "").replace(/"/g, '""')}"`;

    validResults.forEach((r) => {
        const row = [
            escapeCsv(r.name),
            r.latitude,
            r.longitude,
            escapeCsv(r.formatted),
            escapeCsv(r.city),
            escapeCsv(r.state),
            escapeCsv(r.postcode),
            escapeCsv(r.country),
            escapeCsv(r.place_id),
            r.confidence,
            escapeCsv(r.submitted_address)
        ];
        csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");

    // 4. Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "geocoded_updates.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
