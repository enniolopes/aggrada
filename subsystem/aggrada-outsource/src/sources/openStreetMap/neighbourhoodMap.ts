// import axios from 'axios';

// export const neighborhoodCityMap = async ({
//   cityName,
// }: {
//   cityName: string;
// }) => {
//   const query = `
//   [out:json];
//   area["name"="${cityName}"]["boundary"="administrative"]->.cityArea;
//   (
//     relation["place"="neighbourhood"](area.cityArea);
//     way["place"="neighbourhood"](area.cityArea);
//     relation["boundary"="administrative"]["admin_level"="10"](area.cityArea); // Adicionando bairros classificados como áreas administrativas
//   );
//   out geom;
//   `;

//   const url =
//     'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);

//   const response = await axios.get(url);
//   const data = response.data;

//   return data.elements;
// };
