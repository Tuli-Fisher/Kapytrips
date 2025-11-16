    (function(){
      parks.sort((a, b) => a.Distance - b.Distance);

      const container = document.getElementById("parksContainer");
      const detailView = document.getElementById("detailView");

      // ===== RENDER LIST =====
      function renderParks(list) {
        container.innerHTML = "";
        list.forEach((park) => {
          const card = document.createElement("div");
          card.className = "card";
          card.innerHTML = `
            <h2>${park.Name}</h2>
            <p>${park.Address}</p>
            <p class="time">~${park.Distance} min</p>
        `;
          card.addEventListener("click", () => showDetail(park));
          container.appendChild(card);
        });
      }

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
        container.style.display = "flex";
      });

      // ===== FILTER BUTTONS =====
      const toggleButtons = document.querySelectorAll(".toggle-btn");
      toggleButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          toggleButtons.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const type = btn.dataset.type;
          let filtered = parks;
          if (type === "park")
            filtered = parks.filter((p) => p.Type === "park");
          if (type === "attraction")
            filtered = parks.filter((p) => p.Type === "attraction");
          renderParks(filtered);
        });
      });

      // ===== INITIAL RENDER =====
      renderParks(parks);


      //////////maps////////
        

    
      }());