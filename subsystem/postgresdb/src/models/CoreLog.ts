import { Column, DataType, ForeignKey, Model, Table } from '@ttoss/postgresdb';
import { CoreUser } from './CoreUser';

@Table
export class CoreLog extends Model {
  @Column({
    type: DataType.ENUM('INFO', 'WARN', 'ERROR', 'DEBUG', 'TRACE'),
    allowNull: false,
  })
  type: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'TRACE';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  message: string;

  @Column({
    type: DataType.STRING,
  })
  source: string;

  @Column({
    type: DataType.JSONB,
  })
  context: object;

  @ForeignKey(() => {
    return CoreUser;
  })
  @Column({
    type: DataType.INTEGER,
  })
  core_user_id: number;

  @ForeignKey(() => {
    return CoreLog;
  })
  @Column({
    type: DataType.INTEGER,
  })
  related_core_log_id: number;
}
