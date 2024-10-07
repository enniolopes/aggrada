import { Column, DataType, Model, Table } from '@ttoss/postgresdb';

@Table
export class CoreOauthToken extends Model {
  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  token: any;
}
