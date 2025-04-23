import { AggradaSpatial } from './AggradaSpatial';
import { Table, Column, DataType, ForeignKey, Model } from '@ttoss/postgresdb';

@Table({
  tableName: 'aggrada_aggregateds',
  underscored: true,
  freezeTableName: true,
})
export class AggradaAggregated extends Model<AggradaAggregated> {
  /**
   * Metadata
   */
  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare aggregationParams?: Record<string, unknown>;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare logId?: string;

  /**
   * Spatial keys
   */
  @ForeignKey(() => AggradaSpatial)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  declare spatialId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  declare spatialGeoCode: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare spatialName?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  declare spatialSubdivision: string;

  /**
   * Time keys
   */
  @Column({
    type: DataType.DATE,
    allowNull: false,
    primaryKey: true,
  })
  declare timeStartDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    primaryKey: true,
  })
  declare timeEndDate: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare timeLabel?: string;

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
