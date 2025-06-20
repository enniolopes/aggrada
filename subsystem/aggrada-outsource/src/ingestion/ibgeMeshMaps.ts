/* eslint-disable no-console */
import 'dotenv/config';

import { db } from '../db';
import {
  fetchIbgeLocalityMap,
  ibgeGeoMeshesLocalities,
  brazilStartDate,
} from '../sources/ibge/geoMeshesApi';
import { ibgeLocalitiesAdminLevel } from '../sources/ibge/adminLevelMap';
import { fetchIbgeAllLocalities } from '../sources/ibge/localitiesApi';
import { logError, logGenericError } from '../handlers/logger';

export const ingestIbgeAllLocalities = async ({
  years,
}: {
  years?: number[];
}) => {
  console.log('Starting IBGE all localities ingestion...');
  const yearsSearch =
    years && years.length > 0 ? years : [2017, 2019, 2020, 2021, 2022];

  for (const locality of ibgeGeoMeshesLocalities.filter(
    (item) => item !== 'paises'
  )) {
    console.log('Processing locality:', locality);
    /**
     * Get all localities listed by IBGE
     */
    const allLocalities = (
      await fetchIbgeAllLocalities({
        locality,
      })
    ).map((item) => {
      return {
        id: `${Object.values(item)[0]}`,
        label: `${Object.values(item)[1]}`,
        locality,
        localityData: item,
      };
    });

    let searchParams = allLocalities.flatMap((item) => {
      return yearsSearch.map((year) => {
        return {
          ...item,
          year,
        };
      });
    });

    const dbGeoCodes = [] as {
      id: string;
      locality: string;
    }[];

    /**
     * Check if the maps already exist in the database
     */
    for (let i = 0; i < searchParams.length; i++) {
      const item = searchParams[i];
      const spatialData = await db.AggradaSpatial.findOne({
        where: {
          geo_code: item.id,
          start_date: brazilStartDate({ year: item.year }),
          source: 'ibge',
          admin_level: ibgeLocalitiesAdminLevel[item.locality],
        },
        attributes: ['geo_code'],
      });

      if (spatialData?.dataValues?.geo_code) {
        dbGeoCodes.push({
          id: spatialData.dataValues.geo_code,
          locality: item.locality,
        });
      }
    }

    searchParams = searchParams.filter((item) => {
      return !dbGeoCodes.some((geo) => `${geo.id}` === `${item.id}`);
    });

    /**
     * Fetch maps and insert into the database
     */

    console.log(
      `Total maps already in database: ${dbGeoCodes.length} - Total new maps to fetch: ${searchParams.length}`
    );

    // Process searchParams in batches of 30 sequentially
    const batchSize = 30;
    console.log(
      `Processing ${searchParams.length} items in batches of ${batchSize}`
    );

    for (let i = 0; i < searchParams.length; i += batchSize) {
      const batch = searchParams.slice(i, i + batchSize);
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(searchParams.length / batchSize)} (${batch.length} items)`
      );

      const batchResults = [];

      // Fetch data for each item in the batch
      for (const item of batch) {
        try {
          const mapData = await fetchIbgeLocalityMap({
            locality: item.locality,
            ibgeCode: item.id,
            year: item.year,
            localityData: item.localityData,
          });

          if (mapData) {
            batchResults.push({
              ...mapData,
              geometry: mapData.raw_geometry,
            });
          }
        } catch (error) {
          console.error(
            `Error fetching data for ${item.id} (${item.locality}, ${item.year}):`,
            error
          );

          // Log error to file
          logError({
            id: item.id,
            locality: item.locality,
            year: item.year,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Bulk insert the batch results
      if (batchResults.length > 0) {
        try {
          await db.AggradaSpatial.bulkCreate(batchResults, {
            validate: true,
            returning: true,
          });
          console.log(
            `Successfully inserted batch of ${batchResults.length} records`
          );
        } catch (error) {
          console.error(`Error inserting batch:`, error);

          // Log error to file
          logGenericError({
            message: `Error inserting batch of ${batchResults.length} records: ${error instanceof Error ? error.message : String(error)}`,
            filename: 'ibge-localities-errors.log',
          });
        }
      } else {
        console.log(`No valid data in this batch to insert`);
      }

      // Wait seconds between batches
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    console.log('Finished processing all batches');
  }

  return true;
};
