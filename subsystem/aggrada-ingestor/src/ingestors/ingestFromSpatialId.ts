// /* eslint-disable no-console */
// import 'dotenv/config';

// import { reader, transformer } from '@simple4decision/aggrada-core';
// import { db, indexer } from '@simple4decision/postgresdb';
// import { models } from '@simple4decision/postgresdb';

// const createObservation = async ({
//   geoCodeKey,
//   source,
//   adminLevel,
//   timeKey,
//   fixedTime,
//   timezone = 'America/Sao_Paulo', // ToDo: get timezone from state-country
//   data,
//   file,
// }: {
//   geoCodeKey: string;
//   source: string;
//   adminLevel: InstanceType<typeof models.AggradaSpatial>['adminLevel'];
//   timeKey?: string;
//   fixedTime?: string;
//   timezone?: string;
//   data: Record<string, string>;
//   file: string | Buffer;
// }) => {
//   if (timeKey && !data[timeKey]) {
//     throw Error('Data column for Time Index not founded');
//   }

//   const geoCodeSanitized = data[geoCodeKey].trim();
//   const sourceSanitized = source.trim();

//   const spatialId = await indexer
//     .getSpatialId({
//       geoCode: geoCodeSanitized,
//       source: sourceSanitized,
//       adminLevel,
//     })
//     .catch((error) => {
//       console.log('Spatial id not founded: ', error);
//       return null;
//     });

//   if (!spatialId?.aggrada_spatials_id) {
//     throw Error('Spatial id not founded');
//   }

//   const timeRange = transformer.createTimeRange({
//     date: timeKey ? data[timeKey] : fixedTime || '',
//     timezone,
//   });

//   if (!timeRange?.startTz) {
//     throw Error('Time range not processed');
//   }

//   const observationRecord = {
//     aggradaSpatialId: spatialId.aggrada_spatials_id,
//     temporalRangeTz: [timeRange.startTz, timeRange.endTz],
//     temporalRange: [timeRange.start, timeRange.end],
//     data,
//     file,
//   };

//   /**
//    * Check if observation already exists in the database.
//    */
//   const existingObservation = await db.AggradaObservation.findOne({
//     where: observationRecord,
//   }).catch(() => {
//     return null;
//   });
//   if (existingObservation) {
//     console.log('Check if observation already exists in the database.');
//     return false;
//   }

//   const aggradaEntryObs = await db.AggradaObservation.create(
//     observationRecord as db.AggradaObservation
//   ).catch(() => {
//     return null;
//   });

//   if (!aggradaEntryObs?.dataValues) {
//     return false;
//   }

//   return true;
// };

// interface IngestFromSpatialIdParams {
//   file: string;
//   fileFormat: 'csv' | 'csv-semicolon' | 'xlsx' | 'xls';
//   geoCodeKey: string;
//   source: string;
//   adminLevel: string;
//   timeKey?: string;
// }

// export const ingestFromSpatialId = async ({
//   file,
//   fileFormat,
//   geoCodeKey,
//   source,
//   adminLevel,
//   timeKey,
// }: IngestFromSpatialIdParams) => {
//   // Suporte a CSV com delimitador ponto e vírgula
//   const delimiter = fileFormat === 'csv-semicolon' ? ';' : ',';
//   const rows = await readCsv(file, { delimiter });
//   if (!rows || rows.length === 0) {
//     throw new Error('Nenhuma linha encontrada no arquivo.');
//   }
//   for (const row of rows) {
//     await AggradaObservation.create({
//       ...row,
//       geoCode: row[geoCodeKey],
//       source,
//       adminLevel,
//       time: timeKey ? row[timeKey] : undefined,
//     });
//   }
// };
