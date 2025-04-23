/* eslint-disable no-console */
import 'dotenv/config';

import { db } from '../db';
import { Op } from 'sequelize';
import { transformer, mapper } from '@simple4decision/aggrada-core';
import { models } from '@simple4decision/postgresdb';

export type AggConfig = {
    aoi: {
      geo_code: string,
      source: string,
    };
    subdivision: string;
    subdivisionSource: string;
    timeRange: {
      start: Date;
      end: Date;
    },
    timeGranularity: keyof typeof mapper.timeGranularity;
};

export const getAggParams = async (aggConfig: AggConfig): Promise<{
  subdivisions: models.AggradaSpatial[];
  temporalRanges: { start: Date; end: Date; label: string }[];
}> => {
  // 0. Retrieve AOI spatial record
  const aoiSpatialRecord = await db.AggradaSpatial.findOne({
    attributes: ['id', 'geo_code', 'geometry'],
    where: aggConfig.aoi,
  });
  
  if (!aoiSpatialRecord?.geometry) {
    throw new Error('Invalid AOI spatial record');
  }

  // Prepare the geometry safely for the query
  const aoiGeometry = JSON.stringify(aoiSpatialRecord.geometry).replace(/'/g, "''");
  
  const subdivisions = await db.AggradaSpatial.findAll({
    // where: {
    //   admin_level: aggConfig.subdivision,
    //   source: aggConfig.subdivisionSource,
    //   [Op.and]: db.sequelize.literal(`
    //     ST_Area(ST_Intersection(geometry, ST_GeomFromGeoJSON('${aoiGeometry}'))) >= 0.95 * ST_Area(geometry)
    //     AND ST_Area(geometry) <= 1.05 * ST_Area(ST_GeomFromGeoJSON('${aoiGeometry}'))
    //   `),
    // },
    where: {
      adminLevel: aggConfig.subdivision,
      source: aggConfig.subdivisionSource,
    },
    attributes: ['id', 'geo_code', 'source', 'start_date'],
  });

  console.log('subdivisions: ', subdivisions.length)


  if(!subdivisions || subdivisions.length === 0) {
    throw new Error('No subdivisions found for the given AOI');
  }

  // 2. Generate temporal intervals based on time granularity
  // const temporalRanges = transformer.generateTimeIntervals({
  //   timeRange: aggConfig.timeRange,
  //   granularity: aggConfig.timeGranularity,
  // });

  const temporalRanges = [{
    start: new Date('2021-12-30'),
    end: new Date('2023-01-02'),
    label: '2022',
  }]

  return {
    subdivisions,
    temporalRanges
  };
}
