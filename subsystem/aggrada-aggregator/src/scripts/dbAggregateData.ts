/* eslint-disable no-console */
import 'dotenv/config';

import { db } from '../db';
import { getAggParams, AggConfig } from './getAggParams';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const dbAggregateData = async ({
  aggConfig,
}: {
  aggConfig: AggConfig;
}) => {
  const aggParams = await getAggParams(aggConfig).catch(() => {
    return null;
  });

  if (!aggParams) {
    console.error('Error: Could not retrieve aggregation parameters. ', aggConfig);
    return
  }
  console.log('Aggregating data for:', aggParams.subdivisions.length, 'subdivisions and', aggParams.temporalRanges.length, 'temporal ranges.');

  const createdAt = new Date();

  for (let subdivision of aggParams.subdivisions) {
    for (let temporalRange of aggParams.temporalRanges) {
      console.log('Aggregating data for:', subdivision.dataValues.geo_code, 'from', temporalRange.start, 'to', temporalRange.end);

      // Sleep
      await sleep(310);

      const subdivisionGeometry = (await db.AggradaSpatial.findOne({
        where: { id: subdivision.dataValues.id },
        attributes: ['raw_geometry' , 'properties'],
      }))?.dataValues as { raw_geometry: object; properties: { name: string } };

      if(!subdivisionGeometry?.raw_geometry) {
        console.error('Error: Could not find raw_geometry for subdivision:', subdivision.dataValues.geo_code);
      }

      const aggregatedDataKeys: any = {
        log_id: aggConfig.logId,
        spatial_id: subdivision.dataValues.id as number,
        spatial_geo_code: subdivision.dataValues.geo_code,
        spatial_subdivision: aggConfig.subdivision,
        spatial_name: `${subdivisionGeometry?.properties?.name || ''}`,
        time_start_date: temporalRange.start,
        time_end_date: temporalRange.end,
        time_label: temporalRange.label,
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
            key,
            values,
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
            k.key AS key,
            array_agg((o.data ->> k.key)::text) AS values,
            :created_at AS created_at,
            :created_at AS updated_at
          FROM
            aggrada_observations o
          JOIN
            aggrada_spatials s ON o.aggrada_spatials_id = s.id,
            LATERAL jsonb_object_keys(o.data) AS k(key)
          WHERE
            (
              ST_Area(ST_Intersection(s.raw_geometry, ST_GeomFromGeoJSON(:subdivisionGeometry))) >= 0.95 * ST_Area(s.raw_geometry)
              AND ST_Area(s.raw_geometry) <= 1.05 * ST_Area(ST_GeomFromGeoJSON(:subdivisionGeometry))
            )
            AND (
              tstzrange(:time_start_date, :time_end_date, '[]') @> o.temporal_range OR
              o.temporal_range @> tstzrange(:time_start_date, :time_end_date, '[]')
            )
          GROUP BY 
            k.key
          ON CONFLICT (
            spatial_id,
            spatial_geo_code,
            spatial_subdivision,
            time_start_date,
            time_end_date,
            key
          )
          DO UPDATE SET
            values = aggrada_aggregateds.values || EXCLUDED.values;
          `,
          {
            replacements: {
              ...aggregatedDataKeys,
              aggregation_params: JSON.stringify(aggConfig),
              subdivisionGeometry: JSON.stringify(subdivisionGeometry.raw_geometry),
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
