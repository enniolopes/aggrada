import { Geometry } from 'geojson';

export type SpatialSchema = {
  code?: string;
  name?: string;
  source: string;
  startDate?: Date;
  properties?: object;
  geometry: Geometry;

  // Specifies the spatial reference identifier
  srid: '4326' | '4674' | '3857' | '4269' | '27700' | '25832' | 'unknown';
};

export type TimeRangeSchema = {
  rawTimezone: string; // IANA timezone
  rawDate: string; // Ex: "2024", "2024-10", "Q1 2024", etc.
  start: string; // Start date without timezone ISO 8601 string
  end: string; // End date without timezone ISO 8601 string
  startTz: string; // Start date with timezone ISO 8601 string
  endTz: string; // End date with timezone ISO 8601 string
};
