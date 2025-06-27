import { Column, DataType, ForeignKey, Model, Table } from '@ttoss/postgresdb';

import { AggradaSpatial } from './AggradaSpatial';

@Table({
  tableName: 'aggrada_aggregateds',
  underscored: true,
  freezeTableName: true,
  indexes: [
    // Índice para o ON CONFLICT (chave composta única)
    {
      fields: [
        'spatial_id',
        'spatial_geo_code',
        'spatial_subdivision',
        'time_start_date',
        'time_end_date',
        'key',
      ],
      unique: true,
      name: 'idx_aggrada_aggregateds_conflict',
    },
    // Índices para consultas por log_id
    {
      fields: ['log_id'],
      name: 'idx_aggrada_aggregateds_log_id',
    },
    // Índices para consultas temporais
    {
      fields: ['time_start_date', 'time_end_date'],
      name: 'idx_aggrada_aggregateds_temporal',
    },
    // Índice para spatial_id (FK)
    {
      fields: ['spatial_id'],
      name: 'idx_aggrada_aggregateds_spatial_id',
    },
  ],
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
