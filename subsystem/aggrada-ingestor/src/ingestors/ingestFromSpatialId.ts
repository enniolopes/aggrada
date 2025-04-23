/* eslint-disable no-console */
import 'dotenv/config';

import { db } from '../db';
import { indexer } from '..';
import { reader, transformer } from '@simple4decision/aggrada-core';
import { models } from '@simple4decision/postgresdb';

const createObservation = async ({
  geoCodeKey,
  source,
  adminLevel,
  timeKey,
  fixedTime,
  timezone = 'America/Sao_Paulo', // ToDo: get timezone from state-country
  data,
  file,
}: {
  geoCodeKey: string,
  source: string,
  adminLevel: InstanceType<typeof models.AggradaSpatial>['adminLevel'],
  timeKey?: string;
  fixedTime?: string;
  timezone?: string;
  data: Record<string, string>;
  file: string | Buffer;
}) => {
  if (timeKey && !data[timeKey]) {
    throw Error('Data column for Time Index not founded');
  }

  const geoCodeSanitized = data[geoCodeKey].trim();
  const sourceSanitized = source.trim();

  const spatialId = await indexer
    .getSpatialId({
      geoCode: geoCodeSanitized,
      source: sourceSanitized,
      adminLevel,
    })
    .catch((err) => {
      console.log('Spatial id not founded: ', err);
      return null;
    });

  if (!spatialId?.aggrada_spatials_id) {
    throw Error('Spatial id not founded');
  }

  const timeRange = transformer.createTimeRange({
    date: timeKey ? data[timeKey] : fixedTime || '',
    timezone,
  });

  if (!timeRange?.startTz) {
    throw Error('Time range not processed');
  }

  const observationRecord = {
    aggradaSpatialId: spatialId.aggrada_spatials_id,
    temporalRangeTz: [timeRange.startTz, timeRange.endTz],
    temporalRange: [timeRange.start, timeRange.end],
    data,
    file,
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
    observationRecord as models.AggradaObservation
  ).catch(() => {
    return null;
  });

  if (!aggradaEntryObs?.dataValues) {
    return false;
  }

  return true;
};

export const ingestFromSpatialId = async ({
  file,
  fileFormat,
  geoCodeKey,
  source,
  adminLevel,
  timeKey,
  fixedTime,
}: {
  file: string | Buffer; // File path or Buffer for in-memory CSV data
  fileFormat: 'csv' | 'xlsx' | 'xls' | 'csv-semicolon';
  geoCodeKey: string;
  source: string;
  adminLevel: InstanceType<typeof models.AggradaSpatial>['adminLevel'];
  timeKey?: string;
  fixedTime?: string;
}) => {
  if (fileFormat === 'csv') {
    let batchN = 0;
    await reader.csvToJsonStream(
      {
        file,
        delimiter: ',',
        batchSize: 5000,
      },
      async (batch) => {
        batchN += 1;
        console.log('init batch ', batchN);

        for (const data of batch) {
          try {
            await createObservation({
              geoCodeKey,
              source,
              adminLevel,
              timeKey,
              fixedTime,
              data,
              file,
            });
          } catch (err) {
            console.log(`Error creating: ${err}\n`, data);
          }
        }
      }
    );
  }

  if (fileFormat === 'csv-semicolon') {
    let batchN = 0;
    await reader.csvToJsonStream(
      {
        file,
        delimiter: ';',
        batchSize: 5000,
      },
      async (batch) => {
        batchN += 1;
        console.log('init batch ', batchN);

        for (const data of batch) {
          try {
            await createObservation({
              geoCodeKey,
              source,
              adminLevel,
              timeKey,
              fixedTime,
              data,
              file,
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
              geoCodeKey,
              source,
              adminLevel,
              timeKey,
              fixedTime,
              data,
              file,
            });
          } catch (err) {
            console.log(`Error creating: ${err}\n`, data);
          }
        }
      }
    );
  }
};
