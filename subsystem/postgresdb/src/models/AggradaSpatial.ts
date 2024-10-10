import { AggradaObservation } from './AggradaObservation';
import {
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from '@ttoss/postgresdb';
import { CoreFile } from './CoreFile';
import { Geometry } from 'geojson';

@Table({
  indexes: [
    {
      fields: ['geometry'],
      using: 'GIST',
      name: 'aggrada_spatial_geometry_gist',
    },
  ],
})
export class AggradaSpatial extends Model {
  @Column({
    type: DataType.STRING,
  })
  geo_code: string; // Optional: unique code like ISO, FIPS, or other administrative codes

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  source: string; // Data source like IBGE, ISO 3166, FIPS, NASA, NOAA, USER PROVIDED

  @Column({
    type: DataType.DATE,
  })
  start_date: Date; // Optional: The date when this spatial data became valid

  @Column({
    type: DataType.JSONB,
  })
  metadata: object; // Optional: Stores additional relevant informantion of the spatial data, for example: adicional references, names or codes

  @Column({
    type: DataType.ENUM(
      'country',
      'state',
      'province',
      'region',
      'county',
      'district',
      'municipality',
      'city',
      'town',
      'village',
      'neighborhood',
      'subdistrict',
      'street'
    ),
    allowNull: false,
  })
  level:
    | 'country' // admin_level=2
    | 'state' // admin_level=4
    | 'province' // admin_level=4
    | 'region' // admin_level=4
    | 'county' // admin_level=6
    | 'district' // admin_level=6
    | 'municipality' // admin_level=8
    | 'city' // admin_level=8
    | 'town' // admin_level=8
    | 'village' // admin_level=8
    | 'neighborhood' // admin_level=10
    | 'subdistrict' // admin_level=10
    | 'street'; // admin_level=12

  @Column({
    type: DataType.GEOMETRY('GEOMETRY', 4326), // Stores geospatial data as either POINT, POLYGON or MULTI POLYGON
    allowNull: false,
  })
  raw_geometry: Geometry;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  raw_srs: string;

  @Column({
    type: DataType.GEOMETRY('GEOMETRY', 4326), // Stores geospatial data as either POINT, POLYGON or MULTI POLYGON
    allowNull: false,
  })
  geometry: Geometry;

  @ForeignKey(() => {
    return CoreFile;
  })
  @Column({
    type: DataType.INTEGER,
  })
  core_file_id: number;

  /**
   * References
   */
  @HasMany(() => {
    return AggradaObservation;
  })
  aggrada_observation: AggradaObservation[];
}
