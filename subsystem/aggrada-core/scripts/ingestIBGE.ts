/* eslint-disable no-console */
import { db } from '@simple4decision/postgresdb';
import { getCitiesMetadata, getCityMap } from '../src/sources/ibge';
import pLimit from 'p-limit';
// import { ModelColumns } from '@ttoss/postgresdb';

type AggradaSpatial = {
  geo_code?: string;
  source?: string;
  start_date?: Date;
  metadata?: object;
  geometry: {
    type: string;
    coordinates: Array<object>;
  };
  core_file_id?: string;
};

const insertAggradaSpatialData = async ({
  aggradaSpatialData,
}: {
  aggradaSpatialData: AggradaSpatial;
}) => {
  const newSpatialData = await db.AggradaSpatial.create(aggradaSpatialData);
  console.log('New data inserted:', newSpatialData);
};

export const processAllIBGECities = async ({
  year = 2022,
}: {
  year?: number;
}) => {
  const limit = pLimit(20); // Limit to 20 simultaneous requisitions
  const cities = await getCitiesMetadata();

  await Promise.all(
    cities.slice(0, 2).map((city) => {
      return limit(async () => {
        try {
          const geoData = await getCityMap({
            cityId: `${city.id}`,
            year,
          });

          geoData.metadata = {
            ...geoData.metadata,
            ...city,
          };

          await insertAggradaSpatialData({ aggradaSpatialData: geoData });
        } catch (err) {
          console.error(
            `Error processing city ${city.id} - ${city.nome}:\n${err}`
          );
        }
      });
    })
  );
  console.log('Process finished!');
};
