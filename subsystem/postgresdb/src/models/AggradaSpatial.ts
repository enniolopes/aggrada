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
    type: DataType.GEOMETRY('GEOMETRY', 4326), // Stores geospatial data as either POINT, POLYGON or MULTI POLYGON
    allowNull: false,
  })
  geometry: object;

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
