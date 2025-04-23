/* eslint-disable no-console */
import 'dotenv/config';

import { Op } from 'sequelize';
import { db } from '../db';
import { sources } from '..';
import pLimit from 'p-limit';

export const ibgeAllLocalities = async ({
  locality,
  years,
}: {
  locality: sources.GeoMeshes;
  years?: number[];
}) => {
  const yearsSearch =
    years ??
    Array.from({ length: new Date().getFullYear() - 2019 + 1 }, (_, i) => {
      return 2019 + i;
    });

  /**
   * Get all cities from IBGE to get the maps
   */
  const allLocalities = await sources.ibgeAllLocalityRegistry({
    locality,
  });

  const searchParams = allLocalities.flatMap((localityItem) => {
    return yearsSearch.map((year) => {
      return {
        year,
        ...localityItem,
      };
    });
  });

  const dbGeoCode = (
    await db.AggradaSpatial.findAll({
      where: {
        geoCode: {
          [Op.in]: allLocalities.map((localityItem) => {
            return `${localityItem.id}`;
          }),
        },
        startDate: {
          [Op.in]: yearsSearch.map((year) => {
            return new Date(year, 0, 1);
          }),
        },
        source: 'ibge',
        adminLevel: locality,
      },
      attributes: ['geo_code'],
    })
  ).map((item) => {
    return item.geoCode;
  });

  console.log(`Total of registers already in database: ${dbGeoCode.length}`);

  const newSearchParams =
    dbGeoCode.length === 0
      ? searchParams
      : searchParams.filter((searchParam) => {
          return !dbGeoCode.includes(`${searchParam.id}`);
        });

  console.log(`Init the creation of ${newSearchParams.length} new maps`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapsData: any[] = [];
  const limit = pLimit(10); // Limit the concurrency
  const mapsPromiseRes = await Promise.allSettled(
    newSearchParams.map((searchParam) => {
      return limit(async () => {
        /**
         * Get the city map polygon
         */
        const resMap = await sources.ibgeGeoMeshMap({
          geoMesh: locality,
          ibgeCode: `${searchParam.id}`,
          year: searchParam.year,
        });

        mapsData.push({
          ...resMap,
          geometry: resMap.rawGeometry,
        });

        return;
      });
    })
  );

  await db.AggradaSpatial.bulkCreate(mapsData, {
    validate: true,
    returning: true,
  });

  console.log(
    `Total maps created: ${
      mapsPromiseRes.filter((result) => {
        return result.status === 'fulfilled';
      }).length
    } of ${newSearchParams.length}`
  );

  return true;
};
