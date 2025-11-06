(async function(){
    'use strict';

    const bmg = { lat: 40.096044749672394, lng: -74.22197586384449 };
    let map;

    async function initMap(){
        
        const { Map } = await google.maps.importLibrary("maps");

        map = new Map(document.querySelector("#map"), {
            center: bmg,
            zoom: 15,
            mapId: 'DEMO_MAP_ID'
        });
    };

    await initMap();

    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

    const marker = new AdvancedMarkerElement({
        map,
        position: bmg,
        title: 'Home'
    });

    marker.addListener('click', () => {
        const infoWindow = new google.maps.InfoWindow({
            content: 'BMG'
        });
        infoWindow.open({
            anchor: marker,
            map,
        });
    });


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


    const attractions = await loadParks(attractionUrl);

    const testingArray = attractions?.slice(0,10);

    const bounds = new google.maps.LatLngBounds();

    // testingArray?.forEach(async (attraction) => {
    if(!testingArray || testingArray.length === 0) return;

    for (const attraction of testingArray){
        let coordinates=[];

        if(!attraction.longtitude || !attraction.latitude){

            const encodedAddress = encodeURIComponent(attraction.address);


            try{
                if(!encodedAddress){
                    console.error('Invalid address for attraction:', attraction);
                };

                var requestOptions = {
                    method: 'GET',
                };

                const result = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodedAddress}&apiKey=8aa441ac6237456fb8ca592512c9fee5`, requestOptions)
                
                if(!result.ok){
                    console.error("Geocode fetch error:", result.status, result.statusText, text);
                }

                const data = await result.json();

                console.log(attraction.name ,data.features[0].geometry.coordinates[0],data.features[0].geometry.coordinates[1]);

                coordinates = {
                    lng: data.features[0].geometry.coordinates[0],
                    lat: data.features[0].geometry.coordinates[1]
                }
               

            }catch(error){
                console.error('Error fetching geocode data:', error);
            }
        } else {
            coordinates = {
                lng: parseFloat(attraction.longtitude),
                lat: parseFloat(attraction.latitude)
            }
        }

        if(coordinates) {
            bounds.extend(coordinates);
        };

        const attractionMarker = new AdvancedMarkerElement({
            map,
            position: coordinates,
            title: attraction.name
        });

        attractionMarker.addListener('click', () => {
            const infoWindow = new google.maps.InfoWindow({
                content: attraction.name
            });
            infoWindow.open({
                anchor: attractionMarker,
                map,
            });
        });
    };
    map.fitBounds(bounds);
}());