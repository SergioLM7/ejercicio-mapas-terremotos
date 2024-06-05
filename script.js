//VARIABLES
const map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//EVENTOS


//FUNCIONES
//Función para llamar a la API de los terremotos
const accesoAPI = async () => {
    try {
        const respuesta = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
            { method: 'GET' });
        if (respuesta.ok) {
            let respuestaOK = await respuesta.json();
            let datosTerremotos = respuestaOK.features;
            console.log(datosTerremotos)
            getCoordinates(datosTerremotos);
        } else {
            return Promise.reject(new Error(`¡Error HTTP! Estado: ${respuesta.status}`));
        }
    } catch (error) {
        throw console.log(`Este es el error: ${error}`);
    }
};

//Función para sacar las coordenadas de los terremotos
const getCoordinates = (datos) => {

    datos.forEach(element => {
        const coordinates = element.geometry.coordinates;
        console.log(coordinates)
        const marker = L.marker([coordinates[1], coordinates[0]]).addTo(map);
    });


}

accesoAPI();


//properties.mag => magnitud (decimal)
//properties.magType => tipo magnitud (string)
//properties.places => lugar más cercano (string)
//properties.time => fecha del evento (Long Integer)
//properties.code => código único (string)
//geometry.coordinates[0, 1] -> coordenadas del terremoto
//geometry.coordinates[2] -> profundidad del terremoto