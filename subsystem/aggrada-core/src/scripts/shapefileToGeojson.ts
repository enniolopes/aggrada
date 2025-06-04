// import * as shapefile from 'shapefile';
// import { writeFile } from 'node:fs/promises';

// /**
//  * Converte um shapefile para GeoJSON.
//  *
//  * @param shpPath - Caminho para o arquivo .shp
//  * @param dbfPath - Caminho para o arquivo .dbf
//  * @param outputGeoJSON - Caminho para o arquivo de saída GeoJSON
//  */
// async function convertShapefileToGeoJSON(
//   shpPath: string,
//   dbfPath: string,
//   outputGeoJSON: string
// ): Promise<void> {
//   try {
//     // Abre o shapefile (a biblioteca já processa os arquivos auxiliares, como .shx)
//     const source = await shapefile.open(shpPath, dbfPath);
//     const features: any[] = [];

//     // Lê todas as feições do shapefile
//     while (true) {
//       const result = await source.read();
//       if (result.done) break;

//       // Para cada registro, cria um objeto Feature
//       const { geometry, properties } = result.value;
//       features.push({
//         type: "Feature",
//         geometry,
//         properties
//       });
//     }

//     // Cria o objeto GeoJSON com todas as features
//     const geojson = {
//       type: "FeatureCollection",
//       features
//     };

//     // Salva o GeoJSON em um arquivo
//     await writeFile(outputGeoJSON, JSON.stringify(geojson, null, 2));
//     console.log(`GeoJSON salvo em: ${outputGeoJSON}`);
//   } catch (error) {
//     console.error("Erro ao converter o shapefile:", error);
//   }
// }

// // Exemplo de uso:
// const shpFilePath = '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/areas-abrangencia-sjrp/abrangencias.shp';
// const dbfFilePath = '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-ingestor/.local/data/areas-abrangencia-sjrp/abrangencias.dbf';
// const outputGeoJSONPath = "abrangencia-sjrp.geojson";

// convertShapefileToGeoJSON(shpFilePath, dbfFilePath, outputGeoJSONPath);
