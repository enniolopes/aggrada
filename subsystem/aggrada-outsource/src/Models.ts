import { models } from '@simple4decision/postgresdb';

export type Spatial = Pick<
  models.AggradaSpatial,
  | 'geo_code'
  | 'admin_level'
  | 'source'
  | 'start_date'
  | 'properties'
  | 'raw_geometry'
  | 'raw_srid'
>;

export type Observation = Pick<
  models.AggradaObservation,
  'temporal_range_tz' | 'temporal_range' | 'data'
>;
