// import {
//   BelongsTo,
//   Column,
//   DataType,
//   ForeignKey,
//   Model,
//   Table,
// } from '@ttoss/postgresdb';
// import { CoreFileCollection } from './CoreFileCollection';

// @Table({
//   tableName: 'core_files',
//   underscored: true,
//   freezeTableName: true,
// })
// export class CoreFile extends Model {

//   @Column({
//     type: DataType.STRING,
//     allowNull: false,
//   })
//   filename: string;

//   @Column({
//     type: DataType.STRING,
//     allowNull: false,
//   })
//   filepath: string;

//   @Column({
//     type: DataType.FLOAT,
//     allowNull: false,
//   })
//   file_size_kb: number;

//   @Column({
//     type: DataType.STRING,
//     allowNull: false,
//   })
//   file_type: string;

//   @Column({
//     type: DataType.STRING,
//     // allowNull: false,
//   })
//   checksum: string;

//   @ForeignKey(() => {
//     return CoreFileCollection;
//   })
//   @Column({
//     type: DataType.INTEGER,
//     // allowNull: false,
//   })
//   core_file_collections_id: number;

//   @BelongsTo(() => {
//     return CoreFileCollection;
//   })
//   core_file_collections: CoreFileCollection;
// }
