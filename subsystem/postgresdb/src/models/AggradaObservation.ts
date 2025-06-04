import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from '@ttoss/postgresdb';

import { AggradaSpatial } from './AggradaSpatial';

/**
 * Interface for observation data structure
 * Defines the expected shape of the data field
 */
interface ObservationData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Flexible structure to accommodate various observation types
}

type DateDB = Date | String;

/**
 * AggradaObservation represents a time-series observation tied to a spatial entity.
 * Each observation has both timezone-aware and UTC timestamps, and contains
 * observation data in a flexible JSONB structure.
 *
 * - temporal_range_tz stores dates with timezone information
 * - temporal_range stores UTC dates for standardized queries
 * - data field stores the actual observation values
 */
@Table({
  tableName: 'aggrada_observations',
  underscored: true,
  freezeTableName: true,
  indexes: [
    {
      fields: ['temporal_range_tz'],
      using: 'GIST',
      name: 'aggrada_observations_temporal_range_tz_gist',
    },
    {
      fields: ['temporal_range'],
      using: 'GIST',
      name: 'aggrada_observations_temporal_range_gist',
    },
  ],
})
export class AggradaObservation extends Model {
  @ForeignKey(() => {
    return AggradaSpatial;
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false, // Every observation must be tied to spatial data
  })
  aggrada_spatials_id: number;

  @BelongsTo(() => {
    return AggradaSpatial;
  })
  aggrada_spatials: AggradaSpatial;

  @Column({
    type: DataType.RANGE(DataType.DATE),
    allowNull: false,
  })
  temporal_range_tz: [DateDB,DateDB];

  @Column({
    type: DataType.RANGE(DataType.DATE),
    allowNull: false,
  })
  temporal_range: [DateDB,DateDB];

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  data: ObservationData; // Stores observation data

  @Column({
    type: DataType.STRING,
  })
  core_file: string;
}
