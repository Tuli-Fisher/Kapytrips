
/**
 * Render the ads to the specified container.
 * @param {HTMLElement} container - The element to render ads into.
 * @param {boolean} horizontal - Whether to render horizontally (e.g. for home page).
 */
export function renderAds(container, horizontal = false) {
    if (!container) return;

    // Images based on user's current 'index.html'
    const ads = [
        { src: "./ChatGPT Image Oct 20, 2025, 01_51_31 PM.png", alt: "Ad 1" },
        { src: "./withSign.png", alt: "Ad 2" },
        { src: "./ChatGPT Image Sep 29, 2025, 08_17_43 PM.png", alt: "Ad 3" }
    ];

    container.innerHTML = "";
    container.classList.add("ads-container");
    if (horizontal) {
        container.classList.add("ads-horizontal");
        container.classList.remove("ads-vertical");
    } else {
        container.classList.add("ads-vertical");
        container.classList.remove("ads-horizontal");
    }

    ads.forEach(ad => {
        const adDiv = document.createElement("div");
        adDiv.className = "ad-item";

        const label = document.createElement("span");
        label.className = "ad-label";
        label.textContent = "Powered By";
        adDiv.appendChild(label);

        const img = document.createElement("img");
        img.src = ad.src;
        img.alt = ad.alt;
        img.loading = "lazy";

        adDiv.appendChild(img);
        container.appendChild(adDiv);
    });
}
