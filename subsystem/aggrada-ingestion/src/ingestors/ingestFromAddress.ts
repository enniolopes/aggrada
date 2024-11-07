/* eslint-disable no-console */
import 'dotenv/config';

import { db } from '../db';
import { indexer } from '../';
import { reader, transformer } from '@simple4decision/aggrada-core';

type AddressKeys = {
  streetName?: string;
  streetNumber?: string;
  streetAndNumber?: string;
  postalCode?: string;
  country?: string;
  city?: string;
  fullAddress?: string;
};

const sleep = (ms: number) => {
  return new Promise((resolve) => {
    return setTimeout(resolve, ms);
  });
};

const createObservation = async ({
  addressKeys,
  fixedAddressValues,
  timeKey,
  timezone = 'America/Sao_Paulo', // Todo: get timezone from state-country
  data,
}: {
  addressKeys: AddressKeys;
  fixedAddressValues: AddressKeys;
  timeKey: string;
  timezone?: string;
  data: Record<string, string>;
}) => {
  const indexSpatialParams: Record<string, string> = {};
  Object.entries(addressKeys).forEach(([addressKey, addressField]) => {
    if (addressField && data[addressField]) {
      indexSpatialParams[addressKey] = data[addressField];
    }
  });

  Object.entries(fixedAddressValues).forEach(
    ([fixedAddressKey, fixedAddressValue]) => {
      if (fixedAddressValue) {
        indexSpatialParams[fixedAddressKey] = fixedAddressValue;
      }
    }
  );

  console.log('Init spatial index');

  const spatialId = await indexer.indexSpatialFromAddress(
    indexSpatialParams as Parameters<typeof indexer.indexSpatialFromAddress>[0]
  );

  if (!spatialId) {
    throw Error('Spatial id not founded');
  }

  const timeRange = transformer.createTimeRange({
    date: data[timeKey],
    timezone,
  });

  if (!timeRange?.startTz) {
    throw Error('Time range not processed');
  }

  const aggradaEntryObs = await db.AggradaObservation.create({
    aggrada_spatial_id: spatialId,
    temporal_range_tz: [timeRange.startTz, timeRange.endTz],
    temporal_range: [timeRange.start, timeRange.end],
    data,
  });

  if (!aggradaEntryObs?.dataValues) {
    return false;
  }

  return true;
};

export const ingestFromAddress = async ({
  file,
  fileFormat,
  addressKeys,
  fixedAddressValues,
  timeKey,
}: {
  file: string | Buffer; // File path or Buffer for in-memory CSV data
  fileFormat: 'csv' | 'xlsx' | 'xls';
  addressKeys: AddressKeys;
  fixedAddressValues: AddressKeys;
  timeKey: string;
}) => {
  if (!Object.keys(addressKeys)) {
    throw Error('No addressKeys detected');
  }

  if (fileFormat === 'csv') {
    await reader.csvToJsonStream(
      {
        file,
        delimiter: ',',
      },
      async (batch) => {
        console.log('init batch');

        for (const data of batch) {
          await sleep(1300);
          try {
            await createObservation({
              addressKeys,
              fixedAddressValues,
              timeKey,
              data,
            });
          } catch {
            throw Error('error creating');
            // console.log('error creating: ', data);
          }
        }

        // await Promise.all(
        //   batch.map(async (data) => {
        //     await createObservation({
        //       addressKeys,
        //       fixedAddressValues,
        //       timeKey,
        //       data,
        //     });
        //   })
        // );
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
          await sleep(1300);
          try {
            await createObservation({
              addressKeys,
              fixedAddressValues,
              timeKey,
              data,
            });
          } catch {
            throw Error('error creating');
            // console.log('error creating: ', data);
          }
        }
      }
    );
  }
};

// saveObservationData()
// .then(() => {
//   console.log('Ingestion process finished.');
// })
// .catch((error) => {
//   console.error('Error during ingestion: ', error);
// });
