import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { RawDataset } from './RawDataset';

@Table
export class User extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password_hash!: string;

  @Column({
    type: DataType.STRING,
  })
  name!: string;

  @HasMany(() => {
    return RawDataset;
  })
  datasets!: RawDataset[];
}
