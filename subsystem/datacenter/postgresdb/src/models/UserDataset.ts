import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { RawDataset } from './RawDataset';
import { User } from './User';

@Table
export class UserDataset extends Model {
  @ForeignKey(() => {
    return User;
  })
  @Column
  user_id!: number;

  @ForeignKey(() => {
    return RawDataset;
  })
  @Column
  dataset_id!: number;

  @Column({
    type: 'VARCHAR',
    allowNull: false,
  })
  permission_level!: string; // Ex.: 'read', 'write', 'admin'
}
