const PARK_URL = "https://opensheet.elk.sh/1lc-Lw7vvm3NXp4IvqvpU3i3s4h25MIG6M2dPm3t3T6U/parks";
const ATTRACTION_URL ="https://opensheet.elk.sh/1lc-Lw7vvm3NXp4IvqvpU3i3s4h25MIG6M2dPm3t3T6U/attractions";
const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

export async function fetchAllData() {
    try {
        const [parks, attractions] = await Promise.all([
            fetch(PARK_URL).then((r) => r.json()),
            fetch(ATTRACTION_URL).then((r) => r.json()),
        ]);

        const combined = [...parks, ...attractions]
            .filter((p) => p.name && p.name.trim() !== "")
            .map(item => ({
                ...item,
                // Ensure driveTime is a number for sorting
                driveTime: item.driveTime ? parseInt(item.driveTime, 10) : Infinity
            }));

        // Default sort by drive time
        combined.sort((a, b) => a.driveTime - b.driveTime);

        return combined;
    } catch (err) {
        console.error("Error loading data:", err);
        throw err;
    }
}

/**
 * Get coordinates for a location, either from existing props or geocoding API
 */
export async function getCoordinates(attraction) {
    // 1. Check if coordinates already exist on the object
    if (attraction.longitude && attraction.latitude) {
        return {
            lng: Number(attraction.longitude),
            lat: Number(attraction.latitude)
        };
    }

    // 2. Geocode address if needed
    if (attraction.address) {
        const encodedAddress = encodeURIComponent(attraction.address);
        try {
            const response = await fetch(
                `https://api.geoapify.com/v1/geocode/search?text=${encodedAddress}&apiKey=${GEOAPIFY_KEY}`
            );

            if (!response.ok) {
                throw new Error(`Geocode fetch error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const [lng, lat] = data.features[0].geometry.coordinates;
                console.log(`Geocoded '${attraction.name}':`, { lat, lng });
                return { lng, lat };
            }
        } catch (error) {
            console.error(`Error geocoding '${attraction.name}':`, error);
        }
    }

    return null;
}
