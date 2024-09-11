import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CoreUser } from './CoreUser';

@Table
export class CoreLog extends Model {
  @Column({
    type: DataType.ENUM('INFO', 'WARN', 'ERROR', 'DEBUG', 'TRACE'),
    allowNull: false,
  })
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'TRACE';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  message: string;

  @Column({
    type: DataType.STRING,
  })
  source!: string;

  @Column({
    type: DataType.JSONB,
  })
  context!: object;

  @ForeignKey(() => {
    return CoreUser;
  })
  @Column({
    type: DataType.TEXT,
  })
  core_user_email!: string;

  @ForeignKey(() => {
    return CoreLog;
  })
  @Column({
    type: DataType.INTEGER,
  })
  related_coreLog_id!: number;
}
