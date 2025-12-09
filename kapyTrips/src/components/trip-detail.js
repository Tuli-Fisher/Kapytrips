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

    // Header Image
    const heroImage = document.createElement("div");
    heroImage.className = "detail-hero";
    heroImage.style.backgroundImage = `url('${trip.image || trip.pic || ""}')`;

    const backBtn = document.createElement("button");
    backBtn.className = "back-btn";
    backBtn.innerHTML = "← Back";
    backBtn.addEventListener("click", onBack);

    heroImage.appendChild(backBtn);
    detailWrapper.appendChild(heroImage);

    // Content Container
    const content = document.createElement("div");
    content.className = "detail-content";

    // Header with Title and Tags
    const header = document.createElement("header");
    header.className = "detail-header";

    const titleRow = document.createElement("div");
    titleRow.className = "title-row";

    const h2 = document.createElement("h2");
    h2.textContent = trip.name;
    titleRow.appendChild(h2);

    const tags = document.createElement("div");
    tags.className = "tags";
    if (trip.category) tags.appendChild(createTag(trip.category));
    if (trip.type) tags.appendChild(createTag(trip.type));

    header.appendChild(titleRow);
    header.appendChild(tags);
    content.appendChild(header);

    // Compact Stats Bar (Replaces Sidebar)
    const statsBar = document.createElement("div");
    statsBar.className = "stats-bar";

    const driveTime = formatDriveTime(trip.driveTime);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        trip.address || `${trip.latitude},${trip.longitude}`
    )}`;

    statsBar.innerHTML = `
        <div class="stat-item">
            <strong>Location</strong>
            <span>${trip.address || "N/A"}</span>
        </div>
        <div class="stat-item">
            <strong>Time</strong>
            <span>${driveTime}</span>
        </div>
        <div class="stat-item">
            <strong>Hours</strong>
            <span>${trip.hours || "Check site"}</span>
        </div>
        <div class="stat-item">
            <strong>Phone</strong>
            <span>${trip.phoneNumber || "N/A"}</span>
        </div>
        <a href="${googleMapsUrl}" target="_blank" class="maps-link-btn">
            Open in Maps ↗
        </a>
    `;

    content.appendChild(statsBar);

    // Description Section
    const descriptionBox = document.createElement("div");
    descriptionBox.className = "description-box";

    const description = document.createElement("p");
    description.className = "description";
    description.textContent = trip.description || "No description available.";
    descriptionBox.appendChild(description);

    if (trip.good) {
        const extraTag = document.createElement("div");
        extraTag.className = "extra-info";
        extraTag.innerHTML = `<strong>Good for:</strong> ${trip.good}`;
        descriptionBox.appendChild(extraTag);
    }

    // Restrooms check
    if (trip.restrooms?.toLowerCase().includes("y")) {
        const toiletTag = document.createElement("div");
        toiletTag.className = "extra-info";
        toiletTag.innerHTML = `<strong>Restrooms:</strong> Available`;
        descriptionBox.appendChild(toiletTag);
    }

    content.appendChild(descriptionBox);
    detailWrapper.appendChild(content);
    container.appendChild(detailWrapper);
}

function createTag(label) {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = label;
    return el;
}
