/* eslint-disable no-console */
import 'dotenv/config';

import { db } from '../db';
import { getAggregation } from './scripts/getAggregation';
import { writeCsv } from './scripts/exportToCSV';

// mesorregioes
// microrregioes
// 'regioes-intermediarias'
// 'regioes-imediatas'
// municipios

const spatialRecord = await db.AggradaSpatial.findOne({
  attributes: ['id', 'geo_code', 'geometry'],
  where: {
    geo_code: '35',
    source: 'ibge',
  },
});

if (spatialRecord?.id && spatialRecord?.geometry && spatialRecord?.geo_code) {
  const startDate = new Date(2020, 1, 1);
  const endDate = new Date(2020, 12, 31);

  const dataAgg = await getAggregation({
    aoi: spatialRecord.geometry,
    subdivision: 'municipios',
    subdivisionSource: 'ibge',
    timeRange: {
      start: startDate,
      end: endDate,
    },
    timeGranularity: 'yearly',
  });

  if (dataAgg) {
    console.log('Init writing csv - total lines:\n', dataAgg.length);

    await writeCsv({
      aggregatedData: dataAgg,
      outputPath:
        '/home/ennio.lopes/repo/simple4decision/monorepo/subsystem/aggrada-aggregator/.local/aggregations/cadunico_ibge_35_municipios_monthly.csv',
    });

    console.log('Finish writing csv');
  }
}
