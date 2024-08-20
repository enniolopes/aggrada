import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { RawFile } from './RawFile';
import { User } from './User';

@Table
export class RawDataset extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
  })
  description!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  tags!: object;

  @ForeignKey(() => {
    return User;
  })
  @Column
  owner_id!: number;

  @BelongsTo(() => {
    return User;
  })
  owner!: User;

  @HasMany(() => {
    return RawFile;
  })
  files!: RawFile[];
}
