/* eslint-disable no-console */
import 'dotenv/config';

import { db } from '../db';
import { getAggParams, AggConfig } from './getAggParams';
import { models } from '@simple4decision/postgresdb';

export const dbAggregateData = async ({
  aggConfig,
  logId,
}: {
  aggConfig: AggConfig;
  logId: string;
}) => {
  const aggParams = await getAggParams(aggConfig);
  console.log('Aggregating data for:', aggParams.subdivisions.length, 'subdivisions and', aggParams.temporalRanges.length, 'temporal ranges.');

  const createdAt = new Date();

  for (let subdivision of aggParams.subdivisions) {
    for (let temporalRange of aggParams.temporalRanges) {
      console.log('Aggregating data for:', subdivision.dataValues.geoCode, 'from', temporalRange.start, 'to', temporalRange.end);

      // Sleep
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(5000);

      const subdivisionGeometry = (await db.AggradaSpatial.findOne({
        where: { id: subdivision.dataValues.id },
        attributes: ['geometry' , 'properties'],
      }))?.dataValues as { geometry: object; properties: { name: string } };

      if(!subdivisionGeometry?.geometry) {
        console.error('Error: Could not find geometry for subdivision:', subdivision.dataValues.geoCode);
      }

      const aggregatedDataKeys: Partial<models.AggradaAggregated> = {
        logId: logId,
        spatialId: subdivision.dataValues.id as number,
        spatialGeoCode: subdivision.dataValues.geoCode,
        spatialSubdivision: aggConfig.subdivision,
        spatialName: `${subdivisionGeometry?.properties?.name || ''}`,
        timeStartDate: temporalRange.start,
        timeEndDate: temporalRange.end,
        timeLabel: temporalRange.label,
      };

      // Query and aggregate observations directly in the database
      try{
        await db.sequelize.query(
          `
          INSERT INTO aggrada_aggregateds (
            aggregation_params,
            log_id,
            spatial_id,
            spatial_geo_code,
            spatial_name,
            spatial_subdivision,
            time_label,
            time_start_date,
            time_end_date,
            data_key,
            data_values,
            created_at,
            updated_at
          )
          SELECT
            :aggregation_params AS aggregation_params,
            :log_id AS log_id,
            :spatial_id AS spatial_id,
            :spatial_geo_code AS spatial_geo_code,
            :spatial_name AS spatial_name,
            :spatial_subdivision AS spatial_subdivision,
            :time_label AS time_label,
            :time_start_date AS time_start_date,
            :time_end_date AS time_end_date,
            k.data_key AS data_key,
            array_agg((o.data ->> k.data_key)::text) AS data_values,
            :created_at AS created_at,
            :created_at AS updated_at
          FROM
            aggrada_observations o
          JOIN
            aggrada_spatials s ON o.aggrada_spatials_id = s.id,
            LATERAL jsonb_object_keys(o.data) AS k(data_key)
          WHERE
            (
              ST_Area(ST_Intersection(s.geometry, ST_GeomFromGeoJSON(:subdivisionGeometry))) >= 0.95 * ST_Area(s.geometry)
              AND ST_Area(s.geometry) <= 1.05 * ST_Area(ST_GeomFromGeoJSON(:subdivisionGeometry))
            )
            AND (
              tstzrange(:time_start_date, :time_end_date, '[]') @> o.temporal_range OR
              o.temporal_range @> tstzrange(:time_start_date, :time_end_date, '[]')
            )
          GROUP BY 
            k.data_key
          ON CONFLICT (
            spatial_id,
            spatial_geo_code,
            spatial_subdivision,
            time_start_date,
            time_end_date,
            data_key
          )
          DO UPDATE SET
            data_values = aggrada_aggregateds.data_values || EXCLUDED.data_values;
          `,
          {
            replacements: {
              ...aggregatedDataKeys,
              aggregation_params: JSON.stringify(aggConfig),
              subdivisionGeometry: JSON.stringify(subdivisionGeometry.geometry),
              created_at: createdAt,
            },
          }
        );
      } catch(error){
        console.error('Error during aggregation:', error);
      }
    }
  }

  console.log('Aggregation process completed successfully.');
}
