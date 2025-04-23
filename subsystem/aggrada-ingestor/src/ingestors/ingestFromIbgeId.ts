/* eslint-disable no-console */
import 'dotenv/config';

import { db } from '../db';
import { indexer } from '..';
import { reader, transformer } from '../../../aggrada-core/src';

const createObservation = async ({
  ibgeCodeKeys,
  fixedIbgeCode,
  timeKey,
  fixedTime,
  timezone = 'America/Sao_Paulo', // ToDo: get timezone from state-country
  data,
}: {
  ibgeCodeKeys?: string[];
  fixedIbgeCode?: string;
  timeKey?: string;
  fixedTime?: string;
  timezone?: string;
  data: Record<string, string>;
}) => {
  if (ibgeCodeKeys && !data[ibgeCodeKeys.join()]) {
    throw Error('Data column for IBGE code not founded');
  }

  if (timeKey && !data[timeKey]) {
    throw Error('Data column for Time Index not founded');
  }

  const ibgeCode = ibgeCodeKeys ? data[ibgeCodeKeys.join()] : fixedIbgeCode;
  const spatialId = await indexer
    .getSpatialId({
      geo_code: ibgeCode,
      source: 'ibge',
    })
    .catch((err) => {
      console.log('Spatial id not founded: ', err);
      return null;
    });

  if (!spatialId?.aggrada_spatials_id) {
    throw Error('Spatial id not founded');
  }

  // if (!(timeKey ? data[timeKey] : fixedTime)) {
  //   throw Error;
  // }

  const timeRange = transformer.createTimeRange({
    date: timeKey ? data[timeKey] : fixedTime || '',
    timezone,
  });

  if (!timeRange?.startTz) {
    throw Error('Time range not processed');
  }

  const observationRecord = {
    aggrada_spatials_id: spatialId.aggrada_spatials_id,
    temporal_range_tz: [timeRange.startTz, timeRange.endTz],
    temporal_range: [timeRange.start, timeRange.end],
    data,
  };

  /**
   * Check if observation already exists in the database.
   */
  const existingObservation = await db.AggradaObservation.findOne({
    where: observationRecord,
  }).catch(() => {
    return null;
  });
  if (existingObservation) {
    console.log('Check if observation already exists in the database.');
    return false;
  }

  const aggradaEntryObs = await db.AggradaObservation.create(
    observationRecord
  ).catch(() => {
    return null;
  });

  if (!aggradaEntryObs?.dataValues) {
    return false;
  }

  return true;
};

export const ingestFromIbgeId = async ({
  file,
  fileFormat,
  ibgeCodeKeys,
  fixedIbgeCode,
  timeKey,
  fixedTime,
}: {
  file: string | Buffer; // File path or Buffer for in-memory CSV data
  fileFormat: 'csv' | 'xlsx' | 'xls';
  ibgeCodeKeys?: string[];
  fixedIbgeCode?: string;
  timeKey?: string;
  fixedTime?: string;
}) => {
  if (!ibgeCodeKeys && !fixedIbgeCode) {
    throw Error('Missing input of the IBGE code');
  }

  if (fileFormat === 'csv') {
    let batchN = 0;
    await reader.csvToJsonStream(
      {
        file,
        delimiter: ',',
        batchSize: 10000,
      },
      async (batch) => {
        batchN += 1;
        console.log('init batch ', batchN);

        for (const data of batch) {
          try {
            await createObservation({
              ibgeCodeKeys,
              fixedIbgeCode,
              timeKey,
              fixedTime,
              data,
            });
          } catch (err) {
            console.log(`Error creating: ${err}\n`, data);
          }
        }
      }
    );
  }

  if (fileFormat === 'xlsx') {
    await reader.excelToJsonStream(
      {
        file,
      },
      async (batch) => {
        console.log('init batch');

        for (const data of batch) {
          try {
            await createObservation({
              ibgeCodeKeys,
              fixedIbgeCode,
              timeKey,
              fixedTime,
              data,
            });
          } catch (err) {
            console.log(`Error creating: ${err}\n`, data);
          }
        }
      }
    );
  }
};
