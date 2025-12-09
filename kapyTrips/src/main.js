import "./style.css";
import { fetchAllData } from "./services/api.js";
import { renderParkList, setupFilters, filterData } from "./components/park-list.js";
import { renderMapView } from "./components/map-view.js";
import { renderAds } from "./components/ads.js";

import { renderTripDetail } from "./components/trip-detail.js";

// State
let allData = [];
let isMapView = false;
let lastScrollPosition = 0;

// DOM Elements
const switchElem = document.getElementById("viewSwitch");
const tilesContainer = document.getElementById("tiles");
const mapContainer = document.getElementById("map");
const noResultsInfo = document.getElementById("noresults");

async function init() {
  try {
    // Initialize Ads
    renderAds(document.getElementById("home-ads"), true);
    renderAds(document.getElementById("trips-ads"), false);

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

    // Navigation Logic
    setupNavigation();

  } catch (error) {
    console.error("Failed to initialize app:", error);
    tilesContainer.innerHTML = '<div class="no-results">Error loading data. Please try again later.</div>';
  }
}

function setupNavigation() {
  const navLinks = document.querySelectorAll("nav a");
  const exploreBtn = document.getElementById("explore-btn");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const viewId = link.getAttribute("data-view");
      switchView(viewId);

      // Update active state
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
      switchView("trips");
      // Update nav active state manually for the button
      navLinks.forEach(l => l.classList.remove("active"));
      document.querySelector('nav a[data-view="trips"]')?.classList.add("active");
    });
  }
}

function switchView(viewName) {
  // Hide all views
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.add("hidden");
  });

  // Show target view
  const targetView = document.getElementById(`${viewName}-view`);
  if (targetView) {
    targetView.classList.remove("hidden");
  }

  // Special handling for map resize when switching to trips view
  if (viewName === "trips" && isMapView) {
    updateView(); // Re-render to ensure map sizes correctly if needed
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

function handleTripClick(trip) {
  const detailContainer = document.getElementById("trip-detail-view");
  const tripsView = document.getElementById("trips-view");

  // Save scroll position
  lastScrollPosition = window.scrollY;

  // Render detail
  renderTripDetail(trip, detailContainer, () => {
    detailContainer.classList.add("hidden");
    tripsView.classList.remove("hidden");
    // Restore scroll position
    window.scrollTo(0, lastScrollPosition);
  });

  // Toggle views
  tripsView.classList.add("hidden");
  detailContainer.classList.remove("hidden");

  // Scroll to top
  window.scrollTo(0, 0);
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
    renderParkList(filteredData, tilesContainer, handleTripClick);
  }
}

init();
