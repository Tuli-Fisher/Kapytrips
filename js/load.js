(async function(){
    'use strict';


    const parkUrl = 'https://opensheet.elk.sh/1lc-Lw7vvm3NXp4IvqvpU3i3s4h25MIG6M2dPm3t3T6U/Sheet1';
    const attractionUrl = 'https://opensheet.elk.sh/1lR_-c5QGmLBjVOOOCHvOcEuTVGIWg6u3uubtcCaeOk4/Sheet1';

    async function loadParks(url) {
        try {
            const response = await fetch(url);
           
            if (!response.ok) {
                const text = await response.text();
                console.error("Fetch error:", response.status, response.statusText, text);
                return;
            }

            return response.json();

        } catch (error) {
            console.error('Error loading park data:', error);
        }
    }

    //  const container = document.querySelector('.container');
    //         container.innerHTML = '';

    //         for (const p of data) {
    //         container.innerHTML += `
    //             <div class="card">
    //             <h2>${p.park}</h2>
    //             <p>${p.location}</p>
    //             <p class="time">${p.distance}</p>
    //             </div>`;
    //         }

    

    const parks = await loadParks(parkUrl);
    const attractions = await loadParks(attractionUrl);

    parks?.sort((a, b) => a.Distance - b.Distance);
    attractions?.sort((a, b) => a.Distance - b.Distance);

    const container = document.querySelector(".trip-grid");

    function renderParks(list) {
        container.innerHTML = "";
        list?.forEach((park) => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <h2>${park.name}</h2>
                <p>${park.address}</p>
                <p class="time">~${park.driveTime} min</p>
            `;

            card.addEventListener("click", () => showDetail(park));

            container.appendChild(card);
        });
    };

    renderParks(parks);
    renderParks(attractions);


    const detailView = document.querySelector(".detailView");


    // ===== DETAIL VIEW =====
    function showDetail(park) {

        container.style.display = "none";

        detailView.style.display = "block";

        document.getElementById("parkName").innerText = park.Name;
        document.getElementById("parkAddress").innerText = park.Address;
        document.getElementById(
          "parkDistance"
        ).innerText = `Distance: ~${park.Distance} min`;
        document.getElementById("parkHours").innerText = `Hours: ${park.Hours}`;
        document.getElementById(
          "parkRestrooms"
        ).innerText = `Restrooms: ${park.Restrooms}`;
      }

      document.getElementById("backBtn").addEventListener("click", () => {
        detailView.style.display = "none";
        container.className = "trip-grid";
        container.style.display = "grid";
      });

      // ===== FILTER BUTTONS =====
    //   const toggleButtons = document.querySelectorAll(".toggle-btn");
    //   toggleButtons.forEach((btn) => {
    //     btn.addEventListener("click", () => {
    //       toggleButtons.forEach((b) => b.classList.remove("active"));
    //       btn.classList.add("active");
    //       const type = btn.dataset.type;
    //       let filtered = parks;
    //       if (type === "park")
    //         filtered = parks.filter((p) => p.Type === "park");
    //       if (type === "attraction")
    //         filtered = parks.filter((p) => p.Type === "attraction");
    //       renderParks(filtered);
    //     });
    //   });

})();