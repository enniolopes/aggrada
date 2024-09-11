import { AggRaDaObservation } from './AggRaDaObservation';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';

@Table
export class AggRaDaEntity extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  entity_name: string; // Name of the entity (e.g., person, object, organization)

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  entity_type: string; // Type of the entity (e.g., "Person", "Organization", "Place")

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata: object; // Additional metadata about the entity

  /**
   * References
   */
  @HasMany(() => {
    return AggRaDaObservation;
  })
  aggRaDaObservation!: AggRaDaObservation[];
}
