import { AggRaDaObservation } from './AggRaDaObservation';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';

@Table({
  timestamps: false,
  indexes: [
    {
      fields: ['geometry'],
      using: 'GIST',
      name: 'aggrada_spatial_geometry_gist',
    },
  ],
})
export class AggRaDaSpatial extends Model {
  @Column({
    type: DataType.STRING,
  })
  place_name!: string; // Optional: name of the place (if it refers to a known location)

  @Column({
    type: DataType.STRING,
  })
  place_code!: string; // Optional: unique code like ISO, FIPS, or other administrative codes

  @Column({
    type: DataType.GEOMETRY('GEOMETRY', 4326), // Stores geospatial data as either POINT or POLYGON
    allowNull: false,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geometry: any;

  @Column({
    type: DataType.DATE,
  })
  start_date!: Date; // The date when this spatial data became valid

  /**
   * References
   */
  @HasMany(() => {
    return AggRaDaObservation;
  })
  aggRaDaObservation!: AggRaDaObservation[];
}
