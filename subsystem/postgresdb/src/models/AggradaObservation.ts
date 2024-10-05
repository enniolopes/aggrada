import { AggradaSpatial } from './AggradaSpatial';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from '@ttoss/postgresdb';
import { CoreFile } from './CoreFile';

@Table({
  indexes: [
    {
      fields: ['temporal_range'],
      using: 'GIST',
      name: 'aggrada_observation_temporal_gist',
    },
  ],
})
export class AggradaObservation extends Model {
  @ForeignKey(() => {
    return AggradaSpatial;
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false, // Every observation must be tied to spatial data
  })
  aggrada_spatial_id: number;

  @BelongsTo(() => {
    return AggradaSpatial;
  })
  aggrada_spatial: AggradaSpatial;

  @Column({
    type: DataType.RANGE(DataType.DATE),
    allowNull: false,
  })
  temporal_range: Date[];

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  data: object; // Stores observation data

  @ForeignKey(() => {
    return CoreFile;
  })
  @Column({
    type: DataType.INTEGER,
    // allowNull: false,
  })
  core_file_id: number;

  // @BelongsTo(() => {
  //   return CoreFile;
  // })
  // core_file: CoreFile;
}
