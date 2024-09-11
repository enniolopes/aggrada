import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CoreFileCollection } from './CoreFileCollection';
import { CoreUser } from './CoreUser';

@Table
export class CoreFileCollectionUser extends Model {
  @ForeignKey(() => {
    return CoreUser;
  })
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    primaryKey: true,
  })
  core_user_email: string;

  @BelongsTo(() => {
    return CoreUser;
  })
  coreUser!: CoreUser;

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
  coreFileCollection!: CoreFileCollection;

  @Column({
    type: DataType.ENUM('READ', 'ADMIN', 'OWNER'),
    allowNull: false,
  })
  permission_level: 'READ' | 'ADMIN' | 'OWNER';
}
