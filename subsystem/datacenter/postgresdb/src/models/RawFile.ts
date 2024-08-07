import {
  // BelongsTo,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({})
export class RawFile extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fileName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  path: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  rawdataset_id: string;
}
