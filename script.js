//VARIABLES
const map = L.map('map');
const selectMagnitude = document.querySelector('#selectMagnitude');
const divMapas = document.querySelector('#map');
const buttonAll = document.querySelector('#allEarthquakes');
const layerGroup = L.layerGroup();
const endDateDefault = document.querySelector('#endDate');
const startDateElement = document.querySelector('#startDate');
const buttonFilter = document.querySelector('#submitDate');
let markerEarthquakes;
const myPin = L.icon({
    iconUrl: './assets/myPin.svg',
    iconSize:     [44, 44], 
    shadowSize:   [50, 64], 
    iconAnchor:   [15, 30], 
    shadowAnchor: [4, 62],  
    popupAnchor:  [-3, -76] 
});



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
        accesoAPIMagnitud(0, 0.99);
    } else if (evento.target.value === 'anomalia') {
        accesoAPIMagnitud(1, 1.99);
    } else if (evento.target.value === 'incidente') {
        accesoAPIMagnitud(2, 2.99);
    } else if (evento.target.value === 'icidente+') {
        accesoAPIMagnitud(3, 3.99);
    } else if (evento.target.value === 'accidente') {
        accesoAPIMagnitud(4, 4.99);
    } else if (evento.target.value === 'accidente+') {
        accesoAPIMagnitud(5, 5.99);
    } else if (evento.target.value === 'accidente++') {
        accesoAPIMagnitud(6, 6.99);
    } else if (evento.target.value === 'grave') {
        accesoAPIMagnitud(6.999, 9);
    }
});

//Evento para filtrar los terremotos por rango de fechas
buttonFilter.addEventListener('click', evento => {
    evento.preventDefault();
    const startDate = startDateElement.value;
    const endDate = endDateDefault.value
    accesoAPIFechas(startDate, endDate);
});

//FUNCIONES
//Función para configurar el punto inicial del mapa con geolocalización
const initialLocation = () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            let datos = [position.coords.latitude.toFixed(4), position.coords.longitude.toFixed(4)];
            map.setView(datos, 4);
            L.marker(datos, {draggable: true,icon: myPin}).addTo(map);

        });
    } else {
        console.warn("Tu navegador no soporta Geolocalización!! ");
        L.marker([40.25, -3.42], {draggable: true,icon: myPin}).addTo(map);
        map.setView([40.25, -3.42], 4)
    };
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
        markerEarthquakes = L.marker([coordinates[1], coordinates[0]])
        layerGroup.addLayer(markerEarthquakes);
        map.addLayer(layerGroup);
        const magnitude = element.properties.mag;
        const title = element.properties.title;
        const code = element.properties.code;
        const place = element.properties.place;
        const magType = element.properties.magType;
        const date = element.properties.time;
        const dateToString = new Date(date);
        if (magnitude >= 0 && magnitude < 1) {
            markerEarthquakes._icon.classList.add("huechange");
        } else if (magnitude >= 1 && magnitude < 2) {
            markerEarthquakes._icon.classList.add("huechange2");
        } else if (magnitude >= 2 && magnitude < 3) {
            markerEarthquakes._icon.classList.add("huechange3");
        } else if (magnitude >= 3 && magnitude < 4) {
            markerEarthquakes._icon.classList.add("huechange4");
        } else if (magnitude >= 4 && magnitude < 5) {
            markerEarthquakes._icon.classList.add("huechange5");
        } else if (magnitude >= 5 && magnitude < 6) {
            markerEarthquakes._icon.classList.add("huechange6");
        } else if (magnitude >= 6 && magnitude < 7) {
            markerEarthquakes._icon.classList.add("huechange7");
        } else if (magnitude >= 7) {
            markerEarthquakes._icon.classList.add("huechange8");
        }

        markerEarthquakes.bindPopup(`<b>${title}</b><br>Date:${dateToString}<br>Place:${place}<br>Magnitude & type:${magnitude}${magType}<br>Code:${code}<br>`);
    });
};

//Función para acceder a la API por segunda vez en función de los filtros seleccionados
const accesoAPIMagnitud = async (minMagnitude, maxMagnitude) => {
    try {
        const respuesta = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=${minMagnitude}&maxmagnitude=${maxMagnitude}`,
            { method: 'GET' });
        if (respuesta.ok) {
            let respuestaOK2 = await respuesta.json();
            let datosTerremotos = respuestaOK2.features;
            if (datosTerremotos.length > 0) {
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

//Función para acceder a la API por segunda vez en función de los filtros seleccionados
const accesoAPIFechas = async (startDate, endDate) => {
    try {
        const respuesta = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startDate}&endtime=${endDate}`,
            { method: 'GET' });
        if (respuesta.ok) {
            let respuestaOK3 = await respuesta.json();
            let datosTerremotos = respuestaOK3.features;
            console.log(datosTerremotos)
            if (datosTerremotos.length > 0) {
                layerGroup.clearLayers();
                getCoordinates(datosTerremotos);
            } else {
                alert('No se registraron terremotos en este rango de fechas.')
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
