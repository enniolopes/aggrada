import { Column, DataType, ForeignKey, Model, Table } from '@ttoss/postgresdb';

import { AggradaSpatial } from './AggradaSpatial';

@Table({
  tableName: 'aggrada_aggregateds',
  underscored: true,
  freezeTableName: true,
})
export class AggradaAggregated extends Model {
  /**
   * Metadata
   */
  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare aggregation_params?: Record<string, unknown>;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare log_id?: string;

  /**
   * Spatial keys
   */
  @ForeignKey(() => {
    return AggradaSpatial;
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  declare spatial_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  declare spatial_geo_code: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare spatial_name?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  declare spatial_subdivision: string;

  /**
   * Time keys
   */
  @Column({
    type: DataType.DATE,
    allowNull: false,
    primaryKey: true,
  })
  declare time_start_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    primaryKey: true,
  })
  declare time_end_date: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare time_label?: string;

  /**
   * Aggregation data
   */
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  declare key: string;

  @Column({
    type: DataType.ARRAY(DataType.TEXT),
    allowNull: false,
    defaultValue: [],
  })
  declare values: string[];
}
