import {
  // BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from '@ttoss/postgresdb';

import { AggradaSpatial } from './AggradaSpatial';
// fazer com o sequelize, o db está dando referencia circular
// import { db } from '../db';

/**
 * Interface for observation data structure
 * Defines the expected shape of the data field
 */
interface ObservationData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Flexible structure to accommodate various observation types
}

type DateDB = Date | string;

/**
 * AggradaObservation represents a time-series observation tied to a spatial entity.
 * Each observation has both timezone-aware and UTC timestamps, and contains
 * observation data in a flexible JSONB structure.
 *
 * - temporal_range_tz stores dates with timezone information
 * - temporal_range stores UTC dates for standardized queries
 * - data field stores the actual observation values
 * - data_hash provides fast duplicate detection
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
      fields: ['core_file', 'data_hash'],
      unique: true,
      name: 'aggrada_observations_unique_file_data',
    },
    // Índices para performance da query de agregação
    {
      fields: ['temporal_range'],
      using: 'GIST',
      name: 'aggrada_observations_temporal_range_gist',
    },
    {
      fields: ['aggrada_spatials_id'],
      name: 'idx_aggrada_observations_spatial_id',
    },
    {
      fields: ['core_file'],
      name: 'idx_aggrada_observations_core_file',
    },
    {
      fields: ['core_file', 'aggrada_spatials_id'],
      name: 'idx_aggrada_observations_core_spatial',
    },
  ],
  // hooks: {
  //   afterSync: async () => {
  //     // Criar trigger function e trigger automaticamente após sync
  //     try {
  //       console.log('Creating data_hash trigger function...');

  //       // Criar função trigger
  //       await db.sequelize.query(`
  //         CREATE OR REPLACE FUNCTION calculate_aggrada_observation_hash()
  //         RETURNS TRIGGER AS $$
  //         BEGIN
  //             -- Calcular hash SHA-256 dos dados combinados (data + core_file)
  //             NEW.data_hash := encode(
  //                 sha256(
  //                     convert_to(
  //                         jsonb_build_object(
  //                             'data', COALESCE(NEW.data, '{}'::jsonb),
  //                             'file', COALESCE(NEW.core_file, '')
  //                         )::text,
  //                         'UTF8'
  //                     )
  //                 ),
  //                 'hex'
  //             );

  //             RETURN NEW;
  //         END;
  //         $$ LANGUAGE plpgsql;
  //       `);

  //       // Remover trigger existente se houver
  //       await db.sequelize.query(`
  //         DROP TRIGGER IF EXISTS trigger_calculate_aggrada_observation_hash ON aggrada_observations;
  //       `);

  //       // Criar trigger
  //       await db.sequelize.query(`
  //         CREATE TRIGGER trigger_calculate_aggrada_observation_hash
  //             BEFORE INSERT OR UPDATE ON aggrada_observations
  //             FOR EACH ROW
  //             EXECUTE FUNCTION calculate_aggrada_observation_hash();
  //       `);

  //       // Atualizar registros existentes que não têm data_hash
  //       const updateResult = (await db.sequelize.query(`
  //         UPDATE aggrada_observations
  //         SET data_hash = encode(
  //             sha256(
  //                 convert_to(
  //                     jsonb_build_object(
  //                         'data', COALESCE(data, '{}'::jsonb),
  //                         'file', COALESCE(core_file, '')
  //                     )::text,
  //                     'UTF8'
  //                 )
  //             ),
  //             'hex'
  //         )
  //         WHERE (data_hash IS NULL OR data_hash = '')
  //           AND data IS NOT NULL;
  //       `)) as [unknown, { rowCount?: number }];

  //       // Criar índice GIN para operações JSONB após criação da função trigger
  //       console.log('Creating JSONB index for data operations...');
  //       await db.sequelize.query(`
  //         CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_aggrada_observations_data_gin
  //         ON aggrada_observations USING GIN (data);
  //       `);

  //       console.log('Trigger function and trigger created successfully');
  //       console.log(
  //         `Updated ${updateResult[1].rowCount || 0} existing records with data_hash`
  //       );
  //     } catch (error) {
  //       console.error('Error creating trigger:', error);
  //       // Não falhamos o sync por causa disso, apenas logamos o erro
  //     }
  //   },
  // },
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

  // @BelongsTo(() => {
  //   return AggradaSpatial;
  // })
  // aggrada_spatials: AggradaSpatial;

  @Column({
    type: DataType.RANGE(DataType.DATE),
    allowNull: false,
  })
  temporal_range_tz: [DateDB, DateDB];

  @Column({
    type: DataType.RANGE(DataType.DATE),
    allowNull: false,
  })
  temporal_range: [DateDB, DateDB];

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  data: ObservationData; // Stores observation data

  @Column({
    type: DataType.STRING,
  })
  core_file: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    // Campo calculado automaticamente pelo trigger do PostgreSQL
    defaultValue: '', // Será sobrescrito pelo trigger
  })
  data_hash: string;
}
