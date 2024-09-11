import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { CoreFileCollectionUser } from './CoreFileCollectionUser';
import { CoreLog } from './CoreLog';

@Table
export class CoreUser extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password_hash: string;

  @Column({
    type: DataType.STRING,
  })
  name!: string;

  /**
   * References
   */
  @HasMany(() => {
    return CoreLog;
  })
  coreLog!: CoreLog[];

  @HasMany(() => {
    return CoreFileCollectionUser;
  })
  coreFileCollectionUser!: CoreFileCollectionUser[];
}
