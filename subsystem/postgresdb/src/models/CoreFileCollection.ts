import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { CoreFile } from './CoreFile';
import { CoreFileCollectionUser } from './CoreFileCollectionUser';

@Table
export class CoreFileCollection extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.ENUM('PUBLIC', 'PRIVATE'),
    allowNull: false,
  })
  privacy: 'PUBLIC' | 'PRIVATE';

  @Column({
    type: DataType.BOOLEAN,
  })
  isRaw!: boolean;

  @Column({
    type: DataType.TEXT,
  })
  description!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  tags!: string[];

  /**
   * References
   */
  @HasMany(() => {
    return CoreFile;
  })
  coreFile!: CoreFile[];

  @HasMany(() => {
    return CoreFileCollectionUser;
  })
  coreFileCollectionUser!: CoreFileCollectionUser[];
}
