'use strict';

const parkUrl ="https://opensheet.elk.sh/1lc-Lw7vvm3NXp4IvqvpU3i3s4h25MIG6M2dPm3t3T6U/Sheet1";
        
const attractionUrl ="https://opensheet.elk.sh/1lR_-c5QGmLBjVOOOCHvOcEuTVGIWg6u3uubtcCaeOk4/Sheet1";

// const AMEN_EMOJI = {
//     playground: "🛝",
//     restrooms: "🚻",
//     walking: "🚶‍♀️",
//     bike: "🚴‍♂️",
//     good: "🧒",
//     category: "🏷️",
//     type: "🏞️",
// };

let allData = [];
let filteredData;

async function loadData() {
    try {
        const [parks, attractions] = await Promise.all([
            fetch(parkUrl).then((r) => r.json()),
            fetch(attractionUrl).then((r) => r.json()),
        ]);
        allData = [...parks, ...attractions];
        buildFilters(allData);
        render(allData);
    } catch (err) {
        console.error(err);
        document.getElementById("tiles").innerHTML =
            '<div class="no-results">Error loading data.</div>';
    }
}

function buildFilters(data) {
    const typeSel = document.getElementById("typeFilter");
    const types = [...new Set(data.map((d) => d.type).filter(Boolean))];
    typeSel.innerHTML =
    '<option value="">All types</option>' +
    types.map((t) => `<option>${t}</option>`).join("");

    const attractionFilter = document.getElementById("attrTypeFilter");
    const attractionTypes = [...new Set(data.map((d) => d.category).filter(Boolean))];
    attractionFilter.innerHTML =
    '<option value="">All types</option>' +
    attractionTypes.map((t) => `<option>${t.toLowerCase()}</option>`).join("");

    // const amenSel = document.getElementById("amenityFilter");
    // const amenities = Object.keys(AMEN_EMOJI);
    // amenSel.innerHTML =
    // '<option value="">Any amenity</option>' +
    // amenities.map((a) => `<option>${a}</option>`).join("");
}

function tag(label) {
    const el = document.createElement("div");
    el.className = "tag";
    el.textContent = label;
    return el;
}

function render(data = allData) {
    const wrap = document.getElementById("tiles");
    const nores = document.getElementById("noresults");
    wrap.innerHTML = "";

    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const type = document.getElementById("typeFilter").value.toLowerCase();
    const attrType = document.getElementById("attrTypeFilter").value.toLowerCase();
    //const amen = document.getElementById("amenityFilter").value.toLowerCase();

    let items = data.filter((d) => {
        const text = Object.values(d).join(" ").toLowerCase();
        if (searchInput && !text.includes(searchInput)) return false;
        if (type && (d.type || "").toLowerCase() !== type) return false;
        if (attrType && (d.category || "").toLowerCase() !== attrType) return false;
        //if (amen && !d[amen]) return false;
        return true;
    });

    filteredData = items;

    nores.style.display = items.length ? "none" : "block";

    items.forEach((item) => {
        const tile = document.createElement("div");
        tile.className = "tile";

        const img = document.createElement("img");
        img.src = item.image || item.pic || "";
        img.alt = item.name || "";
        tile.appendChild(img);

        const content = document.createElement("div");
        content.className = "tile-content";

        const h3 = document.createElement("h3");
        h3.textContent = item.name || "whoops we seem to be missing something";
        content.appendChild(h3);

        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = [item.address, item.driveTime]
            .filter(Boolean)
            .join(" • ");
        content.appendChild(meta);

        const info = document.createElement("div");
        info.className = "info";
        info.innerHTML = `
            ${item.description ? `<p>${item.description}</p>` : ""}
            ${item.hours ? `<p><strong>Hours:</strong> ${item.hours}</p>` : ""}
            ${item.phoneNumber ? `<p><strong>Phone:</strong> ${item.phoneNumber}</p>` : ""}
          `;
        content.appendChild(info);

        const tags = document.createElement("div");
        tags.className = "tags";
        if (item.category) tags.appendChild(tag(item.category));
        if (item.type) tags.appendChild(tag(item.type));
        if (item.good) tags.appendChild(tag("Kids"));
        if(item.restrooms?.includes('y')) tags.appendChild(tag("Restrooms"));
        content.appendChild(tags);

        tile.appendChild(content);
        wrap.appendChild(tile);
    });
}

   
["searchInput", "typeFilter", /*"amenityFilter",*/"attrTypeFilter"].forEach((id) =>
    document.getElementById(id).addEventListener("input", () => render())
);

document.getElementById("reset").addEventListener("click", () => {
    document.querySelectorAll(".filters-grid input, .filters-grid select").forEach((el) => (el.value = ""));
        render();
    });

loadData();
