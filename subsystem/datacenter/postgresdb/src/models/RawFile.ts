import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { RawDataset } from './RawDataset';

@Table
export class RawFile extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  filename!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  filepath!: string;

  @Column({
    type: DataType.INTEGER,
  })
  file_size!: number;

  @Column({
    type: DataType.STRING,
  })
  file_type!: string;

  @ForeignKey(() => {
    return RawDataset;
  })
  @Column
  dataset_id!: number;

  @BelongsTo(() => {
    return RawDataset;
  })
  dataset!: RawDataset;
}
