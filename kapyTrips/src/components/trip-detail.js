import { formatDriveTime } from "../utils/formatters.js";

/**
 * Render the trip detail view
 * @param {Object} trip - The trip implementation
 * @param {HTMLElement} container - Container element
 * @param {Function} onBack - Callback when back button is clicked
 */
export function renderTripDetail(trip, container, onBack) {
    container.innerHTML = "";

    const detailWrapper = document.createElement("div");
    detailWrapper.className = "detail-wrapper";
    // Using global body background now


    // Content Box
    const content = document.createElement("div");
    content.className = "detail-box";

    // Back Button (Inside box, top left)
    const backBtn = document.createElement("button");
    backBtn.className = "back-btn-simple";
    backBtn.innerHTML = "← Back";
    backBtn.addEventListener("click", onBack);
    content.appendChild(backBtn);

    // Layout Grid
    const grid = document.createElement("div");
    grid.className = "detail-box-grid";

    // --- LEFT COLUMN (Main Info) ---
    const mainCol = document.createElement("div");
    mainCol.className = "detail-main-col";

    // Header
    const header = document.createElement("header");
    header.className = "detail-header-simple";

    const h2 = document.createElement("h2");
    h2.textContent = trip.name;
    header.appendChild(h2);

    const tags = document.createElement("div");
    tags.className = "tags";
    if (trip.category) tags.appendChild(createTag(trip.category));
    if (trip.type) tags.appendChild(createTag(trip.type));
    header.appendChild(tags);

    mainCol.appendChild(header);

    // Description
    const description = document.createElement("p");
    description.className = "description-text";
    description.textContent = trip.description || "No description available.";
    mainCol.appendChild(description);

    // Extra Info Tags (Inline)
    const extrasDiv = document.createElement("div");
    extrasDiv.className = "extras-container";

    if (trip.good) {
        const extraTag = document.createElement("div");
        extraTag.className = "extra-tag";
        extraTag.innerHTML = `<strong>Good for:</strong> ${trip.good}`;
        extrasDiv.appendChild(extraTag);
    }

    if (trip.restrooms?.toLowerCase().includes("y")) {
        const toiletTag = document.createElement("div");
        toiletTag.className = "extra-tag";
        toiletTag.innerHTML = `<strong>Restrooms:</strong> Available`;
        extrasDiv.appendChild(toiletTag);
    }
    mainCol.appendChild(extrasDiv);

    // --- RIGHT COLUMN (Meta / Stats) ---
    const sideCol = document.createElement("div");
    sideCol.className = "detail-side-col";

    const driveTime = formatDriveTime(trip.driveTime);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        trip.address || `${trip.latitude},${trip.longitude}`
    )}`;

    // Mini Map Container
    const miniMapId = `mini-map-${Date.now()}`;
    const miniMapContainer = document.createElement("div");
    miniMapContainer.id = miniMapId;
    miniMapContainer.className = "mini-map-container";

    // Assemble info-first to prevent layout jumpiness before map loads
    const infoHtml = `
        <div class="side-stat">
            <span class="label">Location</span>
            <span class="value">${trip.address || "N/A"}</span>
        </div>
        <div class="side-stat">
            <span class="label">Time</span>
            <span class="value">${driveTime}</span>
        </div>
        <div class="side-stat">
            <span class="label">Hours</span>
            <span class="value">${trip.hours || "Check site"}</span>
        </div>
        <div class="side-stat">
            <span class="label">Phone</span>
            <span class="value">${trip.phoneNumber || "N/A"}</span>
        </div>
    `;

    sideCol.innerHTML = infoHtml;
    // Add map container
    sideCol.appendChild(miniMapContainer);

    // Add Link
    const linkBtn = document.createElement("a");
    linkBtn.href = googleMapsUrl;
    linkBtn.target = "_blank";
    linkBtn.className = "maps-link-btn-full";
    linkBtn.textContent = "Open in Google Maps ↗";
    sideCol.appendChild(linkBtn);

    grid.appendChild(mainCol);
    grid.appendChild(sideCol);
    content.appendChild(grid);
    detailWrapper.appendChild(content);
    container.appendChild(detailWrapper);

    // Initialize Map (Lazy load coords if needed)
    // We import dynamically to avoid top-level await issues if not desired, or just standard import
    // But importantly, we need coords.
    import("../services/api.js").then(async ({ getCoordinates }) => {
        const coords = await getCoordinates(trip);
        if (coords) {
            import("./mini-map.js").then(({ initMiniMap }) => {
                initMiniMap(miniMapId, coords, trip.name);
            });
        } else {
            miniMapContainer.style.display = "none";
        }
    });
}

function createTag(label) {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = label;
    return el;
}
