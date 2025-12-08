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
    backBtn.innerHTML = "← Back to Trips";
    backBtn.addEventListener("click", onBack);

    heroImage.appendChild(backBtn);
    detailWrapper.appendChild(heroImage);

    // Content Container
    const content = document.createElement("div");
    content.className = "detail-content";

    // Title & Header Info
    const header = document.createElement("header");
    header.className = "detail-header";

    const h2 = document.createElement("h2");
    h2.textContent = trip.name;
    header.appendChild(h2);

    const tags = document.createElement("div");
    tags.className = "tags";
    if (trip.category) tags.appendChild(createTag(trip.category));
    if (trip.type) tags.appendChild(createTag(trip.type));
    if (trip.good) tags.appendChild(createTag("Great for Kids"));
    if (trip.restrooms?.toLowerCase().includes("y")) tags.appendChild(createTag("Restrooms Available"));
    header.appendChild(tags);

    content.appendChild(header);

    // Main Grid Layout
    const grid = document.createElement("div");
    grid.className = "detail-grid";

    // Left Column: Key Info
    const mainInfo = document.createElement("div");
    mainInfo.className = "main-info";

    const description = document.createElement("p");
    description.className = "description";
    description.textContent = trip.description || "No description available.";
    mainInfo.appendChild(description);

    // Additional Details (Mocked for now if not in data)
    if (trip.longDescription) {
        const longDesc = document.createElement("div");
        longDesc.innerHTML = trip.longDescription; // Assuming safe HTML or text
        mainInfo.appendChild(longDesc);
    }

    grid.appendChild(mainInfo);

    // Right Column: Sidebar Info
    const sidebar = document.createElement("div");
    sidebar.className = "detail-sidebar";

    const metaBox = document.createElement("div");
    metaBox.className = "meta-box";

    metaBox.innerHTML = `
      <h3>Trip Details</h3>
      <div class="meta-item">
          <strong>Location</strong>
          <span>${trip.address || "N/A"}</span>
      </div>
      <div class="meta-item">
          <strong>Drive Time</strong>
          <span>${formatDriveTime(trip.driveTime)}</span>
      </div>
      <div class="meta-item">
          <strong>Hours</strong>
          <span>${trip.hours || "Check website"}</span>
      </div>
      <div class="meta-item">
          <strong>Phone</strong>
          <span>${trip.phoneNumber || "N/A"}</span>
      </div>
      <div class="meta-item">
        <strong>Coordinates</strong>
        <span>${trip.latitude || "N/A"}, ${trip.longitude || "N/A"}</span>
      </div>
  `;

    sidebar.appendChild(metaBox);
    grid.appendChild(sidebar);

    content.appendChild(grid);
    detailWrapper.appendChild(content);
    container.appendChild(detailWrapper);
}

function createTag(label) {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = label;
    return el;
}
