import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { DataloggerDataProviderCredential } from './DataloggerDataProviderCredential';
import { Organization } from './Organization';

@Table({})
export class Datalogger extends Model {
  @ForeignKey(() => {
    return Organization;
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  organizationId: number;

  @ForeignKey(() => {
    return DataloggerDataProviderCredential;
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  dataloggerDataProviderCredentialId: number;

  @BelongsTo(() => {
    return DataloggerDataProviderCredential;
  })
  credential: DataloggerDataProviderCredential;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.ENUM('ACTIVE', 'INACTIVE'),
    allowNull: false,
    defaultValue: 'ACTIVE',
  })
  status: 'ACTIVE' | 'INACTIVE';

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  dataProviderConfig: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  operationStartDate: string;
}
