/* eslint-disable no-console */
import 'dotenv/config';
import { exportAggregatedData, dbAggregateData } from './';


/**
 * Aggregate Data
 */
const aggregateData = async () => {
  const timeGranularityValues = ['yearly', 'quaterly', 'monthly'];
  const subdivisionsValues = ['block']; // , 'census_region'

  for (let timeGranularityValue of timeGranularityValues) {
    for (let subdivisionsValue of subdivisionsValues) {

      const params = {
        aoi: {
          geo_code: '35',
          source: 'ibge',
        },
        subdivision: subdivisionsValue,
        subdivisionSource: 'user',
        timeRange: {
          start: new Date(2014,0,1,0,0,0),
          end: new Date(2014,11,31,23,59,99),
        },
        timeGranularity: timeGranularityValue,
        logId: 'pppp-sjrp-2025-04-15'
      };
      
      await dbAggregateData({
        aggConfig: params
      });
    }
  }
}
aggregateData().then(() => {
  console.log('Finished')
}).catch((err) => {
  console.error(err)
})



/**
 * Save data
 */
// const saveAggFile = async () => {
//   const params = {
//     logId: 'pppp-sjrp-2025-04-15',
//     spatialSubdivision: 'neighborhood',
//     timeGranularity: 'quarterly' as 'monthly' | 'quarterly' | 'yearly',
//   };

//   await exportAggregatedData({
//     outputFilePath: `/home/ennio.lopes/agribio/ennio.lopes/simple4decision-storage/aggrada-data/${params.logId}/aggrada-${params.logId}-${params.spatialSubdivision}-${params.timeGranularity}.csv`,
//     ...params
//   });

//   console.log('exported');

//   return true
// }

// saveAggFile().then(() => {
//   console.log('Finished')
// }).catch((err) => {
//   console.error(err)
// })


