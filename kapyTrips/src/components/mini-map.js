import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons using CDN to avoid bundler asset issues
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

export function initMiniMap(containerId, coords, title) {
    const container = document.getElementById(containerId);
    if (!container) return; // Should not happen if logic is correct

    // Clean up if already initialized (simple check, or just assume container is fresh)
    if (container._leaflet_id) {
        // already initialized, remove old map if exists?? 
        // Leaflet doesn't support re-initialization on same element easily without remove()
        // But in our app flow, 'renderTripDetail' creates a new div every time, so this is likely safe.
    }

    const map = L.map(containerId, {
        center: [coords.lat, coords.lng],
        zoom: 13,
        zoomControl: false, // Keep it simple
        attributionControl: false // Minimal UI for mini map
    });

    L.tileLayer(
        `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`,
        { maxZoom: 20 }
    ).addTo(map);

    L.marker([coords.lat, coords.lng])
        .addTo(map)
        .bindPopup(title);

    // Fix render issues
    setTimeout(() => map.invalidateSize(), 200);

    return map;
}
