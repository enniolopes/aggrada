import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from '@ttoss/postgresdb';
import { CoreFileCollection } from './CoreFileCollection';
import { CoreUser } from './CoreUser';

@Table
export class CoreFileCollectionUser extends Model {
  @ForeignKey(() => {
    return CoreUser;
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  core_user_id: number;

  @BelongsTo(() => {
    return CoreUser;
  })
  core_user?: CoreUser;

  @ForeignKey(() => {
    return CoreFileCollection;
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  core_file_collection_id: number;

  @BelongsTo(() => {
    return CoreFileCollection;
  })
  core_file_collection?: CoreFileCollection;

  @Column({
    type: DataType.ENUM('READ', 'ADMIN', 'OWNER'),
    allowNull: false,
  })
  permission_level: 'READ' | 'ADMIN' | 'OWNER';
}
