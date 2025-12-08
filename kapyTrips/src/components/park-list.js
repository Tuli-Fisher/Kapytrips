import { formatDriveTime } from "../utils/formatters.js";

/**
 * Render the list of parks/attractions to the DOM
 * @param {Array} data - List of items to render
 * @param {HTMLElement} container - Container element
 */
export function renderParkList(data, container, onTripClick) {
    container.innerHTML = "";

    if (data.length === 0) {
        // Handling no results is done by the caller usually, but we can verify here
        return;
    }

    data.forEach((item) => {
        const tile = document.createElement("div");
        tile.className = "tile";
        // Make it interactive
        tile.style.cursor = "pointer";
        tile.onclick = () => {
            if (onTripClick) onTripClick(item);
        };

        // Image
        const img = document.createElement("img");
        img.src = item.image || item.pic || "";
        img.alt = item.name || "Image";
        // Add default placeholder if needed or handle missing images CSS-side
        img.loading = "lazy";
        tile.appendChild(img);

        // Content
        const content = document.createElement("div");
        content.className = "tile-content";

        // Title
        const h3 = document.createElement("h3");
        h3.textContent = item.name || "Unknown Name";
        content.appendChild(h3);

        // Meta (Address • Time)
        const formattedTime = formatDriveTime(item.driveTime);
        const metaText = [item.address, formattedTime].filter(Boolean).join(" • ");

        if (metaText) {
            const meta = document.createElement("div");
            meta.className = "meta";
            meta.textContent = metaText;
            content.appendChild(meta);
        }

        // Info (Description, Hours, Phone)
        const info = document.createElement("div");
        info.className = "info";

        let infoHtml = "";
        if (item.description) infoHtml += `<p>${item.description}</p>`;
        if (item.hours) infoHtml += `<p><strong>Hours:</strong> ${item.hours}</p>`;
        if (item.phoneNumber) infoHtml += `<p><strong>Phone:</strong> ${item.phoneNumber}</p>`;

        info.innerHTML = infoHtml;
        content.appendChild(info);

        // Tags
        const tags = document.createElement("div");
        tags.className = "tags";

        if (item.category) tags.appendChild(createTag(item.category));
        if (item.type) tags.appendChild(createTag(item.type));
        if (item.good) tags.appendChild(createTag("Kids"));
        if (item.restrooms?.toLowerCase().includes("y")) tags.appendChild(createTag("Restrooms"));

        content.appendChild(tags);
        tile.appendChild(content);
        container.appendChild(tile);
    });
}

function createTag(label) {
    const el = document.createElement("div");
    el.className = "tag";
    el.textContent = label;
    return el;
}

export function setupFilters(data, onFilterChange) {
    // Populate Type Filter
    const typeSel = document.getElementById("typeFilter");
    const types = [...new Set(data.map((d) => d.type).filter(Boolean))];

    if (typeSel) {
        typeSel.innerHTML = '<option value="">All types</option>' +
            types.map((t) => `<option value="${t.toLowerCase()}">${t}</option>`).join("");
    }

    // Populate Category Filter
    const attractionFilter = document.getElementById("attrTypeFilter");
    const attractions = [...new Set(data.map((d) => d.category).filter(Boolean))];

    if (attractionFilter) {
        attractionFilter.innerHTML = '<option value="">All types</option>' +
            attractions.map((t) => `<option value="${t.toLowerCase()}">${t}</option>`).join("");
    }

    // Attach Listeners
    const inputIds = ["sortOrder", "searchInput", "typeFilter", "attrTypeFilter"];
    inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", onFilterChange);
        }
    });

    // Reset Button
    const resetBtn = document.getElementById("reset");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            document.querySelectorAll(".filters-grid input, .filters-grid select")
                .forEach((el) => (el.value = ""));
            onFilterChange();
        });
    }

    // Dependent Filter Logic (Park vs other types)
    if (typeSel) {
        typeSel.addEventListener("input", (e) => {
            const attrTypeFilter = document.querySelector("#attrTypeFilter");
            if (attrTypeFilter) {
                // Reset value whenever type changes
                attrTypeFilter.value = "";

                if (e.target.value === "park") {
                    attrTypeFilter.classList.add("hidden");
                } else {
                    attrTypeFilter.classList.remove("hidden");
                }

                // Force re-render to pick up the cleared value ensuring the list is correct
                onFilterChange();
            }
        });
    }
}

export function filterData(data, filters) {
    const { searchQuery, type, attrType, sortOrder } = filters;

    let filtered = data.filter(d => {
        const text = Object.values(d).join(" ").toLowerCase();

        if (searchQuery && !text.includes(searchQuery)) return false;
        if (type && (d.type || "").toLowerCase() !== type) return false;
        if (attrType && (d.category || "").toLowerCase() !== attrType) return false;

        return true;
    });

    // Sorting
    if (sortOrder === "distance") {
        filtered.sort((a, b) => (a.driveTime || Infinity) - (b.driveTime || Infinity));
    } else if (sortOrder === "name") {
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return filtered;
}
