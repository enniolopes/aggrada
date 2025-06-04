/* eslint-disable no-console */
import 'dotenv/config';
import { exportAggregatedData, dbAggregateData } from './';


/**
 * Aggregate Data
 */
// const aggregateData = async () => {
//   const timeGranularityValues = ['yearly', 'quarterly', 'monthly'];
//   const subdivisionsValues = ['census_region'];

//   for (let timeGranularityValue of timeGranularityValues) {
//     for (let subdivisionsValue of subdivisionsValues) {

//       const params = {
//         aoi: {
//           geo_code: '35',
//           source: 'ibge',
//         },
//         subdivision: subdivisionsValue,
//         subdivisionSource: 'user',
//         timeRange: {
//           start: new Date(2014,0,1,0,0,0),
//           end: new Date(2014,11,31,23,59,99),
//         },
//         timeGranularity: timeGranularityValue,
//         logId: 'pppp-sjrp-2025-05-15'
//       };
      
//       await dbAggregateData({
//         aggConfig: params
//       });
//     }
//   }
// }
// aggregateData().then(() => {
//   console.log('Finished')
// }).catch((err) => {
//   console.error(err)
// })



/**
 * Save data
 */
const saveAggFile = async () => {
  const logId = 'pppp-sjrp-2025-05-15';
  const timeGranularityValues = ['yearly', 'quarterly', 'monthly'];
  const subdivisionsValues = ['census_region'];


  for (let timeGranularityValue of timeGranularityValues) {
    for (let subdivisionsValue of subdivisionsValues) {
      console.log(`Start exporting data for ${subdivisionsValue} and ${timeGranularityValue}`);

      const params = {
        logId,
        spatialSubdivision: subdivisionsValue,
        timeGranularity: timeGranularityValue as 'monthly' | 'quarterly' | 'yearly',
      };

      const outputFilePath = `/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/aggrada-data/${params.logId}/aggrada-${params.logId}-${params.spatialSubdivision}-${params.timeGranularity}.csv`;

      await exportAggregatedData({
        outputFilePath,
        ...params
      });

      console.log('File exported:', outputFilePath);
    }
  }

  return true
}

saveAggFile().then(() => {
  console.log('Finished')
}).catch((err) => {
  console.error(err)
})
