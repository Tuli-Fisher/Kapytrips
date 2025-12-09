import { g as m } from "./index-BWEeL1ml.js";
async function b(r) {
  const d = r.filter((e) => !((e.latitude && e.longitude) || !e.address));
  if (d.length === 0) {
    alert(
      "No items found that need geocoding (all items have lat/lng or missing address)."
    );
    return;
  }
  const a = d.length;
  console.log(`Starting geocoding for ${a} items...`);
  const o = document.createElement("div");
  (o.style.position = "fixed"),
    (o.style.bottom = "20px"),
    (o.style.right = "20px"),
    (o.style.background = "#333"),
    (o.style.color = "#fff"),
    (o.style.padding = "10px 20px"),
    (o.style.borderRadius = "5px"),
    (o.style.zIndex = "9999"),
    (o.textContent = `Geocoding ${a} items... please wait.`),
    document.body.appendChild(o);
  const l = d.map(async (e) => {
      try {
        const t = await m(e, !0);
        if (t)
          return {
            name: e.name,
            submitted_address: e.address,
            latitude: t.lat,
            longitude: t.lng,
            formatted: t.formatted || "",
            city: t.city || "",
            state: t.state || "",
            postcode: t.postcode || "",
            country: t.country || "",
            place_id: t.place_id || "",
            confidence: t.rank && t.rank.confidence ? t.rank.confidence : "",
          };
      } catch (t) {
        console.error(`Failed to geocode ${e.name}`, t);
      }
      return null;
    }),
    i = (await Promise.all(l)).filter(Boolean);
  if ((o.remove(), i.length === 0)) {
    alert("Could not geocode any of the missing items.");
    return;
  }
  const c = [
      [
        "Name",
        "Latitude",
        "Longitude",
        "Formatted Address",
        "City",
        "State",
        "Postcode",
        "Country",
        "Place ID",
        "Confidence",
        "Original Address",
      ].join(","),
    ],
    n = (e) => `"${String(e || "").replace(/"/g, '""')}"`;
  i.forEach((e) => {
    const t = [
      n(e.name),
      e.latitude,
      e.longitude,
      n(e.formatted),
      n(e.city),
      n(e.state),
      n(e.postcode),
      n(e.country),
      n(e.place_id),
      e.confidence,
      n(e.submitted_address),
    ];
    c.push(t.join(","));
  });
  const u = c.join(`
`),
    g = new Blob([u], { type: "text/csv;charset=utf-8;" }),
    f = URL.createObjectURL(g),
    s = document.createElement("a");
  s.setAttribute("href", f),
    s.setAttribute("download", "geocoded_updates.csv"),
    (s.style.visibility = "hidden"),
    document.body.appendChild(s),
    s.click(),
    document.body.removeChild(s);
}
export { b as exportMissingCoordinates };
