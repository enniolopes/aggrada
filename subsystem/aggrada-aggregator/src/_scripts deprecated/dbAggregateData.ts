// import 'dotenv/config';

// import { db } from '../db';
// import { QueryTypes } from 'sequelize';

// export const dbAggregateData = async () => {
//   const sequelize = db.sequelize;

//   const query = `
//     WITH observation_data AS (
//       SELECT
//         o.aggrada_spatials_id AS spatial_id,
//         s.geo_code AS spatial_geo_code,
//         s.source AS spatial_source,
//         o.temporal_range[1] AS time_start_date,
//         o.temporal_range[2] AS time_end_date,
//         jsonb_each_text(o.data) AS data_pairs
//       FROM
//         "aggrada_observations" o
//       JOIN
//         "aggrada_spatials" s
//       ON
//         o.aggrada_spatials_id = s.id
//     )
//     INSERT INTO "AggradaAggregated" (
//       spatial_id,
//       spatial_geo_code,
//       spatial_source,
//       time_label,
//       time_start_date,
//       time_end_date,
//       data_key,
//       data_values
//     )
//     SELECT
//       spatial_id,
//       spatial_geo_code,
//       spatial_source,
//       CONCAT(EXTRACT(YEAR FROM time_start_date), '-', EXTRACT(MONTH FROM time_start_date)) AS time_label,
//       time_start_date,
//       time_end_date,
//       (data_pairs).key AS data_key,
//       ARRAY[(data_pairs).value]::TEXT[]
//     FROM observation_data
//     ON CONFLICT (spatial_id, spatial_geo_code, spatial_source, time_label, data_key, time_start_date, time_end_date)
//     DO UPDATE SET
//       data_values = "aggrada_aggregateds".data_values || EXCLUDED.data_values;
//   `;

//   console.log('Init aggregating observations');
//   await sequelize.query(query, {
//     type: QueryTypes.INSERT,
//   });
//   console.log('Finish aggregating observations');
// };
