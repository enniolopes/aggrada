import { AggRaDaEntity } from './AggRaDaEntity';
import { AggRaDaSpatial } from './AggRaDaSpatial';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CoreFile } from './CoreFile';
import { CoreLog } from './CoreLog';

@Table({
  timestamps: false, // temporal_index attribute manage own timestamps and Log manage the create and update dates
  indexes: [
    {
      fields: ['temporal_range'],
      using: 'GIST',
      name: 'aggrada_observation_temporal_gist',
    },
  ],
})
export class AggRaDaObservation extends Model {
  @ForeignKey(() => {
    return AggRaDaSpatial;
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false, // Every observation must be tied to spatial data
  })
  aggrada_spatial_id: number;

  @BelongsTo(() => {
    return AggRaDaSpatial;
  })
  aggRaDaSpatial: AggRaDaSpatial;

  @ForeignKey(() => {
    return AggRaDaEntity;
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: true, // Observations can optionally reference an entity
  })
  entity_id!: number;

  @BelongsTo(() => {
    return AggRaDaEntity;
  })
  aggRaDaEntity: AggRaDaEntity;

  @Column({
    type: DataType.RANGE(DataType.DATE),
    allowNull: false,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  temporal_range: any;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  data: object; // Stores observation data

  @ForeignKey(() => {
    return CoreLog;
  })
  @Column({
    type: DataType.INTEGER,
    // allowNull: false,
  })
  coreLog_id!: number;

  @BelongsTo(() => {
    return CoreLog;
  })
  coreLog!: CoreLog;

  @ForeignKey(() => {
    return CoreFile;
  })
  @Column({
    type: DataType.INTEGER,
    // allowNull: false,
  })
  core_file_id!: number;

  @BelongsTo(() => {
    return CoreFile;
  })
  CoreFile!: CoreFile;
}
