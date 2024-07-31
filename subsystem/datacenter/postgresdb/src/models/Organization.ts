import { ApiKey } from './ApiKey';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Datalogger } from './Datalogger';

@Table
export class Organization extends Model {
  @HasMany(() => {
    return Datalogger;
  })
  dataLoggers: Datalogger[];

  @HasMany(() => {
    return ApiKey;
  })
  apiKeys: ApiKey[];

  @Column({
    type: DataType.STRING,
  })
  name: string;
}
