import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCoordinates } from "../services/api.js";
import { formatDriveTime } from "../utils/formatters.js";

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
// BMG Location
const BMG_COORDINATES = { lat: 40.096044749672394, lng: -74.22197586384449 };

let map = null;
let markers = [];

export async function renderMapView(data, containerId = "map") {
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) return;

    // Initialize Map if not already done
    if (!map) {
        map = L.map(containerId).setView([BMG_COORDINATES.lat, BMG_COORDINATES.lng], 10);

        // Add Geoapify Tile Layer
        L.tileLayer(
            `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`,
            {
                attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © OpenStreetMap',
                maxZoom: 20,
            }
        ).addTo(map);

        // Add Base Marker
        L.marker([BMG_COORDINATES.lat, BMG_COORDINATES.lng])
            .addTo(map)
            .bindPopup("<b>BMG</b><br>Lakewood");
    }

    // Clear existing markers (except base marker if we wanted to keep it separate, but simpler to just clear 'markers' array which we track)
    // Note: The base marker above is not in the 'markers' array, so it persists.
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    // In case the map was hidden or resized
    setTimeout(() => map.invalidateSize(), 100);

    if (!data || data.length === 0) return;

    // Process attractions to get coordinates
    // We reuse the existing getCoordinates which now (transparently) returns {lat, lng} (and more if requested)
    const validAttractions = await Promise.all(
        data.map(async (attraction) => {
            // Note: We still need lat/lng for placing the marker.
            // Even if we had a place_id, Leaflet needs [lat, lng] to draw it.
            const coords = await getCoordinates(attraction);
            if (coords) {
                return { ...attraction, coords };
            }
            return null;
        })
    );

    const bounds = L.latLngBounds([
        [BMG_COORDINATES.lat, BMG_COORDINATES.lng]
    ]);

    validAttractions.forEach(item => {
        if (!item) return;

        const { lat, lng } = item.coords;
        const marker = L.marker([lat, lng])
            .addTo(map);

        // Hover Effect using Tooltip
        marker.bindTooltip(`<b>${item.name}</b><br>${item.driveTime ? formatDriveTime(item.driveTime) : ''}`, {
            direction: 'top',
            offset: [0, -20],
            opacity: 0.9
        });

        // Click to Open Details (Popup with "See Details" link)
        const popupContent = document.createElement("div");
        popupContent.innerHTML = `
            <div style="text-align:center;">
                <h4 style="margin:0 0 5px; color:#1ba6a3;">${item.name}</h4>
                <p style="margin:0 0 8px; font-size:12px;">${item.address || "N/A"}</p>
                <button class="map-detail-btn" style="
                    background: #1ba6a3; 
                    color: white; 
                    border: none; 
                    padding: 4px 8px; 
                    border-radius: 4px; 
                    cursor: pointer;
                    font-size: 12px;
                ">See Details</button>
            </div>
        `;

        // Handle button click inside popup
        const btn = popupContent.querySelector(".map-detail-btn");
        btn.onclick = () => {
            // We need to trigger the detail view. 
            // Since we don't have direct access to 'handleTripClick' here easily without a big refactor,
            // we will dispatch a custom event that main.js can listen to, or simpler: 
            // Just simulate a click on the tile if we could find it? 
            // Best approach: Dispatch event on window
            window.dispatchEvent(new CustomEvent('open-trip-detail', { detail: item }));
        };

        marker.bindPopup(popupContent);
        markers.push(marker);
        bounds.extend([lat, lng]);
    });

    if (markers.length > 0) {
        // fitBounds but with a maxZoom to prevent being too close, 
        // AND padding to stay loose.
        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 14 // Don't zoom in closer than street level
        });

        // If we want it "zoomed in slightly" relative to the bounds, 
        // we can physically zoom in one step further after fitting
        // map.setZoom(map.getZoom() + 1); 
        // But users asked for "zoomed in" likely meaning "don't show me the whole world", 
        // OR "items are stuck next to each other" implies they WANT to be zoomed in so markers separate.
        // Actually, "too many trips at once stuck right next to each other" -> Needs HIGHER zoom (closer to ground).
        // fitBounds does exactly that usually. 
        // If they are "stuck", it means we are too ZOOMED OUT.
        // So we should potentially increase the minimum zoom or pad less?
        // Actually, just letting fitBounds do its job is usually best. 
        // Maybe they meant "zoomed in" as in "Show me fewer items"? No.
        // "Zoom in slightly" after fitting bounds:
        // map.zoomIn(1); 
    }
}

