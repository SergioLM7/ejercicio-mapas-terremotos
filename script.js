//VARIABLES
const map = L.map('map');
const selectMagnitude = document.querySelector('#selectMagnitude');
const divMapas = document.querySelector('#map');
const buttonAll = document.querySelector('#allEarthquakes');
const layerGroup = L.layerGroup();
let marker;

//Capa del mapa
const mapTile = () => {
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'jpg'
    }).addTo(map);
};


//EVENTOS
//Evento para pintar los últimos terremotos tras el click en el botón
buttonAll.addEventListener('click', () => accesoAPI());

//Evento del filter por magnitud
selectMagnitude.addEventListener('change', evento => {
    if (evento.target.value === 'desviacion') {
        accesoAPI2(0, 0.99);
    } else if (evento.target.value === 'anomalia') {
        accesoAPI2(1, 1.99);
    } else if (evento.target.value === 'incidente') {
        accesoAPI2(2, 2.99);
    } else if (evento.target.value === 'icidente+') {
        accesoAPI2(3, 3.99);
    } else if (evento.target.value === 'accidente') {
        accesoAPI2(4, 4.99);
    } else if (evento.target.value === 'accidente+') {
        accesoAPI2(5, 5.99);
    } else if (evento.target.value === 'accidente++') {
        accesoAPI2(6, 6.99);
    } else if (evento.target.value === 'grave') {
        accesoAPI2(6.999, 9);
    }
});

//FUNCIONES
//Función para configurar el punto inicial del mapa
const initialLocation = () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            let datos = [position.coords.latitude.toFixed(4), position.coords.longitude.toFixed(4)];
            map.setView(datos, 4);
            L.marker(datos).addTo(map);

        });
    } else {
        console.warn("Tu navegador no soporta Geolocalización!! ");
        L.marker([40.25, -3.42]).addTo(map);
        map.setView([40.25, -3.42], 4)
    };
};

//Función
const markersMap = (coords) => {
    if (map.hasLayer(layerGroup)) {
      console.log('already have one, clear it');
      layerGroup.clearLayers();
    } else {
      console.log('never have it before');
      const marker = L.marker(coords);
      layerGroup.addLayer(marker);
      map.addLayer(layerGroup);
    }
  };

//Función para llamar a la API de los terremotos
const accesoAPI = async () => {
    try {
        const respuesta = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
            { method: 'GET' });
        if (respuesta.ok) {
            let respuestaOK = await respuesta.json();
            let datosTerremotos = respuestaOK.features;
            getCoordinates(datosTerremotos);
        } else {
            return Promise.reject(new Error(`¡Error HTTP! Estado: ${respuesta.status}`));
        }
    } catch (error) {
        throw console.log(`Este es el error: ${error}`);
    }
};

//Función para sacar las coordenadas de los terremotos
//y añadirle el popup con sus respectivos datos
const getCoordinates = (datos) => {

    datos.forEach(element => {
        const coordinates = element.geometry.coordinates;
        marker = L.marker([coordinates[1], coordinates[0]])
        layerGroup.addLayer(marker);
        map.addLayer(layerGroup);
        const magnitude = element.properties.mag;
        const title = element.properties.title;
        const code = element.properties.code;
        const place = element.properties.place;
        const magType = element.properties.magType;
        const date = element.properties.time;
        const dateToString = new Date(date);
        if (magnitude >= 0 && magnitude < 1) {
            console.log("huechange")
            marker._icon.classList.add("huechange");
        } else if (magnitude >= 1 && magnitude < 2) {
            console.log("huechange2")

            marker._icon.classList.add("huechange2");
        } else if (magnitude >= 2 && magnitude < 3) {
            console.log("huechange3")

            marker._icon.classList.add("huechange3");
        } else if (magnitude >= 3 && magnitude < 4) {
            console.log("huechange4")

            marker._icon.classList.add("huechange4");
        } else if (magnitude >= 4 && magnitude < 5) {
            console.log("huechange5")

            marker._icon.classList.add("huechange5");
        } else if (magnitude >= 5 && magnitude < 6) {
            console.log("huechange6")

            marker._icon.classList.add("huechange6");
        } else if (magnitude >= 6 && magnitude < 7) {
            console.log("huechange7")

            marker._icon.classList.add("huechange7");
        } else if (magnitude >= 7) {
            console.log("huechange8")
            marker._icon.classList.add("huechange8");
        }

        marker.bindPopup(`<b>${title}</b><br>Date:${dateToString}<br>Place:${place}<br>Magnitude & type:${magnitude}${magType}<br>Code:${code}<br>`);
    });
};

//Función para acceder a la API por segunda vez en función de los filtros seleccionados
const accesoAPI2 = async (minMagnitude, maxMagnitude) => {
    try {
        const respuesta = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=${minMagnitude}&maxmagnitude=${maxMagnitude}`,
            { method: 'GET' });
        if (respuesta.ok) {
            let respuestaOK2 = await respuesta.json();
            let datosTerremotos = respuestaOK2.features;
            if (datosTerremotos.length>0) {
                layerGroup.clearLayers();
                getCoordinates(datosTerremotos);
            } else {
                alert('No hay terremotos de esta magnitud en nuestros registros.')
            }
            
        } else {
            return Promise.reject(new Error(`¡Error HTTP! Estado: ${respuesta.status}`));
        }
    } catch (error) {
        throw console.log(`Este es el error: ${error}`);
    }
};

//INVOCACIONES
mapTile();
initialLocation();




//properties.mag => magnitud (decimal)
//properties.magType => tipo magnitud (string)
//properties.places => lugar más cercano (string)
//properties.time => fecha del evento (Long Integer in ms)
//properties.code => código único (string)
//geometry.coordinates[0, 1] -> coordenadas del terremoto
//geometry.coordinates[2] -> profundidad del terremoto
