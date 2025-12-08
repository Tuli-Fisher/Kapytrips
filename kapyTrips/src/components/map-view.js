import { loadGoogleMaps } from "../services/google-maps.js";
import { getCoordinates } from "../services/api.js";

// Keep track of map instance and markers to avoid memory leaks or duplicates on re-render
let mapInstance = null;
let currentMarkers = [];
let infoWindow = null;

const BMG_COORDINATES = { lat: 40.096044749672394, lng: -74.22197586384449 };

export async function renderMapView(data, containerId = "map") {
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) return;

    // Initialize Map if not already done
    if (!mapInstance) {
        const googleMaps = await loadGoogleMaps();
        const { Map } = await googleMaps.importLibrary("maps");
        const { AdvancedMarkerElement } = await googleMaps.importLibrary("marker");

        mapInstance = new Map(mapContainer, {
            center: BMG_COORDINATES,
            zoom: 12,
            mapId: "DEMO_MAP_ID", // Required for Advanced Markers
        });

        infoWindow = new googleMaps.InfoWindow();

        // Add static marker for BMG (Base location?)
        const baseMarker = new AdvancedMarkerElement({
            map: mapInstance,
            position: BMG_COORDINATES,
            title: "Lakewood",
        });

        addInfoWindowEvents(baseMarker, "BMG", googleMaps);
    }

    // Clear existing markers
    currentMarkers.forEach(marker => marker.map = null);
    currentMarkers = [];

    if (!data || data.length === 0) return;

    const googleMaps = await loadGoogleMaps();
    const { AdvancedMarkerElement } = await googleMaps.importLibrary("marker");
    const bounds = new googleMaps.LatLngBounds();

    // Extend bounds to BMG
    bounds.extend(BMG_COORDINATES);

    // Process all attractions concurrently
    const validAttractions = await Promise.all(
        data.map(async (attraction) => {
            const coords = await getCoordinates(attraction);
            if (coords) {
                return { ...attraction, coords };
            }
            return null;
        })
    );

    validAttractions.forEach(item => {
        if (!item) return;

        const marker = new AdvancedMarkerElement({
            map: mapInstance,
            position: item.coords,
            title: item.name,
        });

        addInfoWindowEvents(marker, item.name, googleMaps);
        bounds.extend(item.coords);
        currentMarkers.push(marker);
    });

    if (currentMarkers.length > 0) {
        mapInstance.fitBounds(bounds);
    }
}

function addInfoWindowEvents(marker, content, googleMaps) {
    // Simplify events: click or hover
    // Original had "mouseenter" and "mouseout" with timeout

    marker.element.addEventListener("mouseenter", () => {
        if (!infoWindow) return;
        infoWindow.setContent(content);
        infoWindow.open({
            anchor: marker,
            map: mapInstance,
        });
    });

    marker.element.addEventListener("mouseleave", () => {
        // Optional: close on leave, or keep open until next hover
        // Original used timeout
        setTimeout(() => {
            // Logic to check if we are still over the marker or window could be complex
            // For now, simpler is better. Let's just close it.
            infoWindow.close();
        }, 3000);
    });
}
