/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import 'dotenv/config';

import { transformer } from '@simple4decision/aggrada-core';
import { QueryTypes } from 'sequelize';

import { db } from '../db';
// import { models } from '@simple4decision/postgresdb';

export type AggConfig = {
  aoi?: {
    geo_code: string;
    source: string;
  };
  subdivision: string;
  subdivisionSource: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  timeGranularity: string;
  logId?: string;
  coreFiles?: string[];
};

export const getAggParams = async (
  aggConfig: AggConfig
): Promise<{
  subdivisions: any[];
  temporalRanges: { start: Date; end: Date; label: string }[];
}> => {
  // 0. Retrieve AOI spatial record
  // const aoiSpatialRecord = await db.AggradaSpatial.findOne({
  //   attributes: ['id', 'geo_code', 'geometry'],
  //   where: aggConfig.aoi,
  // });

  // if (!aoiSpatialRecord?.geometry) {
  //   throw new Error('Invalid AOI spatial record');
  // }

  // Prepare the geometry safely for the query
  // const aoiGeometry = JSON.stringify(aoiSpatialRecord.geometry).replace(/'/g, "''");

  const subdivisions = (await db.sequelize.query(
    `
    SELECT DISTINCT ON (geo_code) id, geo_code, source, start_date
    FROM aggrada_spatials 
    WHERE admin_level = :admin_level 
      AND source = :source 
      AND start_date < :start_date
    ORDER BY geo_code, start_date DESC
  `,
    {
      replacements: {
        admin_level: aggConfig.subdivision,
        source: aggConfig.subdivisionSource,
        start_date: aggConfig.timeRange.start,
      },
      type: QueryTypes.SELECT,
    }
  )) as any[];

  if (!subdivisions || subdivisions.length === 0) {
    throw new Error('No subdivisions found for the given AOI');
  }

  // 2. Generate temporal intervals based on time granularity
  const temporalRanges = transformer.generateTimeIntervals({
    timeRange: aggConfig.timeRange,
    granularity: aggConfig.timeGranularity,
  });

  if (!temporalRanges) {
    throw new Error(
      'No temporal ranges found for the given time range and granularity'
    );
  }

  return {
    subdivisions,
    temporalRanges,
  };
};
