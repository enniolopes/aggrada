import { mapper } from '@simple4decision/aggrada-core';
import { Column, DataType, HasMany, Model, Table } from '@ttoss/postgresdb';
// import { CoreFile } from './CoreFile';
import { Geometry } from 'geojson';

import { AggradaObservation } from './AggradaObservation';

// Move these to a separate constants file
const adminLevels = [...Object.keys(mapper.adminLevelMap), 'unknown'] as const;
const sridValues = [...Object.keys(mapper.sridMap), 'unknown'] as const;

type AdminLevel = (typeof adminLevels)[number];
type SRID = (typeof sridValues)[number];

/**
 * AggradaSpatial represents a geographical entity with administrative boundaries
 * and associated spatial data. It supports multiple coordinate systems and
 * maintains both raw and transformed (EPSG:4326) geometries.
 *
 * @remarks
 * - Geometries must be either POINT, POLYGON or MULTIPOLYGON
 * - Raw geometries are stored as-is, while transformed geometries are always in EPSG:4326
 * - Properties can store additional metadata like names, external IDs, etc.
 */
@Table({
  tableName: 'aggrada_spatials',
  underscored: true,
  freezeTableName: true,
  indexes: [
    {
      fields: ['geometry'],
      using: 'GIST',
      name: 'aggrada_spatials_geometry_gist',
    },
  ],
})
export class AggradaSpatial extends Model {
  /**
   * Unique administrative code (ISO, FIPS, etc)
   * @example "BR-SP" for São Paulo state
   */
  @Column({
    type: DataType.STRING,
  })
  geo_code?: string;

  /**
   * Data source identifier
   * @example "IBGE", "FIPS", "NASA", "NOAA", "USER_PROVIDED"
   */
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  source: string;

  /**
   * Date when this spatial data became valid
   * Used for historical tracking of boundary changes
   */
  @Column({
    type: DataType.DATE,
  })
  start_date?: Date;

  /**
   * Additional metadata and properties
   * @see SpatialProperties interface for structure
   */
  @Column({
    type: DataType.JSONB,
  })
  properties?: object;

  /**
   * Administrative level according to OSM standard
   * @see https://wiki.openstreetmap.org/wiki/Tag:boundary=administrative
   */
  @Column({
    type: DataType.ENUM(...adminLevels),
    allowNull: false,
  })
  admin_level: AdminLevel;

  /**
   * Original geometry as provided by the source
   * Must be POINT, POLYGON or MULTIPOLYGON
   */
  @Column({
    type: DataType.GEOMETRY('GEOMETRY'),
    allowNull: false,
  })
  raw_geometry: Geometry;

  /**
   * Original coordinate system identifier
   */
  @Column({
    type: DataType.ENUM(...sridValues),
    allowNull: false,
  })
  raw_srid: SRID;

  /**
   * Transformed geometry in EPSG:4326 (WGS84)
   * Used for standardized spatial operations
   */
  @Column({
    type: DataType.GEOMETRY('GEOMETRY', 4326),
    allowNull: false,
  })
  geometry: Geometry;

  @Column({
    type: DataType.STRING,
  })
  core_file?: string;

  /**
   * References to observations within this spatial boundary
   */
  @HasMany(() => {
    return AggradaObservation;
  })
  aggrada_observations?: AggradaObservation[];
}
