import "./style.css";
import { fetchAllData } from "./services/api.js";
import { renderParkList, setupFilters, filterData } from "./components/park-list.js";
import { renderMapView } from "./components/map-view.js";

// State
let allData = [];
let isMapView = false;

// DOM Elements
const switchElem = document.getElementById("viewSwitch");
const tilesContainer = document.getElementById("tiles");
const mapContainer = document.getElementById("map");
const noResultsInfo = document.getElementById("noresults");

async function init() {
  try {
    allData = await fetchAllData();

    // Initial Render
    updateView();
    setupFilters(allData, () => updateView());

    // Switch Listener
    if (switchElem) {
      switchElem.addEventListener("click", () => {
        isMapView = !isMapView;
        switchElem.classList.toggle("active", isMapView);
        toggleViewMode();
      });
    }

  } catch (error) {
    console.error("Failed to initialize app:", error);
    tilesContainer.innerHTML = '<div class="no-results">Error loading data. Please try again later.</div>';
  }
}

function toggleViewMode() {
  if (isMapView) {
    mapContainer.style.display = "block";
    tilesContainer.classList.add("hidden");
    updateView(); // Re-render map with current filters
  } else {
    mapContainer.style.display = "none";
    tilesContainer.classList.remove("hidden");
  }
}

function updateView() {
  // Get current filter values
  const searchInput = document.getElementById("searchInput");
  const typeFilter = document.getElementById("typeFilter");
  const attrTypeFilter = document.getElementById("attrTypeFilter");
  const sortOrder = document.getElementById("sortOrder");

  const filters = {
    searchQuery: searchInput?.value.toLowerCase() || "",
    type: typeFilter?.value.toLowerCase() || "",
    attrType: attrTypeFilter?.value.toLowerCase() || "",
    sortOrder: sortOrder?.value || "distance",
  };

  const filteredData = filterData(allData, filters);

  // Update No Results State
  if (noResultsInfo) {
    noResultsInfo.style.display = filteredData.length ? "none" : "block";
  }

  if (isMapView) {
    renderMapView(filteredData);
  } else {
    renderParkList(filteredData, tilesContainer);
  }
}

init();
