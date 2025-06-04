// import { Op } from 'sequelize';
// import { db } from '../db';
// import { fetchObservationsOffSet } from './fetchObservations';
// import { mapper, transformer } from '@simple4decision/aggrada-core';

// const CHUNK_SIZE = 1000;

// // Type definition for aggregated data entry at each space-time key
// export type AggregatedDataKeys = {
//   key_spatial_id: number;
//   key_spatial_geo_code: string | undefined;
//   key_spatial_source: string;
//   key_spatial_start_date: Date | undefined;
//   key_time_label: string;
//   key_time_start_date: Date;
//   key_time_end_date: Date;
// };

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export type AggregatedDataEntry = Record<string, any>;

// export const getAggregation = async ({
//   aoi,
//   subdivision,
//   subdivisionSource,
//   timeRange,
//   timeGranularity,
// }: {
//   aoi: (typeof db.AggradaSpatial)['prototype']['geometry'];
//   subdivision: keyof typeof mapper.adminLevelMap;
//   subdivisionSource: string; // ibge | openstreetmap | ...
//   timeRange: { start: Date; end: Date };
//   timeGranularity: keyof typeof mapper.timeGranularity;
// }): Promise<AggregatedDataEntry[]> => {

//   // 1. Retrieve geographic subdivisions (e.g., municipalities within São Paulo)
//   const subdivisions = await db.AggradaSpatial.findAll({
//     where: {
//       admin_level: subdivision,
//       source: subdivisionSource,
//       [Op.and]: db.sequelize.where(
//         db.sequelize.fn(
//           'ST_Within',
//           db.sequelize.col('geometry'),
//           db.sequelize.fn('ST_GeomFromGeoJSON', JSON.stringify(aoi))
//         ),
//         true
//       ),
//     },
//     attributes: ['id', 'geo_code', 'source', 'start_date'],
//     // attributes: ['id', 'geo_code', 'source', 'start_date', 'geometry'],
//   });

//   // 2. Generate temporal intervals based on time granularity
//   const temporalRanges = transformer.generateTimeIntervals({
//     timeRange,
//     granularity: timeGranularity,
//   });

//   // 3. Create unique key structure (space-time) for aggregation with all combinations of subdivisions and temporal ranges
//   const aggregationUniqueKeys: AggregatedDataKeys[] = subdivisions.flatMap(
//     (subdivision) => {
//       return temporalRanges.map(({ start, end, label }) => {
//         return {
//           key_spatial_id: subdivision.dataValues.id as number,
//           key_spatial_geo_code: subdivision.dataValues.geo_code,
//           key_spatial_source: subdivision.dataValues.source,
//           key_spatial_start_date: subdivision.dataValues.start_date,
//           key_time_label: label,
//           key_time_start_date: start,
//           key_time_end_date: end,
//         };
//       });
//     }
//   );

//   // const aggregatedData: AggregatedDataEntry[] = [];

//   for (let i = 0; i < aggregationUniqueKeys.length; i++) {
//     const keyItem = aggregationUniqueKeys[i];

//     const subdivisionGeometry = (await db.AggradaSpatial.findOne({
//       where: {
//         id: keyItem.key_spatial_id,
//       },
//       attributes: ['geometry'],
//     }))?.dataValues.geometry;

//       console.log('Conexão com o banco de dados estabelecida.');

//       let offset = 0;
//       let hasMore = true;

//       while (hasMore) {
//         // Read observation data in chunks
//         const chunkObservations = await fetchObservationsOffSet({
//           inputGeometry: subdivisionGeometry,
//           timeRange: {
//             start: keyItem.key_time_start_date,
//             end: keyItem.key_time_end_date,
//           },
//           limit: CHUNK_SIZE,
//           offset,
//         })

//         if (chunkObservations.length === 0) {
//           hasMore = false;
//           break;
//         }

//         console.log(`Processando chunk com ${observations.length} observações...`);

//         // Agrega os dados do chunk
//         const aggregatedData: Record<string, Record<string, any[]>> = {};

//         for (const obs of observations) {
//           const spatialId = obs.aggrada_spatials_id;
//           const temporalRange = obs.temporal_range;
//           const data = obs.data as Record<string, any>;

//           // Constrói chaves baseadas no spatialId e período
//           const key = `${spatialId}_${temporalRange}`;

//           if (!aggregatedData[key]) {
//             aggregatedData[key] = { cidade: spatialId.toString(), periodo: temporalRange.toString() };
//           }

//           // Agrega os dados
//           for (const [variable, value] of Object.entries(data)) {
//             if (!aggregatedData[key][variable]) {
//               aggregatedData[key][variable] = [];
//             }
//             aggregatedData[key][variable].push(value);
//           }
//         }

//         // Salva dados agregados no banco
//         for (const [key, aggregated] of Object.entries(aggregatedData)) {
//           const [spatialId, temporalRange] = key.split('_');

//           await AggradaObservation.upsert({
//             aggrada_spatials_id: parseInt(spatialId, 10),
//             temporal_range: JSON.parse(temporalRange),
//             data: aggregated,
//           });
//         }

//         offset += CHUNK_SIZE;
//         console.log(`Chunk processado. Offset atualizado para ${offset}.`);
//       }

//   }

// ////////////////////////////

//   await Promise.all(
//     aggregationUniqueKeys.map(async (keyItem) => {
//       const subdivisionGeometry = subdivisions.find((subdivision) => {
//         return subdivision.dataValues.id == keyItem.key_spatial_id;
//       });

//       if (!subdivisionGeometry?.dataValues?.geometry) {
//         throw new Error('Subdivision geometry not found');
//       }

//       const observations = await fetchObservations({
//         inputGeometry: subdivisionGeometry.dataValues.geometry,
//         timeRange: {
//           start: keyItem.key_time_start_date,
//           end: keyItem.key_time_end_date,
//         },
//       });

//       if (!observations || observations.length === 0) {
//         return keyItem;
//       }

//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const aggregatedRecord: Record<string, any[]> = {};

//       observations.forEach((obs) => {
//         Object.entries(obs.data).forEach(([key, value]) => {
//           // Ensure each key has a corresponding array in aggregatedData
//           if (!aggregatedRecord[key]) {
//             aggregatedRecord[key] = [];
//           }
//           aggregatedRecord[key].push(value);
//         });
//       });

//       aggregatedData.push({
//         ...keyItem,
//         ...aggregatedRecord,
//       });

//       return;
//     })
//   );

//   return aggregatedData;
// };
