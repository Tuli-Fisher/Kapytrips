(function(){
    'use strict';

    async function loadParks() {
        try {
            const response = await fetch('https://opensheet.elk.sh/1lc-Lw7vvm3NXp4IvqvpU3i3s4h25MIG6M2dPm3t3T6U/Sheet1');
           
            const data = await response.json();

            const container = document.querySelector('.container');
            container.innerHTML = '';

            for (const p of data) {
            container.innerHTML += `
                <div class="card">
                <h2>${p.park}</h2>
                <p>${p.location}</p>
                <p class="time">${p.distance}</p>
                </div>`;
            }
        } catch (error) {
            console.error('Error loading park data:', error);
        }
    }

    async function loadattractions() {
        try {
            const response = await fetch('https://opensheet.elk.sh/1lR_-c5QGmLBjVOOOCHvOcEuTVGIWg6u3uubtcCaeOk4/Sheet1');
           
            const data = await response.json();

            const container = document.querySelector('.container');
            container.innerHTML = '';

            for (const a of data) {
            container.innerHTML += `
                <div class="card">
                <h2>${a.name}</h2>
                <p>${a.address}</p>
                <p class="time">${a.driveTime}</p>
                <p>${a.phoneNumber}</p>
                </div>`;
            }
        } catch (error) {
            console.error('Error loading park data:', error);
        }
    }

    loadParks();
    loadattractions();

})();