'use strict';


async function mapMaker(mapArray){

    if(!mapArray || mapArray.length === 0) return;

    const bmg = { lat: 40.096044749672394, lng: -74.22197586384449 };
    let map;
   
    async function initMap(){
        
        const { Map } = await google.maps.importLibrary("maps");

        map = new Map(document.querySelector("#map"), {
            center: bmg,
            zoom: 12,
            mapId: 'DEMO_MAP_ID'
        });
    };

    await initMap();

    const bounds = new google.maps.LatLngBounds();
    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

    const marker = new AdvancedMarkerElement({
        map,
        position: bmg,
        title: 'Lakewood'
    });

    const infoWindow = new google.maps.InfoWindow({
        content: 'BMG'
    });

    marker.element.addEventListener("mouseenter", () => {
        infoWindow.open({
            anchor: marker,
            map,
        });
    });

    marker.element.addEventListener('mouseout',()=>{
        infoWindow.close()
    });

    

    for (const attraction of mapArray){
        let coordinates ;

        if(!attraction.address){
            console.error('Invalid address for attraction:', attraction);
            continue;
        };

        try{
            //if(!attraction.longitude || !attraction.latitude){;
                coordinates = await getCoordinates(attraction);
            //}
        } catch(error){
            console.error('Error getting coordinates for attraction:', attraction, error);
            continue;
        }

        if(coordinates) {
            bounds.extend(coordinates);
        };

        const attractionMarker = new AdvancedMarkerElement({
            map,
            position: coordinates,
            title: attraction.name
        });

        const infoWindow = new google.maps.InfoWindow({
            content: attraction.name
        });

        attractionMarker.element.addEventListener('mouseover', () => {
           
            infoWindow.open({
                anchor: attractionMarker,
                map,
            });
        });

        attractionMarker.element.addEventListener('mouseout',()=>{
            setTimeout(infoWindow.close(),1000);
        });
    };
    map.fitBounds(bounds);

};

async function getCoordinates(attraction) {
    let coordinates=[];

    if(!attraction.longitude || !attraction.latitude){

        const encodedAddress = encodeURIComponent(attraction.address);

        try{

            var requestOptions = {
                method: 'GET',
            };

            const result = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodedAddress}&apiKey=8aa441ac6237456fb8ca592512c9fee5`, requestOptions)
                
            if(!result.ok){
                console.error("Geocode fetch error:", result.status, result.statusText);
            }

            const data = await result.json();

            console.log('went to get coordinates',attraction.name ,data.features[0].geometry.coordinates[0],data.features[0].geometry.coordinates[1]);

            coordinates = {
                lng: Number(data.features[0].geometry.coordinates[0]),
                lat: Number(data.features[0].geometry.coordinates[1])
            }
               

        }catch(error){
            console.error('Error fetching geocode data:', error);
        }

    } else{
        coordinates = { lng: Number(attraction.longitude), lat: Number(attraction.latitude)}
    }

    return coordinates;
}


